/**
 * Redemption Success Screen
 * Displays green success confirmation, digital pump receipt, and quick Scan Next Customer CTA.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, BackHandler } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RootStackParamList } from '../../types/navigation';

export const RedemptionSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RedemptionSuccess'>>();

  const { transaction } = route.params;

  const handleScanNext = () => {
    navigation.replace('QRScanner');
  };

  const handleGoHome = () => {
    navigation.replace('MainTabs');
  };

  useEffect(() => {
    const onBackPress = () => {
      handleGoHome();
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Celebration Header */}
        <View style={styles.header}>
          <View style={styles.checkCircle}>
            <Icon name="check" size={48} color={colors.textInverse} />
          </View>
          <Text style={[typography.h1, styles.title]}>Transaction Successful!</Text>
          <Text style={[typography.bodyMedium, styles.subtitle]}>
            Group discount applied and recorded to station ledger.
          </Text>
        </View>

        {/* Digital Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Receipt Top Header */}
          <View style={styles.receiptTop}>
            <View>
              <Text style={[typography.caption, styles.txnLabel]}>TRANSACTION ID</Text>
              <Text style={[typography.h3, styles.txnId]}>{transaction.transactionId}</Text>
            </View>
            <StatusBadge status={transaction.status} />
          </View>

          <View style={styles.divider} />

          {/* Customer & Group Rows */}
          <View style={styles.metaRow}>
            <Text style={[typography.bodySmall, styles.metaLabel]}>Customer</Text>
            <Text style={[typography.bodyMedium, styles.metaValue]}>{transaction.customerName}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[typography.bodySmall, styles.metaLabel]}>Group</Text>
            <Text style={[typography.bodyMedium, styles.groupValue]}>{transaction.groupName}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[typography.bodySmall, styles.metaLabel]}>Time & Date</Text>
            <Text style={[typography.bodySmall, styles.metaValue]}>
              {formatDateTime(transaction.createdAt)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[typography.bodySmall, styles.metaLabel]}>Dispenser / Branch</Text>
            <Text style={[typography.bodySmall, styles.metaValue]}>
              {transaction.branchName}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Numerical Amounts */}
          <View style={styles.amountRow}>
            <Text style={[typography.bodyMedium, styles.amountLabel]}>Fuel Amount</Text>
            <Text style={[typography.bodyLarge, styles.amountValue]}>
              {formatCurrency(transaction.fuelAmount)}
            </Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={[typography.bodyMedium, styles.discountLabel]}>
              Discount ({transaction.discountPercentage}%)
            </Text>
            <Text style={[typography.bodyLarge, styles.discountValue]}>
              - {formatCurrency(transaction.discountAmount)}
            </Text>
          </View>

          <View style={[styles.amountRow, styles.finalAmountRow]}>
            <View>
              <Text style={[typography.label, styles.finalLabel]}>FINAL AMOUNT COLLECTED</Text>
              <Text style={[typography.caption, styles.finalSub]}>Cash / Card / UPI</Text>
            </View>
            <Text style={[typography.h2, styles.finalValue]}>
              {formatCurrency(transaction.finalAmount)}
            </Text>
          </View>
        </View>

        {/* Action CTAs */}
        <View style={styles.actionButtons}>
          <Button
            title="SCAN NEXT CUSTOMER"
            onPress={handleScanNext}
            variant="accent"
            size="lg"
            leftIcon="qr-scan"
            style={styles.scanNextBtn}
          />

          <Button
            title="Return to Home Dashboard"
            onPress={handleGoHome}
            variant="ghost"
            size="md"
            textStyle={{ color: colors.textSecondary }}
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
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.lg,
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
  },
  receiptCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  receiptTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  txnLabel: {
    color: colors.textMuted,
  },
  txnId: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  metaLabel: {
    color: colors.textSecondary,
  },
  metaValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  groupValue: {
    color: colors.cyanDark,
    fontWeight: '700',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  amountLabel: {
    color: colors.textSecondary,
  },
  amountValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  discountLabel: {
    color: colors.accentDark,
  },
  discountValue: {
    color: colors.accentDark,
    fontWeight: '700',
  },
  finalAmountRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  finalLabel: {
    color: colors.textPrimary,
  },
  finalSub: {
    color: colors.textMuted,
  },
  finalValue: {
    color: colors.successDark,
    fontWeight: '800',
  },
  actionButtons: {
    gap: spacing.sm,
    width: '100%',
  },
  scanNextBtn: {
    marginBottom: spacing.xs,
  },
});

export default RedemptionSuccessScreen;
