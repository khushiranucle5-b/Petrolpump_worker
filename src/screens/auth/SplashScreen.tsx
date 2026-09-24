/**
 * Splash Screen
 * Petrol Pump Worker App branded launch screen with automated session restoration.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Icon } from '../../components/common/Icon';
import { RootStackParamList } from '../../types/navigation';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isLoading, isAuthenticated, isPendingApproval, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (isPendingApproval) {
          navigation.replace('PendingApproval', {
            workerName: user?.fullName,
            workerId: user?.workerId,
          });
        } else {
          navigation.replace('MainTabs');
        }
      } else {
        navigation.replace('Auth');
      }
    }
  }, [isLoading, isAuthenticated, isPendingApproval, user, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <View style={styles.brandContainer}>
        <View style={styles.logoCircle}>
          <Icon name="fuel" size={48} color={colors.accent} />
        </View>
        <Text style={[typography.h1, styles.appTitle]}>PETROLPUMP</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>WORKER PORTAL</Text>
        </View>
        <Text style={[typography.bodyMedium, styles.subtitle]}>
          Secure Discount & Fuel Redemption System
        </Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={[typography.caption, styles.loadingText]}>
          Initializing secure terminal...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  brandContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    elevation: 8,
  },
  appTitle: {
    color: colors.textPrimary,
    letterSpacing: 2,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: colors.accent,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  badgeText: {
    ...typography.badge,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  footer: {
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});

export default SplashScreen;
