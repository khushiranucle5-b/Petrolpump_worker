/**
 * Reusable Text Input Component
 * Includes label, helper text, error state, left/right icons, password reveal toggle, and ₹ prefix.
 */
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Icon, IconName } from './Icon';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  isPassword?: boolean;
  prefix?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  prefix,
  containerStyle,
  inputStyle,
  required = false,
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const hasError = !!error;

  const getBorderColor = () => {
    if (hasError) return colors.danger;
    if (isFocused) return colors.borderFocused;
    return colors.border;
  };

  const getBackgroundColor = () => {
    if (restProps.editable === false) return colors.borderLight;
    if (isFocused) return colors.surface;
    return colors.surfaceSecondary;
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={[typography.label, styles.label]}>
            {label}
            {required && <Text style={styles.requiredStar}> *</Text>}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
        ]}
      >
        {leftIcon && (
          <View style={styles.iconContainer}>
            <Icon
              name={leftIcon}
              size={18}
              color={isFocused ? colors.accent : colors.textSecondary}
            />
          </View>
        )}

        {prefix && (
          <Text style={[typography.h3, styles.prefixText]}>{prefix}</Text>
        )}

        <TextInput
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={e => {
            setIsFocused(true);
            restProps.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            restProps.onBlur?.(e);
          }}
          style={[styles.input, typography.bodyMedium, inputStyle]}
          {...restProps}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.iconButton}
          >
            <Icon
              name={rightIcon}
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {hasError ? (
        <View style={styles.messageRow}>
          <Icon name="alert-circle" size={12} color={colors.danger} />
          <Text style={[typography.caption, styles.errorText]}>{error}</Text>
        </View>
      ) : helper ? (
        <Text style={[typography.caption, styles.helperText]}>{helper}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.textPrimary,
  },
  requiredStar: {
    color: colors.danger,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputFocused: {
    borderWidth: 1.5,
  },
  inputError: {
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  iconButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  prefixText: {
    color: colors.primary,
    fontWeight: '700',
    marginRight: spacing.xs,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  errorText: {
    color: colors.danger,
    marginLeft: spacing.xxs,
  },
  helperText: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
