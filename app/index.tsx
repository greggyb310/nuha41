import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../constants/theme';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/auth/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>Welcome</Text>
        <Text style={styles.title}>NatureUP Health</Text>
        <Text style={styles.subtitle}>Your personalized nature therapy companion</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: '#9333EA',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.sizes.lg,
    maxWidth: 400,
  },
});
