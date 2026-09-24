/**
 * Reusable Card Component
 * Supports light, dark (petrol station night shift), accented, and clickable cards.
 */
import React, { ReactNode } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export type CardVariant = 'default' | 'elevated' | 'dark' | 'outlined' | 'accentBorder';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  contentPadding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  onPress,
  style,
  contentPadding = spacing.lg,
}) => {
  const getCardStyle = (): ViewStyle => {
    let base: ViewStyle = {
      borderRadius: borderRadius.lg,
      padding: contentPadding,
      backgroundColor: colors.surface,
    };

    switch (variant) {
      case 'dark':
        base.backgroundColor = colors.surfaceDark;
        base = { ...base, ...shadows.md };
        break;
      case 'outlined':
        base.borderWidth = 1;
        base.borderColor = colors.border;
        break;
      case 'accentBorder':
        base.borderLeftWidth = 4;
        base.borderLeftColor = colors.accent;
        base = { ...base, ...shadows.sm };
        break;
      case 'elevated':
        base = { ...base, ...shadows.md };
        break;
      case 'default':
      default:
        base = { ...base, ...shadows.sm };
        break;
    }

    return base;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[getCardStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({});
