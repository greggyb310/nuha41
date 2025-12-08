import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'medium',
  style,
  textStyle,
}) => {
  const badgeStyles = [
    styles.badge,
    styles[`badge_${variant}`],
    styles[`badge_${size}`],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    textStyle,
  ];

  return (
    <View style={badgeStyles}>
      <Text style={textStyles}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  badge_primary: {
    backgroundColor: colors.primary,
  },
  badge_success: {
    backgroundColor: colors.successLight,
  },
  badge_warning: {
    backgroundColor: colors.warningLight,
  },
  badge_error: {
    backgroundColor: colors.errorLight,
  },
  badge_info: {
    backgroundColor: colors.infoLight,
  },
  badge_neutral: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge_small: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 3,
  },
  badge_medium: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  badge_large: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontWeight: typography.weights.semibold,
  },
  text_primary: {
    color: colors.surface,
  },
  text_success: {
    color: colors.success,
  },
  text_warning: {
    color: colors.warning,
  },
  text_error: {
    color: colors.error,
  },
  text_info: {
    color: colors.info,
  },
  text_neutral: {
    color: colors.textPrimary,
  },
  text_small: {
    fontSize: typography.sizes.xs,
  },
  text_medium: {
    fontSize: typography.sizes.sm,
  },
  text_large: {
    fontSize: typography.sizes.base,
  },
});
