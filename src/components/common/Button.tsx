/**
 * Reusable Button Component
 * Supports multiple variants (primary, secondary, accent, outline, danger, ghost),
 * sizes, loading state with spinner, and icon support.
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Icon, IconName } from './Icon';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = { ...styles.base };

    // Size
    switch (size) {
      case 'sm':
        base.paddingVertical = spacing.sm;
        base.paddingHorizontal = spacing.md;
        base.minHeight = 38;
        break;
      case 'lg':
        base.paddingVertical = spacing.md + 4;
        base.paddingHorizontal = spacing.xxl;
        base.minHeight = 56;
        break;
      case 'md':
      default:
        base.paddingVertical = spacing.md;
        base.paddingHorizontal = spacing.lg;
        base.minHeight = 48;
        break;
    }

    // Variant
    switch (variant) {
      case 'accent':
        base.backgroundColor = colors.accent;
        base = { ...base, ...shadows.glowAmber };
        break;
      case 'secondary':
        base.backgroundColor = colors.primaryLight;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = colors.primary;
        break;
      case 'danger':
        base.backgroundColor = colors.danger;
        break;
      case 'success':
        base.backgroundColor = colors.success;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      case 'primary':
      default:
        base.backgroundColor = colors.primary;
        base = { ...base, ...shadows.md };
        break;
    }

    if (disabled || loading) {
      base.opacity = 0.6;
      base.elevation = 0;
      base.shadowOpacity = 0;
    }

    if (fullWidth) {
      base.width = '100%';
    }

    return base;
  };

  const getTextColor = (): string => {
    if (variant === 'outline') return colors.primary;
    if (variant === 'ghost') return colors.primary;
    if (variant === 'accent') return colors.primaryDark;
    return colors.textInverse;
  };

  const getIconColor = (): string => {
    return getTextColor();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={styles.spinner}
        />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && (
            <Icon
              name={leftIcon}
              size={size === 'sm' ? 16 : 20}
              color={getIconColor()}
              style={styles.leftIcon}
            />
          )}
          <Text
            style={[
              size === 'sm' ? typography.buttonSmall : typography.button,
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && (
            <Icon
              name={rightIcon}
              size={size === 'sm' ? 16 : 20}
              color={getIconColor()}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  spinner: {
    paddingVertical: 2,
  },
});

