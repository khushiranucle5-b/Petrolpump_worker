/**
 * Custom Bottom Navigation Bar
 * Features Home, History, and an elevated, glowing Center SCAN button for the primary petrol pump workflow.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, shadows } from '../../theme/spacing';
import { Icon, IconName } from '../common/Icon';

export type TabRouteName = 'HomeTab' | 'ScannerTab' | 'HistoryTab';

interface BottomNavigationProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  state,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const currentRouteName = state.routes[state.index].name as TabRouteName;

  const tabs: {
    name: TabRouteName;
    label: string;
    icon: IconName;
    isCenter?: boolean;
  }[] = [
      { name: 'HomeTab', label: 'Home', icon: 'home' },
      { name: 'ScannerTab', label: 'SCAN', icon: 'qr-scan', isCenter: true },
      { name: 'HistoryTab', label: 'History', icon: 'history' },
    ];

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? spacing.sm : spacing.xs) },
      ]}
    >
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const isFocused = currentRouteName === tab.name;

          if (tab.isCenter) {
            return (
              <View key={tab.name} style={styles.centerTabWrapper}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate(tab.name)}
                  style={[
                    styles.centerButton,
                    isFocused && styles.centerButtonActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Scan Customer QR"
                >
                  <View style={styles.centerIconGlow}>
                    <Icon name="qr-scan" size={26} color={colors.textInverse} />
                  </View>
                  <Text style={styles.centerButtonLabel}>SCAN QR</Text>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={tab.name}
              activeOpacity={0.75}
              onPress={() => navigation.navigate(tab.name)}
              style={styles.tabItem}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
            >
              <Icon
                name={tab.icon}
                size={22}
                color={isFocused ? colors.textInverse : 'rgba(255,255,255,0.7)'}
              />
              <Text
                style={[
                  typography.caption,
                  styles.tabLabel,
                  { color: isFocused ? colors.textInverse : 'rgba(255,255,255,0.7)' },
                ]}
              >
                {tab.label}
              </Text>
              {isFocused && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderTopWidth: 1,
    borderTopColor: colors.primaryLight,
  },
  bar: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabLabel: {
    marginTop: 3,
    fontWeight: '600',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 2,
  },
  centerTabWrapper: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  centerButton: {
    position: 'absolute',
    top: -24,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
    ...shadows.glowAmber,
  },
  centerButtonActive: {
    backgroundColor: colors.accentLight,
    transform: [{ scale: 1.05 }],
  },
  centerIconGlow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonLabel: {
    ...typography.badge,
    fontSize: 9,
    color: colors.textInverse,
    fontWeight: '800',
    marginTop: 1,
  },
});

export default BottomNavigation;
