/**
 * Reusable Loading Spinner & Screen Component
 */
import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Icon } from './Icon';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
  variant?: 'dark' | 'light';
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  fullScreen = false,
  style,
  variant = 'light',
}) => {
  const isDark = variant === 'dark';

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: isDark ? colors.primaryDark : 'transparent' },
        style,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon name="fuel" size={28} color={colors.accent} />
        </View>
        <ActivityIndicator
          size="large"
          color={colors.accent}
          style={styles.spinner}
        />
        {message ? (
          <Text
            style={[
              typography.bodyMedium,
              styles.message,
              { color: isDark ? colors.textInverse : colors.textSecondary },
            ]}
          >
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  spinner: {
    marginVertical: spacing.sm,
  },
  message: {
    marginTop: spacing.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
});
