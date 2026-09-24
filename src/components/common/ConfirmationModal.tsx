/**
 * Reusable Confirmation Modal Dialog
 */
import React, { ReactNode } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Button, ButtonVariant } from './Button';
import { Icon, IconName } from './Icon';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message?: string;
  children?: ReactNode;
  icon?: IconName;
  iconColor?: string;
  confirmTitle?: string;
  confirmVariant?: ButtonVariant;
  cancelTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  children,
  icon,
  iconColor = colors.primary,
  confirmTitle = 'Confirm',
  confirmVariant = 'primary',
  cancelTitle = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              {icon && (
                <View style={[styles.iconCircle, { backgroundColor: colors.borderLight }]}>
                  <Icon name={icon} size={30} color={iconColor} />
                </View>
              )}

              <Text style={[typography.h3, styles.title]}>{title}</Text>
              {message ? (
                <Text style={[typography.bodyMedium, styles.message]}>{message}</Text>
              ) : null}

              {children && <View style={styles.customContent}>{children}</View>}

              <View style={styles.buttonRow}>
                <Button
                  title={cancelTitle}
                  onPress={onCancel}
                  variant="outline"
                  size="md"
                  disabled={loading}
                  style={styles.cancelBtn}
                  fullWidth={false}
                />
                <Button
                  title={confirmTitle}
                  onPress={onConfirm}
                  variant={confirmVariant}
                  size="md"
                  loading={loading}
                  style={styles.confirmBtn}
                  fullWidth={false}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    ...shadows.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  customContent: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cancelBtn: {
    flex: 1,
  },
  confirmBtn: {
    flex: 1,
  },
});
