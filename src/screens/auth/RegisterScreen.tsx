/**
 * Worker Registration Screen
 * Captures Full Name, Mobile, Email, Employee ID, Branch, Password & Confirmation.
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
import { Header } from '../../components/common/Header';
import { CONFIG } from '../../constants/config';
import { isValidEmail, isValidMobile, isValidPassword } from '../../utils/validation';
import { AuthStackParamList } from '../../types/navigation';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Field errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    setErrorMessage('');

    if (!fullName.trim()) {
      errs.fullName = 'Full name is required';
    } else if (fullName.trim().length < 3) {
      errs.fullName = 'Full name must be at least 3 characters';
    }

    if (!mobileNumber.trim()) {
      errs.mobileNumber = 'Mobile number is required';
    } else if (!isValidMobile(mobileNumber)) {
      errs.mobileNumber = 'Enter a valid 10-digit mobile number';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!isValidEmail(email)) {
      errs.email = 'Enter a valid email address';
    }

    const passCheck = isValidPassword(password);
    if (!passCheck.valid) {
      errs.password = passCheck.error || 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await register({
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim(),
        workerId: `EMP-${Math.floor(Math.random() * 9000) + 1000}`,
        petrolPumpId: 'PUMP-DEFAULT',
        petrolPumpName: 'PetrolPump Express Network',
        branchName: 'Main Branch',
        password,
      });

      navigation.replace('PendingApproval', {
        workerName: user.fullName,
        workerId: user.workerId,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title="Worker Registration"
        showBack
        onBackPress={() => navigation.goBack()}
        variant="dark"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.banner}>
          <Text style={[typography.h2, styles.bannerTitle]}>
            Join Pump Attendant Team
          </Text>
          <Text style={[typography.bodySmall, styles.bannerSubtitle]}>
            Create your worker account. Registration requires pump supervisor approval before first shift.
          </Text>
        </View>

        <View style={styles.formCard}>
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Icon name="alert-circle" size={18} color={colors.dangerDark} />
              <Text style={[typography.bodySmall, styles.errorBannerText]}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <Input
            label="Full Name"
            placeholder="e.g. Vikram Singh"
            value={fullName}
            onChangeText={t => {
              setFullName(t);
              if (errors.fullName) setErrors({ ...errors, fullName: '' });
            }}
            error={errors.fullName}
            leftIcon="user"
            required
          />

          <Input
            label="Mobile Number"
            placeholder="e.g. 9876543210"
            value={mobileNumber}
            onChangeText={t => {
              setMobileNumber(t);
              if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: '' });
            }}
            error={errors.mobileNumber}
            leftIcon="phone"
            keyboardType="phone-pad"
            maxLength={10}
            required
          />

          <Input
            label="Email Address"
            placeholder="e.g. worker@petrolpump.com"
            value={email}
            onChangeText={t => {
              setEmail(t);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            error={errors.email}
            leftIcon="mail"
            autoCapitalize="none"
            keyboardType="email-address"
            required
          />

          <Input
            label="Create Password"
            placeholder="Minimum 6 characters"
            value={password}
            onChangeText={t => {
              setPassword(t);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            error={errors.password}
            leftIcon="lock"
            isPassword
            required
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={t => {
              setConfirmPassword(t);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
            }}
            error={errors.confirmPassword}
            leftIcon="lock"
            isPassword
            required
          />

          <Button
            title="SUBMIT REGISTRATION"
            onPress={handleRegister}
            variant="accent"
            size="lg"
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.loginRedirect}>
          <Text style={[typography.bodyMedium, styles.redirectText]}>
            Already have an authorized account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[typography.bodyMedium, styles.loginLink]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
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
    flexGrow: 1,
    padding: spacing.lg,
  },
  banner: {
    marginBottom: spacing.lg,
  },
  bannerTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  bannerSubtitle: {
    color: colors.textSecondary,
    lineHeight: 18,
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
  branchSection: {
    marginBottom: spacing.md,
  },
  branchLabel: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  requiredStar: {
    color: colors.danger,
    fontWeight: '700',
  },
  branchList: {
    gap: spacing.xs,
  },
  branchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  branchOptionSelected: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accent,
  },
  branchText: {
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  branchTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: spacing.md,
  },
  loginRedirect: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    gap: spacing.xs,
  },
  redirectText: {
    color: colors.textSecondary,
  },
  loginLink: {
    color: colors.accent,
    fontWeight: '700',
  },
});

export default RegisterScreen;
