/**
 * Redemption Confirmation Screen
 * Final verification before server-side discount execution.
 * Protects against duplicate submissions using unique idempotency keys.
 */
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { AmountDisplay } from '../../components/common/AmountDisplay';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { TransactionService } from '../../services/transactions/transactionService';
import { RootStackParamList } from '../../types/navigation';

export const RedemptionConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RedemptionConfirmation'>>();
  const { user } = useAuth();

  const {
    customer,
    qrSessionId,
    discountPercentage,
    fuelAmount,
    discountAmount,
    finalAmount,
  } = route.params;

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Generate an idempotency key once per screen load
  const idempotencyKeyRef = useRef<string>(
    `idemp_${qrSessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const handleRedeem = async () => {
    if (loading) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const transaction = await TransactionService.redeem({
        qrSessionId,
        customerId: customer.id,
        fuelAmount,
        workerId: user?.workerId || 'EMP-7842',
        petrolPumpId: user?.petrolPumpId || 'pp-01',
        idempotencyKey: idempotencyKeyRef.current,
      });

      // Navigate to success screen
      navigation.replace('RedemptionSuccess', { transaction });
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Transaction could not be completed. Please retry.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Redemption?',
      'Are you sure you want to cancel this fuel discount transaction?',
      [
        { text: 'No, Keep Going', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => navigation.navigate('MainTabs'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Confirm Redemption"
        subtitle="Review Details Before Submitting"
        showBack
        onBackPress={() => navigation.goBack()}
        variant="dark"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Error Notification Banner */}
        {errorMessage ? (
          <View style={styles.errorCard}>
            <Icon name="alert-circle" size={20} color={colors.dangerDark} />
            <View style={styles.errorTexts}>
              <Text style={[typography.label, styles.errorTitle]}>Submission Error</Text>
              <Text style={[typography.bodySmall, styles.errorMessage]}>
                {errorMessage}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Customer & Station Overview Card */}
        <View style={styles.summaryCard}>
          <View style={styles.row}>
            <Text style={[typography.caption, styles.label]}>CUSTOMER</Text>
            <Text style={[typography.h4, styles.value]}>{customer.fullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[typography.caption, styles.label]}>CUSTOMER ID</Text>
            <Text style={[typography.bodyMedium, styles.value]}>{customer.customerId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[typography.caption, styles.label]}>GROUP / FLEET</Text>
            <Text style={[typography.bodyMedium, styles.groupValue]}>
              {customer.group.groupName} ({customer.group.groupType})
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[typography.caption, styles.label]}>BRANCH TERMINAL</Text>
            <Text style={[typography.bodySmall, styles.value]}>
              {user?.branchName || 'Downtown City Station'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[typography.caption, styles.label]}>ATTENDANT</Text>
            <Text style={[typography.bodySmall, styles.value]}>
              {user?.fullName || 'Worker'} ({user?.workerId || 'EMP-7842'})
            </Text>
          </View>
        </View>

        {/* Calculated Amount Breakdown Display */}
        <AmountDisplay
          fuelAmount={fuelAmount}
          discountPercentage={discountPercentage}
          discountAmount={discountAmount}
          finalAmount={finalAmount}
          variant="card"
          style={styles.amountDisplay}
        />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="CONFIRM & REDEEM"
            onPress={handleRedeem}
            variant="success"
            size="lg"
            loading={loading}
            leftIcon="check-circle"
            style={styles.redeemBtn}
          />

          <Button
            title="Cancel Transaction"
            onPress={handleCancel}
            variant="outline"
            size="md"
            disabled={loading}
            style={styles.cancelBtn}
          />
        </View>
      </ScrollView>
    </View>
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
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorTexts: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  errorTitle: {
    color: colors.dangerDark,
  },
  errorMessage: {
    color: colors.dangerDark,
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  label: {
    color: colors.textMuted,
  },
  value: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  groupValue: {
    color: colors.cyanDark,
    fontWeight: '700',
  },
  amountDisplay: {
    marginBottom: spacing.xl,
  },
  actionButtons: {
    gap: spacing.sm,
  },
  redeemBtn: {
    marginBottom: spacing.xs,
  },
  cancelBtn: {
    borderColor: colors.textMuted,
  },
});

export default RedemptionConfirmationScreen;
