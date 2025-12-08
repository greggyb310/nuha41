import { View, Text, StyleSheet, Pressable } from 'react-native';
import { RefreshCw, Droplets, Wind } from 'lucide-react-native';
import { WeatherIcon } from './WeatherIcon';
import { LoadingSpinner } from './LoadingSpinner';
import { colors, typography, spacing } from '../constants/theme';

interface WeatherCardProps {
  weather: {
    temperature: number;
    feels_like: number;
    humidity: number;
    description: string;
    wind_speed: number;
    conditions: string;
  } | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function WeatherCard({ weather, loading, error, onRefresh }: WeatherCardProps) {
  if (loading) {
    return (
      <View style={styles.card}>
        <LoadingSpinner message="Loading weather..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorTitle}>Weather Unavailable</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={onRefresh} style={styles.refreshButton}>
          <RefreshCw size={20} color={colors.surface} />
          <Text style={styles.refreshButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Current Weather</Text>
        <Pressable onPress={onRefresh} style={styles.iconButton}>
          <RefreshCw size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.mainWeather}>
        <WeatherIcon conditions={weather.conditions} size={64} />
        <View style={styles.temperatureContainer}>
          <Text style={styles.temperature}>{weather.temperature}°C</Text>
          <Text style={styles.feelsLike}>Feels like {weather.feels_like}°C</Text>
        </View>
      </View>

      <Text style={styles.description}>{weather.description}</Text>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Droplets size={20} color={colors.textSecondary} />
          <Text style={styles.detailText}>{weather.humidity}%</Text>
          <Text style={styles.detailLabel}>Humidity</Text>
        </View>

        <View style={styles.detailItem}>
          <Wind size={20} color={colors.textSecondary} />
          <Text style={styles.detailText}>{weather.wind_speed} m/s</Text>
          <Text style={styles.detailLabel}>Wind</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  iconButton: {
    padding: spacing.xs,
  },
  mainWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  temperatureContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  feelsLike: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    textTransform: 'capitalize',
    marginBottom: spacing.md,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  detailItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  detailLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  errorTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#DC2626',
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
  },
  refreshButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.surface,
  },
});
