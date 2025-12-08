import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { LoadingSpinner, Button } from '../../components';
import { colors, typography, spacing } from '../../constants/theme';
import { assistantAPI } from '../../services/assistant-api';
import { databaseService } from '../../services/database';
import type { ExcursionRequest, ExcursionPreferences } from '../../types/assistant';

export default function CreateExcursionScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { coordinates, loading: locationLoading, error: locationError, getCurrentLocation } = useLocation();
  const { weather } = useWeather(coordinates?.latitude, coordinates?.longitude);

  const [preferences, setPreferences] = useState<ExcursionPreferences>({
    duration_minutes: 30,
    difficulty: 'easy',
    terrain: 'park',
    time_of_day: 'morning',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const difficultyOptions: Array<{ value: 'easy' | 'moderate' | 'challenging'; label: string }> = [
    { value: 'easy', label: 'Easy' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'challenging', label: 'Challenging' },
  ];

  const terrainOptions: Array<{ value: 'forest' | 'beach' | 'mountain' | 'park' | 'urban'; label: string }> = [
    { value: 'park', label: 'Park' },
    { value: 'forest', label: 'Forest' },
    { value: 'beach', label: 'Beach' },
    { value: 'mountain', label: 'Mountain' },
    { value: 'urban', label: 'Urban' },
  ];

  const durationOptions = [15, 30, 45, 60, 90];

  const handleCreateExcursion = async () => {
    if (!user || !coordinates) {
      setError('Missing user or location data');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const request: ExcursionRequest = {
        user_id: user.id,
        preferences,
        location: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
        health_profile: profile ? {
          full_name: profile.full_name,
          health_goals: profile.health_goals || [],
          preferences: profile.preferences || {},
        } : undefined,
      };

      const excursionResponse = await assistantAPI.createExcursion(request);

      const { data: savedExcursion, error: dbError } = await databaseService.createExcursion({
        user_id: user.id,
        title: excursionResponse.title,
        description: excursionResponse.description || null,
        route_data: excursionResponse.route_data,
        duration_minutes: excursionResponse.duration_minutes || null,
        distance_km: excursionResponse.distance_km || null,
        difficulty: excursionResponse.difficulty || null,
        completed_at: null,
      });

      if (dbError || !savedExcursion) {
        throw new Error(dbError?.message || 'Failed to save excursion');
      }

      router.push(`/excursions/${savedExcursion.id}`);
    } catch (err) {
      console.error('Error creating excursion:', err);
      setError(err instanceof Error ? err.message : 'Failed to create excursion');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Create Your Excursion</Text>
      <Text style={styles.subtitle}>Customize your nature therapy experience</Text>

      {locationLoading && !coordinates && (
        <View style={styles.locationBanner}>
          <LoadingSpinner size="small" />
          <Text style={styles.locationBannerText}>Getting your location...</Text>
        </View>
      )}

      {locationError && !coordinates && (
        <View style={styles.locationBannerError}>
          <Text style={styles.locationBannerErrorText}>{locationError}</Text>
          <Button
            title="Retry"
            onPress={getCurrentLocation}
            style={styles.retryButton}
          />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Duration</Text>
        <View style={styles.optionGroup}>
          {durationOptions.map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.optionButton,
                preferences.duration_minutes === duration && styles.optionButtonActive,
              ]}
              onPress={() => setPreferences({ ...preferences, duration_minutes: duration })}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  preferences.duration_minutes === duration && styles.optionButtonTextActive,
                ]}
              >
                {duration} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Difficulty</Text>
        <View style={styles.optionGroup}>
          {difficultyOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                preferences.difficulty === option.value && styles.optionButtonActive,
              ]}
              onPress={() => setPreferences({ ...preferences, difficulty: option.value })}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  preferences.difficulty === option.value && styles.optionButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Terrain</Text>
        <View style={styles.optionGroup}>
          {terrainOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                preferences.terrain === option.value && styles.optionButtonActive,
              ]}
              onPress={() => setPreferences({ ...preferences, terrain: option.value })}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  preferences.terrain === option.value && styles.optionButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {weather && (
        <View style={styles.weatherInfo}>
          <Text style={styles.weatherLabel}>Current Weather</Text>
          <Text style={styles.weatherValue}>
            {weather.temperature}°C - {weather.description}
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title={isCreating ? "Creating..." : "Create Excursion"}
          onPress={handleCreateExcursion}
          disabled={isCreating || !coordinates}
          style={styles.createButton}
        />
        {!coordinates && (
          <Text style={styles.disabledHint}>
            Location required to create excursion
          </Text>
        )}
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          disabled={isCreating}
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
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeights.normal * typography.sizes.base,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    backgroundColor: colors.surface,
  },
  optionButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  optionButtonTextActive: {
    color: colors.surface,
  },
  weatherInfo: {
    backgroundColor: '#E0F2F1',
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  weatherLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  weatherValue: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  errorContainer: {
    padding: spacing.md,
    backgroundColor: '#FEE2E2',
    borderRadius: spacing.sm,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: '#DC2626',
    lineHeight: typography.lineHeights.normal * typography.sizes.sm,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  createButton: {
    width: '100%',
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  locationBannerText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  locationBannerError: {
    backgroundColor: '#FEE2E2',
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  locationBannerErrorText: {
    fontSize: typography.sizes.sm,
    color: '#DC2626',
    marginBottom: spacing.md,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
  disabledHint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
