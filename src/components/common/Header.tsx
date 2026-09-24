/**
 * Reusable Header Component
 * Supports Dark petrol theme header, light header, back button, actions, and worker status.
 */
import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Icon, IconName } from './Icon';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: ReactNode;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  variant?: 'dark' | 'light';
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
  rightIcon,
  onRightIconPress,
  variant = 'dark',
  style,
}) => {
  const isDark = variant === 'dark';
  const textColor = isDark ? colors.textInverse : colors.textPrimary;
  const subtitleColor = isDark ? colors.textInverseSecondary : colors.textSecondary;
  const iconColor = isDark ? colors.textInverse : colors.textPrimary;

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: isDark ? colors.primary : colors.surface },
        style,
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? colors.primaryDark : colors.surface}
      />
      <SafeAreaView>
        <View style={styles.container}>
          {showBack ? (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="arrow-left" size={22} color={iconColor} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}

          <View style={styles.titleContainer}>
            <Text
              style={[typography.h3, { color: textColor, textAlign: 'center' }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  typography.caption,
                  { color: subtitleColor, textAlign: 'center', marginTop: 2 },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>

          <View style={styles.actionContainer}>
            {rightAction ? (
              rightAction
            ) : rightIcon ? (
              <TouchableOpacity
                onPress={onRightIconPress}
                style={styles.actionButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name={rightIcon} size={20} color={iconColor} />
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 0,
    borderBottomColor: colors.borderDark,
  },
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  actionContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
});
