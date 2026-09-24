/**
 * Transaction Details Screen
 * Complete breakdown of the recorded fuel redemption receipt.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { RootStackParamList } from '../../types/navigation';

export const TransactionDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'TransactionDetails'>>();

  const { transaction } = route.params;

  return (
    <View style={styles.container}>
      <Header
        title="Transaction Details"
        subtitle={transaction.transactionId}
        showBack
        onBackPress={() => navigation.goBack()}
        variant="dark"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Card */}
        <View style={styles.topCard}>
          <View style={styles.topHeader}>
            <View>
              <Text style={[typography.caption, styles.txnLabel]}>RECEIPT ID</Text>
              <Text style={[typography.h2, styles.txnId]}>
                {transaction.transactionId}
              </Text>
            </View>
            <StatusBadge status={transaction.status} />
          </View>

          <View style={styles.timestampRow}>
            <Icon name="history" size={14} color={colors.textMuted} />
            <Text style={[typography.caption, styles.timestampText]}>
              Recorded on {formatDateTime(transaction.createdAt)}
            </Text>
          </View>
        </View>

        {/* Customer & Group Information Card */}
        <View style={styles.card}>
          <Text style={[typography.h4, styles.cardTitle]}>
            Customer & Account Information
          </Text>

          <View style={styles.row}>
            <Text style={[typography.bodySmall, styles.label]}>Customer Name</Text>
            <Text style={[typography.bodyMedium, styles.value]}>
              {transaction.customerName}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[typography.bodySmall, styles.label]}>Customer ID</Text>
            <Text style={[typography.bodyMedium, styles.value]}>
              {transaction.customerId}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[typography.bodySmall, styles.label]}>Mobile Number</Text>
            <Text style={[typography.bodyMedium, styles.value]}>
              {transaction.customerMobile}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[typography.bodySmall, styles.label]}>Affiliated Group</Text>
            <Text style={[typography.bodyMedium, styles.groupValue]}>
              {transaction.groupName}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[typography.bodySmall, styles.label]}>Group Type</Text>
            <Text style={[typography.bodyMedium, styles.value]}>
              {transaction.groupType}
            </Text>
          </View>
        </View>

        {/* Station & Worker Information Card */}
        <View style={styles.card}>
          <Text style={[typography.h4, styles.cardTitle]}>
            Dispenser & Station Verification
          </Text>

          <View style={styles.row}>
            <Text style={[typography.bodySmall, styles.label]}>Station</Text>
            <Text style={[typography.bodyMedium, styles.value]}>
              {transaction.petrolPumpName}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[typography.bodySmall, styles.label]}>Branch / Terminal</Text>
            <Text style={[typography.bodyMedium, styles.value]}>
              {transaction.branchName}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[typography.bodySmall, styles.label]}>Attendant</Text>
            <Text style={[typography.bodyMedium, styles.value]}>
              {transaction.workerName} ({transaction.workerId})
            </Text>
          </View>

          {transaction.notes ? (
            <View style={styles.row}>
              <Text style={[typography.bodySmall, styles.label]}>Nozzle Notes</Text>
              <Text style={[typography.bodyMedium, styles.value]}>
                {transaction.notes}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Financial Breakdown Card */}
        <View style={styles.card}>
          <Text style={[typography.h4, styles.cardTitle]}>
            Financial Settlement Breakdown
          </Text>

          <View style={styles.row}>
            <Text style={[typography.bodyMedium, styles.label]}>Fuel Total (Meter)</Text>
            <Text style={[typography.bodyLarge, styles.value]}>
              {formatCurrency(transaction.fuelAmount)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={[typography.bodyMedium, styles.discountLabel]}>
              Group Discount ({transaction.discountPercentage}%)
            </Text>
            <Text style={[typography.bodyLarge, styles.discountValue]}>
              - {formatCurrency(transaction.discountAmount)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={[styles.row, styles.finalRow]}>
            <View>
              <Text style={[typography.label, styles.finalTitle]}>
                FINAL AMOUNT COLLECTED
              </Text>
              <Text style={[typography.caption, styles.finalSub]}>
                Verified & Settled
              </Text>
            </View>
            <Text style={[typography.amountLarge, styles.finalAmount]}>
              {formatCurrency(transaction.finalAmount)}
            </Text>
          </View>
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
  topCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  txnLabel: {
    color: colors.textMuted,
  },
  txnId: {
    color: colors.primary,
    marginTop: 2,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  timestampText: {
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
  },
  value: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  groupValue: {
    color: colors.cyanDark,
    fontWeight: '700',
  },
  discountLabel: {
    color: colors.accentDark,
  },
  discountValue: {
    color: colors.accentDark,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  finalRow: {
    alignItems: 'center',
  },
  finalTitle: {
    color: colors.textPrimary,
  },
  finalSub: {
    color: colors.textMuted,
  },
  finalAmount: {
    color: colors.primary,
  },
  backBtn: {
    marginTop: spacing.md,
  },
});

export default TransactionDetailsScreen;
