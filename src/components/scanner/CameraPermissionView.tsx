/**
 * Camera Permission & Error State View
 * Explains camera requirement for Android and iOS and provides manual fallback.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { openAppSettings } from '../../utils/permissions';

interface CameraPermissionViewProps {
  onRequestPermission: () => void;
  onUseManualInput?: () => void;
  isBlocked?: boolean;
}

export const CameraPermissionView: React.FC<CameraPermissionViewProps> = ({
  onRequestPermission,
  onUseManualInput,
  isBlocked = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Icon name="camera" size={40} color={colors.accent} />
        </View>

        <Text style={[typography.h2, styles.title]}>Camera Access Required</Text>

        <Text style={[typography.bodyMedium, styles.description]}>
          PetrolPump Worker needs camera permission to scan short-lived customer discount QR codes at the pump.
        </Text>

        <View style={styles.benefitList}>
          <View style={styles.benefitItem}>
            <Icon name="shield-check" size={18} color={colors.success} />
            <Text style={[typography.bodySmall, styles.benefitText]}>
              Instant verification of group discounts & corporate plans
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon name="history" size={18} color={colors.success} />
            <Text style={[typography.bodySmall, styles.benefitText]}>
              Validates 60-second dynamic security tokens in real-time
            </Text>
          </View>
        </View>

        {isBlocked ? (
          <Button
            title="Open App Settings"
            onPress={openAppSettings}
            variant="accent"
            size="lg"
            leftIcon="lock"
            style={styles.actionBtn}
          />
        ) : (
          <Button
            title="Grant Camera Access"
            onPress={onRequestPermission}
            variant="accent"
            size="lg"
            leftIcon="camera"
            style={styles.actionBtn}
          />
        )}

        {onUseManualInput && (
          <Button
            title="Enter QR Code Manually / Demo"
            onPress={onUseManualInput}
            variant="ghost"
            size="md"
            style={styles.manualBtn}
            textStyle={{ color: colors.accentLight }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
    ...shadows.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  title: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  benefitList: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  benefitText: {
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  actionBtn: {
    marginBottom: spacing.sm,
  },
  manualBtn: {
    marginTop: spacing.xs,
  },
});
