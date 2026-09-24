/**
 * Amount Display & Discount Breakdown Component
 * Highlights original Fuel Amount, Group Discount %, Savings Amount, and Final Payable Amount.
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { formatCurrency } from '../../utils/formatters';

interface AmountDisplayProps {
  fuelAmount: number;
  discountPercentage: number;
  discountAmount: number;
  finalAmount: number;
  style?: ViewStyle;
  variant?: 'card' | 'compact' | 'hero';
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  fuelAmount,
  discountPercentage,
  discountAmount,
  finalAmount,
  style,
  variant = 'card',
}) => {
  if (variant === 'compact') {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.row}>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>Fuel Total:</Text>
          <Text style={[typography.bodyMedium, { fontWeight: '600', color: colors.textPrimary }]}>
            {formatCurrency(fuelAmount)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodySmall, { color: colors.accentDark }]}>
            Discount ({discountPercentage}%):
          </Text>
          <Text style={[typography.bodyMedium, { fontWeight: '600', color: colors.accentDark }]}>
            -{formatCurrency(discountAmount)}
          </Text>
        </View>
        <View style={[styles.row, styles.compactDivider]}>
          <Text style={[typography.bodyMedium, { fontWeight: '700', color: colors.textPrimary }]}>
            Final Payable:
          </Text>
          <Text style={[typography.amountMedium, { color: colors.successDark }]}>
            {formatCurrency(finalAmount)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.cardContainer, style]}>
      {/* Header Banner */}
      <View style={styles.headerRow}>
        <Text style={[typography.label, { color: colors.textSecondary }]}>
          CALCULATED REDEMPTION
        </Text>
        <View style={styles.discountBadge}>
          <Text style={styles.discountBadgeText}>{discountPercentage}% DISCOUNT</Text>
        </View>
      </View>

      {/* Breakdown Rows */}
      <View style={styles.row}>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
          Entered Fuel Amount
        </Text>
        <Text style={[typography.bodyLarge, { fontWeight: '700', color: colors.textPrimary }]}>
          {formatCurrency(fuelAmount)}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.discountLabelRow}>
          <Text style={[typography.bodyMedium, { color: colors.accentDark }]}>
            Group Savings ({discountPercentage}%)
          </Text>
        </View>
        <Text style={[typography.bodyLarge, { fontWeight: '700', color: colors.accentDark }]}>
          - {formatCurrency(discountAmount)}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Final Amount Highlight */}
      <View style={styles.finalRow}>
        <View>
          <Text style={[typography.label, { color: colors.textSecondary }]}>
            COLLECT FROM CUSTOMER
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Inclusive of all taxes & discounts
          </Text>
        </View>
        <Text style={[typography.amountLarge, styles.finalAmountText]}>
          {formatCurrency(finalAmount)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  discountBadge: {
    backgroundColor: colors.accent,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.round,
  },
  discountBadgeText: {
    ...typography.badge,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  discountLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
    borderStyle: 'dashed',
  },
  finalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  finalAmountText: {
    color: colors.primary,
  },
  compactContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  compactDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
});
