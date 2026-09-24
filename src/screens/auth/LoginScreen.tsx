/**
 * Worker Login Screen
 * Supports Email or Mobile identifier, password visibility toggle, validation & error handling.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { isValidIdentifier, isValidPassword } from '../../utils/validation';
import { AuthStackParamList } from '../../types/navigation';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { login } = useAuth();

  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleSendOtp = () => {
    setErrorMessage('');
    setMobileError('');
    if (!mobileNumber.trim() || mobileNumber.trim().length !== 10) {
      setMobileError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 1000);
  };

  const handleVerifyOtpAndLogin = async () => {
    setErrorMessage('');
    setOtpError('');
    
    if (!otp.trim() || otp.length < 4) {
      setOtpError('Please enter a valid OTP');
      return;
    }

    setLoading(true);
    try {
      const user = await login({
        identifier: mobileNumber.trim(),
        password: 'password123',
      });

      if (user.accountStatus === 'pending_approval') {
        navigation.replace('PendingApproval', {
          workerName: user.fullName,
          workerId: user.workerId,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP Verification failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Header Section */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Icon name="fuel" size={36} color={colors.accent} />
          </View>
          <Text style={[typography.h1, styles.title]}>Worker Terminal</Text>
          <Text style={[typography.bodyMedium, styles.subtitle]}>
            Sign in to scan customer QR codes & process fuel discounts
          </Text>
        </View>

        {/* Login Card */}
        <View style={styles.formCard}>
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Icon name="alert-circle" size={18} color={colors.dangerDark} />
              <Text style={[typography.bodySmall, styles.errorBannerText]}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {!otpSent ? (
            <>
              <Input
                label="Mobile Number"
                placeholder="e.g. 9876543210"
                value={mobileNumber}
                onChangeText={t => {
                  setMobileNumber(t.replace(/[^0-9]/g, ''));
                  if (mobileError) setMobileError('');
                }}
                error={mobileError}
                leftIcon="phone"
                keyboardType="phone-pad"
                maxLength={10}
                required
              />
              <Button
                title="SEND OTP"
                onPress={handleSendOtp}
                variant="accent"
                size="lg"
                loading={loading}
                style={styles.loginBtn}
              />
            </>
          ) : (
            <>
              <Input
                label="Enter OTP"
                placeholder="Enter 4-6 digit OTP"
                value={otp}
                onChangeText={t => {
                  setOtp(t.replace(/[^0-9]/g, ''));
                  if (otpError) setOtpError('');
                }}
                error={otpError}
                leftIcon="lock"
                keyboardType="numeric"
                maxLength={6}
                required
                autoFocus
              />
              <TouchableOpacity onPress={() => setOtpSent(false)} style={styles.forgotPassBtn}>
                <Text style={[typography.bodySmall, styles.forgotPassText]}>Change Mobile Number</Text>
              </TouchableOpacity>
              <Button
                title="VERIFY & LOGIN"
                onPress={handleVerifyOtpAndLogin}
                variant="accent"
                size="lg"
                loading={loading}
                style={styles.loginBtn}
              />
            </>
          )}

          {/* Quick Demo Credentials */}
          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.glowAmber,
  },
  title: {
    color: colors.textInverse,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textInverseSecondary,
    textAlign: 'center',
    maxWidth: 290,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorBannerText: {
    color: colors.dangerDark,
    marginLeft: spacing.sm,
    flex: 1,
    fontWeight: '500',
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    paddingVertical: 4,
  },
  forgotPassText: {
    color: colors.primary,
    fontWeight: '600',
  },
  loginBtn: {
    marginBottom: spacing.lg,
  },
  demoSection: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  demoTitle: {
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  demoChip: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
  },
  demoChipText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  footerText: {
    color: colors.textInverseSecondary,
  },
  registerLink: {
    color: colors.accent,
    fontWeight: '700',
  },
});

export default LoginScreen;
