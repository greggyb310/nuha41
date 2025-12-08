import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

interface TextAreaProps extends Omit<TextInputProps, 'style' | 'multiline'> {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  rows = 4,
  maxLength,
  showCount = false,
  value,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const minHeight = rows * 20 + spacing.md * 2;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showCount && maxLength && (
            <Text style={styles.counter}>
              {value?.toString().length || 0}/{maxLength}
            </Text>
          )}
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          { minHeight },
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline
          textAlignVertical="top"
          maxLength={maxLength}
          value={value}
          {...textInputProps}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {!error && helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  counter: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  input: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.normal * typography.sizes.base,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
