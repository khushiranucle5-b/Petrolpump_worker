/**
 * Forgot Password Screen
 * Requests password reset OTP code.
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
import { isValidIdentifier } from '../../utils/validation';
import { AuthStackParamList } from '../../types/navigation';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'ForgotPassword'>>();

  const [identifier, setIdentifier] = useState(route.params?.prefillIdentifier || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    setError('');
    if (!identifier.trim()) {
      setError('Please enter your registered email or mobile number');
      return;
    }

    if (!isValidIdentifier(identifier)) {
      setError('Please enter a valid email or 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.forgotPassword({ identifier: identifier.trim() });
      Alert.alert(
        'Reset Code Sent',
        result.message || 'Check your messages for the 6-digit OTP code (Demo code: 123456)',
        [
          {
            text: 'Enter OTP',
            onPress: () =>
              navigation.navigate('ResetPassword', { identifier: identifier.trim() }),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Unable to send password reset code.');
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
        title="Reset Password"
        showBack
        onBackPress={() => navigation.goBack()}
        variant="dark"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconCircle}>
          <Icon name="lock" size={36} color={colors.accent} />
        </View>

        <Text style={[typography.h2, styles.title]}>Forgot Password?</Text>
        <Text style={[typography.bodyMedium, styles.subtitle]}>
          Enter your registered employee email or mobile number to receive a one-time reset code.
        </Text>

        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBanner}>
              <Icon name="alert-circle" size={16} color={colors.dangerDark} />
              <Text style={[typography.bodySmall, styles.errorText]}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Email or Mobile Number"
            placeholder="e.g. vikram@pump.com or 9876543210"
            value={identifier}
            onChangeText={t => {
              setIdentifier(t);
              if (error) setError('');
            }}
            leftIcon="mail"
            autoCapitalize="none"
            required
          />

          <Button
            title="SEND RESET CODE"
            onPress={handleSendOTP}
            variant="accent"
            size="lg"
            loading={loading}
            style={styles.sendBtn}
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
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 290,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    width: '100%',
    ...shadows.lg,
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
  sendBtn: {
    marginTop: spacing.sm,
  },
});

export default ForgotPasswordScreen;
