import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateTokens } from '../../utils/jwt';

const prisma = new PrismaClient();

// In-memory store for OTPs (For production, consider using Redis)
// Format: { "9876543210": { otp: "1234", expiresAt: 1699999999999 } }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

/**
 * 1. Request OTP (Only existing WORKER users)
 */
export const requestOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mobile } = req.body;
    
    // Check if worker exists in the database
    const user = await prisma.user.findFirst({
      where: { mobile, role: 'WORKER' }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Worker not found in database. Cannot login.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Account is pending approval or suspended.' });
    }

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store OTP in memory, valid for 5 minutes
    otpStore.set(mobile, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    // Mock sending message by printing to console
    console.log(`\n📲 [SMS MOCK] Sending OTP to ${mobile}: ${otp}\n`);

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully to registered mobile number.',
      // We can also return it in response for easy testing on frontend
      mockOtpForTesting: otp 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Verify OTP and Login
 */
export const verifyOtpAndLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mobile, otp } = req.body;
    
    const record = otpStore.get(mobile);

    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this mobile number.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(mobile);
      return res.status(400).json({ success: false, message: 'OTP has expired.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    // OTP verified successfully, clear it
    otpStore.delete(mobile);

    // Fetch user with profile
    const user = await prisma.user.findFirst({
      where: { mobile, role: 'WORKER' },
      include: { workerProfile: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Worker not found.' });
    }

    // Generate JWT Tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token: accessToken,
        user: user.workerProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Scan Customer QR Code
 */
export const scanCustomerQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { qrToken } = req.body;
    
    const qrSession = await prisma.qRSession.findUnique({
      where: { token: qrToken },
      include: { 
        customer: {
          include: { group: true }
        }
      }
    });

    if (!qrSession) {
      return res.status(400).json({ success: false, message: 'Invalid QR Code.' });
    }

    if (qrSession.status !== 'ACTIVE' || qrSession.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'QR Code has expired or was already used.' });
    }

    // Update status to 'SCANNED' to reserve it
    await prisma.qRSession.update({
      where: { id: qrSession.id },
      data: { status: 'SCANNED' }
    });

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        qrSessionId: qrSession.id,
        customer: {
          customerId: qrSession.customer.id,
          fullName: qrSession.customer.fullName,
          vehicle: qrSession.customer.vehicle,
          group: qrSession.customer.group?.name
        },
        discountPercentage: qrSession.customer.group?.discountPercent || 0,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Submit Fuel Transaction
 */
export const submitTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { qrSessionId, customerId, fuelAmount, fuelType, petrolPumpId } = req.body;

    const worker = await prisma.workerProfile.findUnique({ where: { userId } });
    const qrSession = await prisma.qRSession.findUnique({ where: { id: qrSessionId } });
    const customer = await prisma.customerProfile.findUnique({ where: { id: customerId }, include: { group: true } });

    if (!worker || !qrSession || !customer) {
      return res.status(400).json({ success: false, message: 'Invalid transaction data or entities not found.' });
    }

    if (qrSession.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'QR code was already used for a transaction.' });
    }

    // Calculate discounts
    const discountPercent = customer.group?.discountPercent || 0;
    const discountAmount = (fuelAmount * discountPercent) / 100;
    const finalAmount = fuelAmount - discountAmount;
    
    // Assume a static price per litre (e.g., 100) if not dynamically passed
    const assumedPricePerLitre = 100; 
    const litres = fuelAmount / assumedPricePerLitre;

    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Create the transaction record
      const newTx = await tx.transaction.create({
        data: {
          customerId: customer.id,
          workerId: worker.id,
          stationId: petrolPumpId || worker.stationId || 'default-station',
          fuelType: fuelType || 'Petrol',
          amount: fuelAmount,
          discountPercent,
          discountAmount,
          finalAmount,
          litres
        }
      });

      // 2. Mark QR session as completely consumed
      await tx.qRSession.update({
        where: { id: qrSession.id },
        data: { status: 'COMPLETED', consumedAt: new Date() }
      });

      return newTx;
    });

    res.status(200).json({
      success: true,
      message: 'Transaction completed successfully.',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. View Today's Transactions (Summary & List)
 */
export const getTodayTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const worker = await prisma.workerProfile.findUnique({ where: { userId } });
    
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }

    // Set time to start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch the list of today's transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        workerId: worker.id,
        createdAt: { gte: today },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { fullName: true, vehicle: true }
        }
      }
    });

    // Fetch summary aggregates
    const stats = await prisma.transaction.aggregate({
      where: {
        workerId: worker.id,
        createdAt: { gte: today },
        status: 'COMPLETED'
      },
      _count: { id: true },
      _sum: { amount: true, discountAmount: true, finalAmount: true, litres: true }
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          transactionCount: stats._count.id,
          totalLitres: stats._sum.litres || 0,
          totalFuelAmount: stats._sum.amount || 0,
          totalDiscountAmount: stats._sum.discountAmount || 0,
          totalFinalAmount: stats._sum.finalAmount || 0
        },
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Get Worker Profile
 */
export const getWorkerProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    
    // Fetch the user along with their worker profile and station details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        workerProfile: {
          include: { station: true }
        }
      }
    });

    if (!user || !user.workerProfile) {
      return res.status(404).json({ success: false, message: 'Worker profile not found.' });
    }

    res.status(200).json({ 
      success: true, 
      data: user.workerProfile 
    });
  } catch (error) {
    next(error);
  }
};
