/**
 * Worker Profile Screen
 * Displays Worker Photo, Employee ID, Pump/Branch, Role, Status,
 * Edit Profile, Change Password, and Logout dialog.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { formatDate } from '../../utils/formatters';
import { Header } from '../../components/common/Header';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Icon } from '../../components/common/Icon';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { RootStackParamList } from '../../types/navigation';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setLogoutModalVisible(false);
      navigation.replace('Auth');
    } catch {
      setLoggingOut(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'W';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Worker Profile"
        variant="dark"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            {user?.profilePhotoUrl ? (
              <Image source={{ uri: user.profilePhotoUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={[typography.h1, styles.avatarText]}>
                  {getInitials(user?.fullName)}
                </Text>
              </View>
            )}
            <View style={styles.statusDot}>
              <Icon name="check" size={12} color={colors.textInverse} />
            </View>
          </View>

          <Text style={[typography.h2, styles.workerName]}>
            {user?.fullName || 'Worker Attendant'}
          </Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>{user?.role || 'Worker'}</Text>
            </View>
            <StatusBadge status={user?.accountStatus || 'active'} size="sm" />
          </View>
        </View>

        {/* Employee & Branch Details Card */}
        <View style={styles.infoCard}>
          <Text style={[typography.h4, styles.infoCardTitle]}>
            Station Assignment & Identification
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCol}>
              <Icon name="badge" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={[typography.caption, styles.infoLabel]}>EMPLOYEE / WORKER ID</Text>
              <Text style={[typography.bodyMedium, styles.infoValue]}>
                {user?.workerId || 'EMP-7842'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCol}>
              <Icon name="building" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={[typography.caption, styles.infoLabel]}>PETROL PUMP / BRANCH</Text>
              <Text style={[typography.bodyMedium, styles.infoValue]}>
                {user?.petrolPumpName || 'Downtown City Station'}
              </Text>
              <Text style={[typography.caption, styles.infoSubValue]}>
                {user?.branchName || 'Branch #104 (MG Road)'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCol}>
              <Icon name="phone" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={[typography.caption, styles.infoLabel]}>MOBILE NUMBER</Text>
              <Text style={[typography.bodyMedium, styles.infoValue]}>
                {user?.mobileNumber || '+91 98765 43210'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCol}>
              <Icon name="mail" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={[typography.caption, styles.infoLabel]}>EMAIL ADDRESS</Text>
              <Text style={[typography.bodyMedium, styles.infoValue]}>
                {user?.email || 'worker@petrolpump.com'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCol}>
              <Icon name="calendar" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={[typography.caption, styles.infoLabel]}>JOINING DATE</Text>
              <Text style={[typography.bodyMedium, styles.infoValue]}>
                {formatDate(user?.joiningDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Menu Items */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.menuItem}
          >
            <View style={styles.menuIconCircle}>
              <Icon name="edit" size={18} color={colors.primary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[typography.bodyMedium, styles.menuTitle]}>
                Edit Profile
              </Text>
              <Text style={[typography.caption, styles.menuSub]}>
                Update contact information & photo
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>



          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLogoutModalVisible(true)}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: colors.dangerLight }]}>
              <Icon name="logout" size={18} color={colors.danger} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[typography.bodyMedium, styles.menuTitleDanger]}>
                Sign Out 
              </Text>
              <Text style={[typography.caption, styles.menuSub]}>
                Disconnect session safely
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={logoutModalVisible}
        title="Sign Out of Terminal?"
        message="Ending your shift will disconnect the active QR scanner terminal. You can log back in at any time."
        icon="logout"
        iconColor={colors.danger}
        confirmTitle="Sign Out"
        confirmVariant="danger"
        cancelTitle="Stay Logged In"
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
        loading={loggingOut}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  profileHeaderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: colors.accent,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.accent,
    fontWeight: '800',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  workerName: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  roleChip: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.round,
  },
  roleChipText: {
    ...typography.badge,
    color: colors.textPrimary,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  infoCardTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: spacing.sm,
  },
  infoIconCol: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoTextCol: {
    flex: 1,
  },
  infoLabel: {
    color: colors.textMuted,
  },
  infoValue: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 1,
  },
  infoSubValue: {
    color: colors.textSecondary,
    marginTop: 1,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  menuTitleDanger: {
    color: colors.danger,
    fontWeight: '700',
  },
  menuSub: {
    color: colors.textSecondary,
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xxs,
  },
});

export default ProfileScreen;
