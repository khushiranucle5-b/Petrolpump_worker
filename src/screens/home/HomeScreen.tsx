/**
 * Worker Home Screen
 * Displays Worker Name, Station Branch, Today's Metric Cards,
 * Prominent "SCAN CUSTOMER QR" Hero CTA, and Recent Transactions List.
 * Top-left Worker Profile Avatar is clickable and opens the Profile screen.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { formatCompactCurrency } from '../../utils/formatters';
import { TransactionService } from '../../services/transactions/transactionService';
import { Transaction, TodayStats } from '../../types/transaction';
import { Icon } from '../../components/common/Icon';
import { TransactionCard } from '../../components/transaction/TransactionCard';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { RootStackParamList } from '../../types/navigation';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  const [stats, setStats] = useState<TodayStats>({
    transactionCount: 0,
    totalFuelAmount: 0,
    totalDiscountAmount: 0,
    totalFinalAmount: 0,
    date: new Date().toISOString(),
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [todayStats, txList] = await Promise.all([
        TransactionService.getTodaySummary(),
        TransactionService.getTransactions({ filterType: 'TODAY', limit: 4 }),
      ]);
      setStats(todayStats);
      setRecentTransactions(txList.transactions);
    } catch (error) {
      console.warn('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleOpenProfile = () => {
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Top Worker Profile & Branch Bar */}
        <View style={styles.headerHero}>
          <View style={styles.workerMeta}>
            {/* Clickable Profile Avatar Button */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleOpenProfile}
              style={styles.avatarTouchable}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Open Worker Profile"
              accessibilityHint="Navigates to your profile settings and details"
            >
              <View style={styles.avatarCircle}>
                {user?.profilePhotoUrl ? (
                  <Image source={{ uri: user.profilePhotoUrl }} style={styles.avatarImage} />
                ) : (
                  <Icon name="user" size={24} color={colors.accent} />
                )}
              </View>
              <View style={styles.avatarBadge}>
                <Icon name="edit" size={10} color={colors.primaryDark} />
              </View>
            </TouchableOpacity>

            <View style={styles.workerTexts}>
              <View style={styles.greetingRow}>
                <Text style={[typography.caption, styles.shiftText]}>ON DUTY SHIFT</Text>
                <View style={styles.liveDot} />
              </View>
              <Text style={[typography.h2, styles.workerName]} numberOfLines={1}>
                {user?.fullName || 'Worker Attendant'}
              </Text>
              <Text style={[typography.bodySmall, styles.branchName]} numberOfLines={1}>
                📍 {user?.branchName || 'Downtown City Station'}
              </Text>
            </View>
          </View>
        </View>

        {/* Prominent Hero SCAN CUSTOMER QR Button */}
        <View style={styles.scanHeroContainer}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate('QRScanner')}
            style={styles.scanHeroButton}
            accessibilityRole="button"
            accessibilityLabel="Scan Customer QR"
          >
            <View style={styles.scanHeroIconContainer}>
              <Icon name="qr-scan" size={36} color={colors.primaryDark} />
            </View>
            <View style={styles.scanHeroContent}>
              <Text style={[typography.h3, styles.scanHeroTitle]}>
                SCAN CUSTOMER QR
              </Text>
              <Text style={[typography.bodySmall, styles.scanHeroSubtitle]}>
                Validate 60s dynamic code & calculate group discount
              </Text>
            </View>
            <View style={styles.scanHeroArrow}>
              <Icon name="arrow-right" size={20} color={colors.primaryDark} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Today's Stats Cards Section */}
        <View style={styles.sectionHeader}>
          <Text style={[typography.h3, styles.sectionTitle]}>Today's Summary</Text>
          <Text style={[typography.caption, styles.sectionDate]}>Shift Overview</Text>
        </View>

        <View style={styles.statsGrid}>
          {/* Transactions Count */}
          <View style={[styles.statCard, styles.statCardNavy]}>
            <View style={styles.statIconBadge}>
              <Icon name="history" size={16} color={colors.cyan} />
            </View>
            <Text style={[typography.amountLarge, styles.statNumber]}>
              {stats.transactionCount}
            </Text>
            <Text style={[typography.caption, styles.statLabel]}>
              Transactions
            </Text>
          </View>

          {/* Total Fuel Amount */}
          <View style={[styles.statCard, styles.statCardWhite]}>
            <View style={[styles.statIconBadge, { backgroundColor: colors.borderLight }]}>
              <Icon name="fuel" size={16} color={colors.primary} />
            </View>
            <Text style={[typography.amountLarge, styles.statNumberDark]}>
              {formatCompactCurrency(stats.totalFuelAmount)}
            </Text>
            <Text style={[typography.caption, styles.statLabelDark]}>
              Fuel Dispensed
            </Text>
          </View>

          {/* Total Discount Amount */}
          <View style={[styles.statCard, styles.statCardGold]}>
            <View style={[styles.statIconBadge, { backgroundColor: colors.accentLight }]}>
              <Icon name="percent" size={16} color={colors.accentDark} />
            </View>
            <Text style={[typography.amountLarge, styles.statNumberGold]}>
              {formatCompactCurrency(stats.totalDiscountAmount)}
            </Text>
            <Text style={[typography.caption, styles.statLabelGold]}>
              Discounts Given
            </Text>
          </View>
        </View>

        {/* Recent Transactions List */}
        <View style={styles.recentSectionHeader}>
          <Text style={[typography.h3, styles.sectionTitle]}>Recent Redemptions</Text>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('HistoryTab')}
            style={styles.viewAllBtn}
          >
            <Text style={[typography.buttonSmall, styles.viewAllText]}>
              View All History ›
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Loading message="Loading recent transactions..." />
        ) : recentTransactions.length > 0 ? (
          <View style={styles.txList}>
            {recentTransactions.map(tx => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onPress={() => navigation.navigate('TransactionDetails', { transaction: tx })}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No Redemptions Yet Today"
            message="Tap the SCAN button above to scan your first customer QR code and apply their group discount."
            icon="qr-scan"
            actionTitle="SCAN CUSTOMER QR"
            onActionPress={() => navigation.navigate('QRScanner')}
          />
        )}
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
    paddingBottom: spacing.xxxl,
  },
  headerHero: {
    backgroundColor: colors.primaryDark,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl + spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  workerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarTouchable: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    resizeMode: 'cover',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  workerTexts: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  shiftText: {
    color: colors.accent,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginLeft: 6,
  },
  workerName: {
    color: colors.textInverse,
  },
  branchName: {
    color: colors.textInverseSecondary,
    marginTop: 2,
  },
  scanHeroContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    marginBottom: spacing.lg,
  },
  scanHeroButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.glowAmber,
  },
  scanHeroIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  scanHeroContent: {
    flex: 1,
  },
  scanHeroTitle: {
    color: colors.primaryDark,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scanHeroSubtitle: {
    color: colors.primaryLight,
    marginTop: 2,
    fontWeight: '500',
  },
  scanHeroArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: colors.textPrimary,
  },
  sectionDate: {
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  statCardNavy: {
    backgroundColor: colors.primary,
  },
  statCardWhite: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCardGold: {
    backgroundColor: colors.accentSubtle,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statNumber: {
    color: colors.textInverse,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textInverseSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  statNumberDark: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  statLabelDark: {
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  statNumberGold: {
    color: colors.accentDark,
    fontWeight: '800',
  },
  statLabelGold: {
    color: colors.accentDark,
    fontWeight: '600',
    marginTop: 2,
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  viewAllBtn: {
    paddingVertical: 4,
  },
  viewAllText: {
    color: colors.accentDark,
    fontWeight: '700',
  },
  txList: {
    paddingHorizontal: spacing.lg,
  },
});

export default HomeScreen;
