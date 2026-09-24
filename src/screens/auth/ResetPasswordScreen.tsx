/**
 * Reset Password Flow Screen
 * Verifies OTP code and sets a new account password.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icon';
import { AuthService } from '../../services/auth/authService';
import { isValidPassword } from '../../utils/validation';
import { AuthStackParamList } from '../../types/navigation';

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'ResetPassword'>>();

  const identifier = route.params?.identifier || '';

  const [otp, setOtp] = useState('123456'); // Prefilled with test demo code
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    setError('');

    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    const passCheck = isValidPassword(newPassword);
    if (!passCheck.valid) {
      setError(passCheck.error || 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.resetPassword({
        identifier,
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      });

      Alert.alert(
        'Password Reset Successful',
        result.message || 'You can now sign in with your new password.',
        [
          {
            text: 'Sign In',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
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
        title="Set New Password"
        showBack
        onBackPress={() => navigation.goBack()}
        variant="dark"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={[typography.h3, styles.title]}>Create New Password</Text>
          <Text style={[typography.bodySmall, styles.subtitle]}>
            Verification code sent to {identifier || 'your account'}.
          </Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Icon name="alert-circle" size={16} color={colors.dangerDark} />
              <Text style={[typography.bodySmall, styles.errorText]}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="6-Digit OTP Code"
            placeholder="e.g. 123456"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            leftIcon="lock"
            helper="Use demo OTP code: 123456"
            required
          />

          <Input
            label="New Password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChangeText={setNewPassword}
            leftIcon="lock"
            isPassword
            required
          />

          <Input
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            leftIcon="lock"
            isPassword
            required
          />

          <Button
            title="UPDATE PASSWORD & SIGN IN"
            onPress={handleResetPassword}
            variant="accent"
            size="lg"
            loading={loading}
            style={styles.btn}
          />
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
  content: {
    padding: spacing.xl,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.dangerDark,
    marginLeft: spacing.xs,
    flex: 1,
  },
  btn: {
    marginTop: spacing.md,
  },
});

export default ResetPasswordScreen;
