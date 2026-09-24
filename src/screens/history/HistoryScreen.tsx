/**
 * Worker Transaction History Screen
 * Includes date filter chips (Today, Yesterday, This Week, This Month, Custom),
 * search bar, infinite scrolling pagination, pull-to-refresh, loading & empty states.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { TransactionService } from '../../services/transactions/transactionService';
import { Transaction, HistoryFilterType } from '../../types/transaction';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { TransactionCard } from '../../components/transaction/TransactionCard';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { RootStackParamList } from '../../types/navigation';

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [filterType, setFilterType] = useState<HistoryFilterType>('TODAY');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const filterTabs: { type: HistoryFilterType; label: string }[] = [
    { type: 'TODAY', label: 'Today' },
    { type: 'YESTERDAY', label: 'Yesterday' },
    { type: 'THIS_WEEK', label: 'This Week' },
    { type: 'THIS_MONTH', label: 'This Month' },
  ];

  const fetchHistory = async (pageNum: number = 1, isRefresh: boolean = false) => {
    if (pageNum === 1 && !isRefresh) {
      setLoading(true);
    }
    setError('');

    try {
      const response = await TransactionService.getTransactions({
        filterType,
        searchQuery,
        page: pageNum,
        limit: 10,
      });

      if (pageNum === 1) {
        setTransactions(response.transactions);
      } else {
        setTransactions(prev => [...prev, ...response.transactions]);
      }

      setTotalCount(response.total);
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || 'Unable to load transaction records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory(1, true);
    }, [filterType, searchQuery])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchHistory(page + 1);
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionCard
      transaction={item}
      onPress={() => navigation.navigate('TransactionDetails', { transaction: item })}
    />
  );

  return (
    <View style={styles.container}>
      <Header title="Redemption History" variant="dark" />

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Input
          placeholder="Search by customer name, mobile, or Txn ID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          containerStyle={styles.searchInputWrapper}
          inputStyle={{ paddingVertical: spacing.xs }}
        />
      </View>

      {/* Filter Tabs Horizontal Scroll */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterTabs.map(tab => {
            const isActive = filterType === tab.type;
            return (
              <TouchableOpacity
                key={tab.type}
                onPress={() => {
                  setFilterType(tab.type);
                  setPage(1);
                }}
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Total Count Header */}
      <View style={styles.countHeader}>
        <Text style={[typography.caption, styles.countText]}>
          Showing {transactions.length} of {totalCount} records
        </Text>
      </View>

      {/* Main List / State View */}
      {loading ? (
        <Loading message="Fetching transaction history..." />
      ) : error ? (
        <ErrorState
          title="Could Not Load History"
          message={error}
          onRetry={() => fetchHistory(1)}
        />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <EmptyState
              title="No Transactions Found"
              message={
                searchQuery
                  ? `No records matching "${searchQuery}". Try adjusting your search query or filter.`
                  : `No fuel redemptions recorded for ${filterTabs.find(t => t.type === filterType)?.label.toLowerCase() || 'this period'
                  }.`
              }
              icon="history"
              actionTitle={searchQuery ? 'Clear Search' : undefined}
              onActionPress={() => setSearchQuery('')}
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterBar: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  filterChip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  searchBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  searchInputWrapper: {
    marginBottom: spacing.xs,
  },
  countHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceSecondary,
  },
  countText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});

export default HistoryScreen;
