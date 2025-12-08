import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getDisabledStyle = (): ViewStyle | undefined => {
    if (!(disabled || loading)) return undefined;
    const key = `button_${variant}_disabled` as keyof typeof styles;
    const disabledStyle = styles[key];
    return disabledStyle as ViewStyle | undefined;
  };

  const buttonStyles: ViewStyle[] = [
    styles.button,
    styles[`button_${variant}` as keyof typeof styles] as ViewStyle,
    styles[`button_${size}` as keyof typeof styles] as ViewStyle,
    fullWidth ? styles.fullWidth : {},
    (disabled || loading) ? styles.buttonDisabled : {},
    getDisabledStyle() || {},
    style || {},
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${variant}` as keyof typeof styles] as TextStyle,
    styles[`text_${size}` as keyof typeof styles] as TextStyle,
    (disabled || loading) ? styles.textDisabled : {},
    textStyle || {},
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? colors.surface : colors.primary}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  button_primary: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  button_secondary: {
    backgroundColor: colors.accent,
    ...shadows.sm,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_danger: {
    backgroundColor: colors.error,
    ...shadows.sm,
  },
  button_small: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  button_medium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  button_large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
  },
  fullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  button_primary_disabled: {
    backgroundColor: colors.disabledBackground,
  },
  button_secondary_disabled: {
    backgroundColor: colors.disabledBackground,
  },
  button_outline_disabled: {
    borderColor: colors.disabled,
  },
  button_danger_disabled: {
    backgroundColor: colors.disabledBackground,
  },
  text: {
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  text_primary: {
    color: colors.surface,
  },
  text_secondary: {
    color: colors.surface,
  },
  text_outline: {
    color: colors.primary,
  },
  text_ghost: {
    color: colors.primary,
  },
  text_danger: {
    color: colors.surface,
  },
  text_small: {
    fontSize: typography.sizes.sm,
  },
  text_medium: {
    fontSize: typography.sizes.base,
  },
  text_large: {
    fontSize: typography.sizes.lg,
  },
  textDisabled: {
    color: colors.disabled,
  },
});
