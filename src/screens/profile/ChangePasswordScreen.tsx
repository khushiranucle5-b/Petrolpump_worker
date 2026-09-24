/**
 * Change Password Screen
 * Verifies existing password and securely sets new credentials.
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { isValidPassword } from '../../utils/validation';
import { RootStackParamList } from '../../types/navigation';

export const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    setErrorMessage('');

    if (!currentPassword) {
      errs.currentPassword = 'Enter your current password';
    }

    const passCheck = isValidPassword(newPassword);
    if (!passCheck.valid) {
      errs.newPassword = passCheck.error || 'Password must be at least 6 characters';
    }

    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'New passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      Alert.alert('Success', res.message || 'Password updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password.');
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
        title="Change Password"
        showBack
        onBackPress={() => navigation.goBack()}
        variant="dark"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={[typography.h4, styles.title]}>Security Credentials</Text>
          <Text style={[typography.bodySmall, styles.subtitle]}>
            Ensure your worker account is secured with a strong password.
          </Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Icon name="alert-circle" size={18} color={colors.dangerDark} />
              <Text style={[typography.bodySmall, styles.errorText]}>{errorMessage}</Text>
            </View>
          ) : null}

          <Input
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            onChangeText={t => {
              setCurrentPassword(t);
              if (errors.currentPassword) setErrors({ ...errors, currentPassword: '' });
            }}
            error={errors.currentPassword}
            leftIcon="lock"
            isPassword
            required
          />

          <Input
            label="New Password"
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChangeText={t => {
              setNewPassword(t);
              if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
            }}
            error={errors.newPassword}
            leftIcon="lock"
            isPassword
            required
          />

          <Input
            label="Confirm New Password"
            placeholder="Re-enter new password"
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
            title="UPDATE PASSWORD"
            onPress={handleUpdate}
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
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

export default ChangePasswordScreen;
