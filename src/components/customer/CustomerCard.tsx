/**
 * Customer Profile and Group Information Card Component
 */
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { CustomerProfile } from '../../types/customer';
import { StatusBadge } from '../common/StatusBadge';
import { Icon } from '../common/Icon';

interface CustomerCardProps {
  customer: CustomerProfile;
  showDiscountPill?: boolean;
  discountPercentage?: number;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  showDiscountPill = true,
  discountPercentage,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (name: string) => {
    return (name || 'C')
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const rawGroup = (customer.group || (customer as any).Group || {}) as any;
  const groupName = rawGroup.groupName || rawGroup.name || 'Standard Customer';

  const discountVal = Number(
    discountPercentage ??
    rawGroup.discountPercentage ??
    rawGroup.discountPercent ??
    rawGroup.discount ??
    (customer as any).discountPercentage ??
    (customer as any).discountPercent ??
    (customer as any).discount ??
    0
  );

  const mobile = customer.mobileNumber || (customer as any).mobile || (customer as any).phone || '';
  const rawId = customer.displayId || customer.customId || customer.customerId || customer.id || '';
  const displayId =
    customer.displayId ||
    customer.customId ||
    (customer.customerId && !customer.customerId.includes('-') ? customer.customerId : null) ||
    (mobile ? `CUST-${mobile.slice(-4)}` : null) ||
    (rawId ? `CUST-${rawId.replace(/-/g, '').slice(0, 8).toUpperCase()}` : 'CUST-001');

  return (
    <View style={styles.card}>
      {/* Top Header Row with Customer Photo & Main Info */}
      <View style={styles.headerRow}>
        <View style={styles.avatarContainer}>
          {customer.profilePhotoUrl && !imageError ? (
            <Image
              source={{ uri: customer.profilePhotoUrl }}
              style={styles.avatar}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={[typography.h3, styles.avatarText]}>
                {getInitials(customer.fullName)}
              </Text>
            </View>
          )}
          <View style={styles.verifiedBadge}>
            <Icon name="check" size={10} color={colors.textInverse} />
          </View>
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={[typography.h3, styles.customerName]} numberOfLines={1}>
              {customer.fullName}
            </Text>
            <StatusBadge status={customer.status || 'ACTIVE'} size="sm" />
          </View>
          <Text style={[typography.caption, styles.customerId]}>
            ID: {displayId}
          </Text>
        </View>
      </View>

      {/* Group & Discount Section */}
      <View style={styles.groupSection}>
        <View style={styles.groupHeader}>
          <View style={styles.groupTitleRow}>
            <Icon name="building" size={16} color={colors.cyanDark} />
            <Text style={[typography.label, styles.groupTitle]}>
              {groupName}
            </Text>
          </View>
          {showDiscountPill && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {discountVal}% OFF
              </Text>
            </View>
          )}
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.accent,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.xs,
  },
  customerId: {
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  phoneText: {
    color: colors.textSecondary,
    marginLeft: spacing.xxs,
    fontWeight: '500',
  },
  groupSection: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.xs,
  },
  groupTitle: {
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  discountBadge: {
    backgroundColor: colors.accent,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.round,
  },
  discountText: {
    ...typography.badge,
    color: colors.textInverse,
    fontWeight: '800',
  },
  groupTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
