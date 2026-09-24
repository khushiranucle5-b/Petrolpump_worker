/**
 * Pending Approval Screen
 * Displayed when worker registration requires admin approval before shift activation.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RootStackParamList } from '../../types/navigation';

export const PendingApprovalScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PendingApproval'>>();
  const { user, refreshProfile, logout, setUserDirectly } = useAuth();

  const [checking, setChecking] = useState(false);

  const workerName = user?.fullName || route.params?.workerName || 'Worker';
  const workerId = user?.workerId || route.params?.workerId || 'EMP-TEMP';

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const updated = await refreshProfile();
      if (updated?.accountStatus === 'active') {
        Alert.alert('Account Approved!', 'Your worker terminal account is active.', [
          { text: 'Enter Terminal', onPress: () => navigation.replace('MainTabs') },
        ]);
      } else {
        Alert.alert(
          'Still Pending',
          'Your account is awaiting authorization from the station administrator. Please check back shortly.'
        );
      }
    } finally {
      setChecking(false);
    }
  };

  const handleDemoApprove = () => {
    if (user) {
      const activeUser = { ...user, accountStatus: 'active' as const };
      setUserDirectly(activeUser);
      Alert.alert('Account Approved (Demo)', 'Worker account activated for this shift.', [
        { text: 'Continue to Terminal', onPress: () => navigation.replace('MainTabs') },
      ]);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Auth');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconCircle}>
          <Icon name="shield-check" size={48} color={colors.warning} />
        </View>

        <Text style={[typography.h2, styles.title]}>Approval Pending</Text>
        <StatusBadge status="PENDING_APPROVAL" style={styles.badge} />

        <Text style={[typography.bodyMedium, styles.subtitle]}>
          Thank you for registering, <Text style={styles.bold}>{workerName}</Text> ({workerId}).
          Your account has been submitted for authorization.
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="building" size={18} color={colors.primary} />
            <Text style={[typography.h4, styles.cardTitle]}>
              Verification in Progress
            </Text>
          </View>

          <View style={styles.stepList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumberCompleted}>
                <Icon name="check" size={12} color={colors.textInverse} />
              </View>
              <Text style={[typography.bodySmall, styles.stepText]}>
                Worker Registration Submitted
              </Text>
            </View>

            <View style={styles.stepLine} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumberActive}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={[typography.bodySmall, styles.stepTextBold]}>
                Pump Station Supervisor Authorization
              </Text>
            </View>

            <View style={styles.stepLine} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumberPending}>
                <Text style={styles.stepNumberPendingText}>3</Text>
              </View>
              <Text style={[typography.bodySmall, styles.stepTextMuted]}>
                Terminal QR Scanner Activation
              </Text>
            </View>
          </View>

          <Text style={[typography.caption, styles.noteText]}>
            Note: Contact your branch manager or shift supervisor to expedite account activation.
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <Button
            title="CHECK APPROVAL STATUS"
            onPress={handleCheckStatus}
            variant="accent"
            size="lg"
            loading={checking}
            leftIcon="refresh"
            style={styles.btn}
          />

          <Button
            title="⚡ Demo: Authorize Account Now"
            onPress={handleDemoApprove}
            variant="success"
            size="md"
            style={styles.btn}
          />

          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="ghost"
            size="md"
            leftIcon="logout"
            textStyle={{ color: colors.textInverseSecondary }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.glowAmber,
  },
  title: {
    color: colors.textInverse,
    textAlign: 'center',
  },
  badge: {
    marginVertical: spacing.sm,
  },
  subtitle: {
    color: colors.textInverseSecondary,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  bold: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  stepList: {
    marginBottom: spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumberCompleted: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberPending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 12,
  },
  stepNumberPendingText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 12,
  },
  stepText: {
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  stepTextBold: {
    color: colors.primary,
    fontWeight: '700',
    marginLeft: spacing.md,
  },
  stepTextMuted: {
    color: colors.textMuted,
    marginLeft: spacing.md,
  },
  stepLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.border,
    marginLeft: 11,
    marginVertical: 2,
  },
  noteText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  actionButtons: {
    width: '100%',
    gap: spacing.sm,
  },
  btn: {
    marginBottom: spacing.xs,
  },
});

export default PendingApprovalScreen;
