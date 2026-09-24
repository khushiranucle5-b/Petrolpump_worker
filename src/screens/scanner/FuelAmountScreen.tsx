/**
 * Fuel Amount Input Screen
 * Accepts fuel purchase amount, calculates instant discount breakdown,
 * validates numerical rules, and prepares transaction payload.
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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { AmountDisplay } from '../../components/common/AmountDisplay';
import { Icon } from '../../components/common/Icon';
import { computeDiscountBreakdown } from '../../utils/formatters';
import { validateFuelAmount } from '../../utils/validation';
import { RootStackParamList } from '../../types/navigation';

export const FuelAmountScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FuelAmount'>>();

  const { customer, qrSessionId, discountPercentage } = route.params;

  const [fuelAmountText, setFuelAmountText] = useState<string>('1000');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const parsedAmount = Number(fuelAmountText) || 0;
  const { discountAmount, finalAmount } = computeDiscountBreakdown(
    parsedAmount,
    discountPercentage
  );

  const quickAmounts = [500, 1000, 1500, 2000, 3000, 5000];

  const handleQuickAmountSelect = (val: number) => {
    setFuelAmountText(val.toString());
    setErrorMessage('');
  };

  const handleProceed = () => {
    const validation = validateFuelAmount(fuelAmountText);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please enter a valid fuel amount');
      return;
    }

    setErrorMessage('');
    navigation.navigate('RedemptionConfirmation', {
      customer,
      qrSessionId,
      discountPercentage,
      fuelAmount: validation.amount,
      discountAmount,
      finalAmount,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title="Fuel Amount"
        subtitle={`Customer: ${customer.fullName}`}
        showBack
        onBackPress={() => navigation.goBack()}
        variant="dark"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Customer Mini Header */}
        <View style={styles.customerMiniCard}>
          <View style={styles.customerInfo}>
            <Text style={[typography.h4, styles.customerName]} numberOfLines={1}>
              {customer.fullName}
            </Text>
            <Text style={[typography.caption, styles.customerGroup]} numberOfLines={1}>
              {customer.group.groupName} • {customer.group.groupType}
            </Text>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{discountPercentage}% OFF</Text>
          </View>
        </View>

        {/* Fuel Amount Input Card */}
        <View style={styles.inputCard}>
          <Text style={[typography.label, styles.inputCardLabel]}>
            ENTER DISPENSED FUEL AMOUNT
          </Text>

          <Input
            prefix="₹"
            placeholder="0.00"
            value={fuelAmountText}
            onChangeText={t => {
              setFuelAmountText(t);
              if (errorMessage) setErrorMessage('');
            }}
            keyboardType="decimal-pad"
            error={errorMessage}
            inputStyle={[typography.amountHero, styles.amountInputText]}
            containerStyle={styles.inputWrapper}
            autoFocus
          />

          {/* Quick Amount Presets */}
          <Text style={[typography.caption, styles.presetLabel]}>
            QUICK PRESETS:
          </Text>
          <View style={styles.presetGrid}>
            {quickAmounts.map(amt => (
              <TouchableOpacity
                key={amt}
                onPress={() => handleQuickAmountSelect(amt)}
                style={[
                  styles.presetChip,
                  parsedAmount === amt && styles.presetChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.presetText,
                    parsedAmount === amt && styles.presetTextActive,
                  ]}
                >
                  ₹{amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Calculated Breakdown Display */}
        {parsedAmount > 0 && (
          <View style={styles.breakdownSection}>
            <AmountDisplay
              fuelAmount={parsedAmount}
              discountPercentage={discountPercentage}
              discountAmount={discountAmount}
              finalAmount={finalAmount}
              variant="card"
            />
          </View>
        )}

        {/* Continue Button */}
        <Button
          title="REVIEW REDEMPTION"
          onPress={handleProceed}
          variant="accent"
          size="lg"
          rightIcon="arrow-right"
          style={styles.proceedBtn}
        />
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
  customerMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  customerInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  customerName: {
    color: colors.textPrimary,
  },
  customerGroup: {
    color: colors.cyanDark,
    fontWeight: '600',
    marginTop: 2,
  },
  discountBadge: {
    backgroundColor: colors.accent,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.round,
  },
  discountBadgeText: {
    ...typography.badge,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  inputCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  inputCardLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    marginBottom: spacing.sm,
  },
  amountInputText: {
    color: colors.primary,
    fontWeight: '800',
    paddingVertical: 0,
  },
  presetLabel: {
    color: colors.textMuted,
    fontWeight: '700',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  presetChip: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  presetChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    ...typography.buttonSmall,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  presetTextActive: {
    color: colors.accent,
  },
  breakdownSection: {
    marginBottom: spacing.lg,
  },
  proceedBtn: {
    marginTop: spacing.xs,
  },
});

export default FuelAmountScreen;
