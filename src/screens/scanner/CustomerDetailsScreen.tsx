/**
 * Customer & Discount Verification Screen
 * Complete unified flow on the same page:
 * 1. Customer & Group Discount Details
 * 2. OTP Verification
 * 3. Fuel Amount Entry
 * 4. Discount Calculation
 * 5. Instant Redemption
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  BackHandler,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

import { Header } from '../../components/common/Header';
import { CustomerCard } from '../../components/customer/CustomerCard';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { QRService } from '../../services/qr/qrService';

import { RootStackParamList } from '../../types/navigation';

export const CustomerDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CustomerDetails'>>();


  const { customer, qrSessionId, discountPercentage } = route.params;

  // --- Step 1: OTP State ---
  const [otpInput, setOtpInput] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // --- Step 2: Fuel Amount State ---
  const [fuelAmountText, setFuelAmountText] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);

  const handleGoBack = () => {
    Alert.alert(
      'Cancel Transaction?',
      'If you go back, the scanned customer data will be cleared and the transaction will be cancelled.',
      [
        { text: 'Keep Scanning', style: 'cancel' },
        { text: 'Cancel Transaction', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleGoBack();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  /**
   * Handle OTP Verification
   */
  const handleVerifyOtp = async () => {
    if (!otpInput.trim()) {
      setOtpError('Please enter the 4-6 digit OTP from customer.');
      return;
    }

    setOtpError(null);
    setIsVerifyingOtp(true);

    try {
      if (otpInput.trim() === '111111') {
        throw new Error('Invalid OTP! Please try again.');
      }

      await QRService.verifyOTP({
        customerId: customer.id,
        qrSessionId,
        otp: otpInput.trim(),
      });
      setIsOtpVerified(true);
    } catch (err: any) {
      setOtpError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  /**
   * Quick preset buttons for fuel amount
   */
  const handleSelectPreset = (amount: number) => {
    setFuelAmountText(amount.toString());
    setAmountError(null);
  };

  /**
   * Handle Fuel Amount change
   */
  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    setFuelAmountText(cleaned);
    setAmountError(null);
  };

  /**
   * Calculate discount and final payable amounts
   */
  const handleCalculate = () => {
    const rawVal = parseFloat(fuelAmountText);

    if (isNaN(rawVal) || rawVal <= 0) {
      setAmountError('Please enter a valid fuel amount greater than ₹0');
      return;
    }

    if (rawVal > 100000) {
      setAmountError('Maximum single dispenser limit is ₹1,00,000');
      return;
    }

    setAmountError(null);
    const discountAmount = Number(((rawVal * discountPercentage) / 100).toFixed(2));
    const finalAmount = Number((rawVal - discountAmount).toFixed(2));

    navigation.navigate('RedemptionConfirmation', {
      customer,
      qrSessionId,
      discountPercentage,
      fuelAmount: rawVal,
      discountAmount,
      finalAmount,
    });
  };



  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="Customer Verification"
        subtitle="Group Discount Authorization"
        showBack
        onBackPress={handleGoBack}
        variant="dark"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Verification Success Pill */}
       

        {/* Customer Information Card */}
        <CustomerCard customer={customer} />

        {/* ==================================================== */}
        {/* SECTION 1: OTP VERIFICATION */}
        {/* ==================================================== */}
        {!isOtpVerified && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.stepCircle, isOtpVerified && styles.stepCircleActive]}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.sectionTitleBox}>
                <Text style={[typography.h3, styles.sectionTitle]}>OTP Verification</Text>
                <Text style={[typography.caption, styles.sectionSubtitle]}>
                  Enter 4-6 digit code provided by customer
                </Text>
              </View>
            </View>

            {/* OTP Input Form */}
            <View style={styles.otpInputContainer}>
              <Text style={[typography.label, styles.inputLabel]}>
                Enter Customer OTP
              </Text>
              <TextInput
                style={[
                  styles.otpInput,
                  otpError ? styles.inputErrorBorder : null,
                ]}
                placeholder="• • • • • •"
                placeholderTextColor={colors.textMuted}
                value={otpInput}
                onChangeText={(val) => {
                  setOtpInput(val.replace(/[^0-9]/g, ''));
                  setOtpError(null);
                }}
                keyboardType="numeric"
                maxLength={6}
                editable={!isVerifyingOtp}
                autoFocus={true}
              />

              {otpError ? (
                <View style={styles.errorRow}>
                  <Icon name="alert-circle" size={14} color={colors.danger} />
                  <Text style={[typography.caption, styles.errorText]}>{otpError}</Text>
                </View>
              ) : null}

              <Button
                title={isVerifyingOtp ? 'VERIFYING...' : 'VERIFY OTP'}
                onPress={handleVerifyOtp}
                variant="accent"
                size="md"
                loading={isVerifyingOtp}
                disabled={!otpInput.trim() || isVerifyingOtp}
                leftIcon="lock"
                style={styles.verifyOtpBtn}
              />
            </View>
          </View>
        )}

        {isOtpVerified && (
          <View style={[styles.otpSuccessCard, { marginTop: spacing.md }]}>
            <View style={styles.otpSuccessIconCircle}>
              <Icon name="check" size={18} color={colors.surface} />
            </View>
            <View style={styles.otpSuccessTexts}>
              <Text style={[typography.label, styles.otpSuccessTitle]}>
                OTP Verified Successfully
              </Text>
              <Text style={[typography.caption, styles.otpSuccessSub]}>
                Customer authorized the transaction
              </Text>
            </View>
          </View>
        )}

        {/* ==================================================== */}
        {/* SECTION 2: FUEL AMOUNT (Revealed after OTP is verified) */}
        {/* ==================================================== */}
        {isOtpVerified && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.sectionTitleBox}>
                <Text style={[typography.h3, styles.sectionTitle]}>Fuel Amount</Text>
                <Text style={[typography.caption, styles.sectionSubtitle]}>
                  Enter total petrol or diesel meter amount
                </Text>
              </View>
            </View>

            <Text style={[typography.label, styles.inputLabel]}>
              Enter Petrol Amount (₹)
            </Text>

            <View style={[styles.amountInputRow, amountError ? styles.inputErrorBorder : null]}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="1000"
                placeholderTextColor={colors.textMuted}
                value={fuelAmountText}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
              />
            </View>

            {amountError ? (
              <View style={styles.errorRow}>
                <Icon name="alert-circle" size={14} color={colors.danger} />
                <Text style={[typography.caption, styles.errorText]}>{amountError}</Text>
              </View>
            ) : null}

            {/* Quick Amount Presets */}
            <View style={styles.presetsRow}>
              {[500, 1000, 2000, 5000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => handleSelectPreset(amt)}
                  style={[
                    styles.presetChip,
                    fuelAmountText === amt.toString() && styles.presetChipActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      fuelAmountText === amt.toString() && styles.presetChipTextActive,
                    ]}
                  >
                    ₹{amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="CALCULATE"
              onPress={handleCalculate}
              variant="primary"
              size="md"
              disabled={!fuelAmountText.trim()}
              leftIcon="percent"
              style={styles.calculateBtn}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.success,
  },
  verifiedTexts: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  verifiedTitle: {
    color: colors.successDark,
  },
  verifiedSubtitle: {
    color: colors.successDark,
    marginTop: 1,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  stepCircleActive: {
    backgroundColor: colors.accent,
  },
  stepNumber: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 13,
  },
  sectionTitleBox: {
    flex: 1,
  },
  sectionTitle: {
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    marginTop: 1,
  },
  inputLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  otpInputContainer: {
    marginTop: spacing.xs,
  },
  otpInput: {
    backgroundColor: colors.surfaceDark,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.textInverse,
  },
  inputErrorBorder: {
    borderColor: colors.danger,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  errorText: {
    color: colors.danger,
    marginLeft: spacing.xs,
  },
  verifyOtpBtn: {
    marginTop: spacing.md,
  },
  otpSuccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.success,
  },
  otpSuccessIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  otpSuccessTexts: {
    flex: 1,
  },
  otpSuccessTitle: {
    color: colors.successDark,
    fontWeight: '800',
  },
  otpSuccessSub: {
    color: colors.successDark,
    marginTop: 1,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceDark,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.accent,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 24,
    fontWeight: '800',
    color: colors.textInverse,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  presetChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipActive: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accent,
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  presetChipTextActive: {
    color: colors.accentDark,
    fontWeight: '800',
  },
  calculateBtn: {
    marginTop: spacing.xs,
  },
  breakdownCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 2,
    borderColor: colors.accent,
    ...shadows.md,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  breakdownTitle: {
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  calcLabel: {
    color: colors.textSecondary,
  },
  calcValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  discountLabel: {
    color: colors.accentDark,
  },
  discountValue: {
    color: colors.accentDark,
    fontWeight: '700',
  },
  finalAmountRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  finalLabel: {
    color: colors.textPrimary,
  },
  finalSub: {
    color: colors.textMuted,
  },
  finalValue: {
    color: colors.successDark,
    fontWeight: '800',
    fontSize: 26,
  },
  redeemBtn: {
    ...shadows.glowAmber,
  },
});

export default CustomerDetailsScreen;
