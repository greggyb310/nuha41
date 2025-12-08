import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { LoadingSpinner, Button, WeatherCard } from '../../components';
import { colors, typography, spacing } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, profile, signOut } = useAuth();
  const { coordinates, loading: locationLoading, error: locationError, getCurrentLocation } = useLocation();
  const { weather, loading: weatherLoading, error: weatherError, refresh: refreshWeather } = useWeather(
    coordinates?.latitude,
    coordinates?.longitude
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    } else if (!isLoading && isAuthenticated && profile) {
      if (!profile.full_name || !profile.health_goals || profile.health_goals.length === 0) {
        router.replace('/profile/setup');
      }
    }
  }, [isLoading, isAuthenticated, profile]);

  useEffect(() => {
    if (isAuthenticated && !coordinates && !locationLoading) {
      console.log('[HomeScreen] Fetching location on mount');
      getCurrentLocation();
    }
  }, [isAuthenticated, coordinates, locationLoading]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.greeting}>Hello{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!</Text>
      <Text style={styles.title}>NatureUP Health</Text>
      <Text style={styles.subtitle}>Your personalized nature therapy companion</Text>

      <View style={styles.quickActions}>
        <Button
          title="Talk to Coach"
          onPress={() => router.push('/coach')}
          style={styles.actionButton}
        />
        <Button
          title="Create Excursion"
          onPress={() => router.push('/excursions/create')}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          title="View My Excursions"
          onPress={() => router.push('/excursions')}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>

      {locationLoading && !coordinates && (
        <View style={styles.locationCard}>
          <LoadingSpinner size="small" />
          <Text style={styles.locationText}>Getting your location for personalized excursions...</Text>
        </View>
      )}

      {locationError && !coordinates && (
        <View style={styles.locationCard}>
          <Text style={styles.errorText}>{locationError}</Text>
          <Button
            title="Retry"
            onPress={getCurrentLocation}
            style={styles.retryButton}
          />
        </View>
      )}

      {coordinates && (
        <WeatherCard
          weather={weather}
          loading={weatherLoading}
          error={weatherError}
          onRefresh={refreshWeather}
        />
      )}

      {profile && (
        <View style={styles.profileCard}>
          <Text style={styles.profileLabel}>Email</Text>
          <Text style={styles.profileValue}>{user?.email}</Text>

          {profile.health_goals && profile.health_goals.length > 0 && (
            <>
              <Text style={[styles.profileLabel, styles.profileLabelSpaced]}>Health Goals</Text>
              <Text style={styles.profileValue}>{profile.health_goals.join(', ')}</Text>
            </>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title="Edit Profile"
          onPress={() => router.push('/profile/setup')}
          variant="secondary"
          style={styles.editButton}
        />

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          style={styles.signOutButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.sizes.base,
    marginBottom: spacing.xl,
  },
  profileCard: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    marginBottom: spacing.lg,
  },
  profileLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  profileLabelSpaced: {
    marginTop: spacing.md,
  },
  profileValue: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.normal * typography.sizes.base,
  },
  actions: {
    width: '100%',
    maxWidth: 400,
    gap: spacing.sm,
  },
  editButton: {
    width: '100%',
  },
  signOutButton: {
    width: '100%',
  },
  quickActions: {
    width: '100%',
    maxWidth: 400,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    width: '100%',
  },
  locationCard: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  locationText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    minWidth: 120,
  },
});
