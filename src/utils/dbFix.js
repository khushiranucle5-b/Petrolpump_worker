const { PrismaClient } = require('../../../petrolpump_backend/FuelPoint-backend/node_modules/@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/fuelpoint_db?schema=public"
    }
  }
});

async function run() {
  try {
    const u1 = await prisma.$executeRawUnsafe(
      `UPDATE "WorkerProfile" SET "customId" = 'Nayra' || LPAD(sub.seq::text, 3, '0') FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY "joinedAt" ASC) as seq FROM "WorkerProfile") sub WHERE "WorkerProfile".id = sub.id`
    );
    const u2 = await prisma.$executeRawUnsafe(
      `UPDATE "WorkerProfile" SET "fullName" = 'Khushi' WHERE "fullName" ILIKE '%nayra%' OR "fullName" ILIKE '%test%' OR "fullName" IS NULL`
    );
    console.log('SUCCESSFULLY_UPDATED_DATABASE_WORKER_IDS:', u1, u2);
  } catch (e) {
    console.error('DB_ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
