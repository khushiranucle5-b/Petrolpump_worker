/**
 * Transaction Card Component
 * Displays individual transaction summary with customer name, group,
 * fuel amount, discount amount, final amount, date/time, and status.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { formatCurrency, formatTime, formatDate } from '../../utils/formatters';
import { Transaction } from '../../types/transaction';
import { StatusBadge } from '../common/StatusBadge';
import { Icon } from '../common/Icon';

interface TransactionCardProps {
  transaction: Transaction;
  onPress: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.customerInfo}>
          <Text style={[typography.h4, styles.customerName]} numberOfLines={1}>
            {transaction.customerName}
          </Text>
          <Text style={[typography.caption, styles.groupName]} numberOfLines={1}>
            {transaction.groupName}
          </Text>
        </View>
        <StatusBadge status={transaction.status} size="sm" />
      </View>

      <View style={styles.divider} />

      <View style={styles.amountGrid}>
        <View style={styles.amountCol}>
          <Text style={[typography.caption, styles.amountLabel]}>Fuel Total</Text>
          <Text style={[typography.bodyMedium, styles.fuelAmount]}>
            {formatCurrency(transaction.fuelAmount)}
          </Text>
        </View>

        <View style={styles.amountCol}>
          <Text style={[typography.caption, styles.discountLabel]}>
            Discount ({transaction.discountPercentage}%)
          </Text>
          <Text style={[typography.bodyMedium, styles.discountAmount]}>
            -{formatCurrency(transaction.discountAmount)}
          </Text>
        </View>

        <View style={[styles.amountCol, styles.finalCol]}>
          <Text style={[typography.caption, styles.finalLabel]}>Final Paid</Text>
          <Text style={[typography.amountMedium, styles.finalAmount]}>
            {formatCurrency(transaction.finalAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.timeContainer}>
          <Icon name="history" size={12} color={colors.textMuted} />
          <Text style={[typography.caption, styles.timeText]}>
            {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
          </Text>
        </View>
        <View style={styles.arrowRow}>
          <Text style={[typography.caption, styles.txnIdText]}>
            {transaction.transactionId}
          </Text>
          <Icon name="chevron-right" size={14} color={colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  customerName: {
    color: colors.textPrimary,
  },
  groupName: {
    color: colors.cyanDark,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  amountGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  amountCol: {
    flex: 1,
  },
  finalCol: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    color: colors.textMuted,
  },
  fuelAmount: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  discountLabel: {
    color: colors.accentDark,
  },
  discountAmount: {
    color: colors.accentDark,
    fontWeight: '600',
  },
  finalLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  finalAmount: {
    color: colors.primary,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: colors.textMuted,
    marginLeft: spacing.xxs,
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txnIdText: {
    color: colors.textSecondary,
    fontWeight: '600',
    marginRight: 2,
  },
});
