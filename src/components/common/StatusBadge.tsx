/**
 * Reusable Status Badge Component
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export type BadgeType =
  | 'COMPLETED'
  | 'PENDING'
  | 'FAILED'
  | 'CANCELLED'
  | 'ACTIVE'
  | 'PENDING_APPROVAL'
  | 'SUSPENDED'
  | 'DISCOUNT'
  | 'GROUP';

interface StatusBadgeProps {
  status: string;
  type?: BadgeType;
  label?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type,
  label,
  style,
  size = 'md',
}) => {
  const normStatus = (type || status).toUpperCase();

  const getColors = () => {
    switch (normStatus) {
      case 'COMPLETED':
      case 'ACTIVE':
      case 'SUCCESS':
        return { bg: colors.successLight, text: colors.successDark, border: colors.success };
      case 'PENDING':
      case 'PENDING_APPROVAL':
        return { bg: colors.warningLight, text: colors.warningDark, border: colors.warning };
      case 'FAILED':
      case 'SUSPENDED':
      case 'REJECTED':
      case 'BLOCKED':
        return { bg: colors.dangerLight, text: colors.dangerDark, border: colors.danger };
      case 'DISCOUNT':
        return { bg: colors.accentSubtle, text: colors.accentDark, border: colors.accent };
      case 'GROUP':
        return { bg: colors.cyanLight, text: colors.cyanDark, border: colors.cyan };
      default:
        return { bg: colors.borderLight, text: colors.textSecondary, border: colors.border };
    }
  };

  const { bg, text, border } = getColors();

  const getDisplayText = () => {
    if (label) return label;
    switch (normStatus) {
      case 'PENDING_APPROVAL':
        return 'Pending Approval';
      case 'COMPLETED':
        return 'Completed';
      case 'ACTIVE':
        return 'Active';
      case 'SUSPENDED':
        return 'Suspended';
      default:
        return status;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          paddingVertical: size === 'sm' ? 2 : spacing.xs,
          paddingHorizontal: size === 'sm' ? spacing.xs : spacing.sm,
        },
        style,
      ]}
    >
      <Text
        style={[
          typography.badge,
          {
            color: text,
            fontSize: size === 'sm' ? 10 : 11,
          },
        ]}
      >
        {getDisplayText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.round,
    borderWidth: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
