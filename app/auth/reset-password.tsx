import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../../components';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { Mail, ArrowLeft } from 'lucide-react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error: resetError } = await resetPassword(email);

      if (resetError) {
        setError(resetError.message || 'Failed to send reset email');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Button
          title="Back"
          variant="ghost"
          size="small"
          onPress={() => router.back()}
          style={styles.backButton}
          textStyle={styles.backButtonText}
        />

        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password
          </Text>
        </View>

        <View style={styles.form}>
          {!success ? (
            <>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                leftIcon={<Mail size={20} color={colors.textSecondary} />}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Button
                title="Send Reset Link"
                onPress={handleResetPassword}
                loading={isLoading}
                disabled={isLoading}
                fullWidth
                size="large"
                style={styles.resetButton}
              />
            </>
          ) : (
            <View style={styles.successContainer}>
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successText}>
                We've sent a password reset link to {email}. Please check your email and follow the instructions to reset your password.
              </Text>

              <Button
                title="Back to Login"
                onPress={() => router.push('/auth/login')}
                fullWidth
                size="large"
                style={styles.backToLoginButton}
              />
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <Button
              title="Sign In"
              variant="ghost"
              size="small"
              onPress={() => router.push('/auth/login')}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
  },
  backButtonText: {
    fontSize: typography.sizes.base,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.normal * typography.sizes.base,
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: spacing.md,
  },
  successContainer: {
    backgroundColor: colors.successLight,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  successTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.success,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.normal * typography.sizes.base,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backToLoginButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
});
