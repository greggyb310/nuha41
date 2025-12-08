import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner, Button, Map, Badge } from '../../components';
import { colors, typography, spacing } from '../../constants/theme';
import { databaseService } from '../../services/database';
import type { Excursion } from '../../types/database';

export default function ExcursionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [excursion, setExcursion] = useState<Excursion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      loadExcursion();
      checkFavoriteStatus();
    }
  }, [id]);

  const loadExcursion = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await databaseService.getExcursionById(id);

      if (dbError || !data) {
        throw new Error(dbError?.message || 'Excursion not found');
      }

      setExcursion(data);
    } catch (err) {
      console.error('Error loading excursion:', err);
      setError(err instanceof Error ? err.message : 'Failed to load excursion');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user || !id) return;

    try {
      const { data } = await databaseService.isFavorite(user.id, id);
      setIsFavorite(!!data);
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user || !id) return;

    try {
      if (isFavorite) {
        await databaseService.removeFavoriteExcursion(user.id, id);
        setIsFavorite(false);
      } else {
        await databaseService.addFavoriteExcursion(user.id, id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleComplete = async () => {
    if (!id) return;

    try {
      await databaseService.completeExcursion(id);
      loadExcursion();
    } catch (err) {
      console.error('Error completing excursion:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading excursion..." />;
  }

  if (error || !excursion) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Excursion not found'}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const markers = excursion.route_data.waypoints.map((waypoint) => ({
    latitude: waypoint.latitude,
    longitude: waypoint.longitude,
    title: waypoint.name || `Waypoint ${waypoint.order}`,
    description: waypoint.description,
  }));

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{excursion.title}</Text>
        {excursion.difficulty && (
          <Badge
            label={excursion.difficulty.toUpperCase()}
            variant={excursion.difficulty === 'easy' ? 'success' : excursion.difficulty === 'moderate' ? 'warning' : 'error'}
          />
        )}
      </View>

      {excursion.completed_at && (
        <View style={styles.completedBanner}>
          <Text style={styles.completedText}>
            Completed on {new Date(excursion.completed_at).toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={styles.stats}>
        {excursion.duration_minutes && (
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{excursion.duration_minutes} min</Text>
          </View>
        )}
        {excursion.distance_km && (
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{excursion.distance_km.toFixed(1)} km</Text>
          </View>
        )}
        {excursion.route_data.terrain_type && (
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Terrain</Text>
            <Text style={styles.statValue}>{excursion.route_data.terrain_type}</Text>
          </View>
        )}
      </View>

      {excursion.description && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{excursion.description}</Text>
        </View>
      )}

      <View style={styles.mapContainer}>
        {Platform.OS !== 'web' ? (
          <Map
            initialRegion={{
              latitude: excursion.route_data.start_location.latitude,
              longitude: excursion.route_data.start_location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            markers={markers}
            polyline={markers}
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>
              Map view available on mobile
            </Text>
            <Text style={styles.mapCoordinates}>
              Start: {excursion.route_data.start_location.latitude.toFixed(4)}, {excursion.route_data.start_location.longitude.toFixed(4)}
            </Text>
          </View>
        )}
      </View>

      {excursion.route_data.waypoints.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Waypoints</Text>
          {excursion.route_data.waypoints
            .sort((a, b) => a.order - b.order)
            .map((waypoint, index) => (
              <View key={index} style={styles.waypoint}>
                <View style={styles.waypointNumber}>
                  <Text style={styles.waypointNumberText}>{waypoint.order}</Text>
                </View>
                <View style={styles.waypointContent}>
                  {waypoint.name && (
                    <Text style={styles.waypointName}>{waypoint.name}</Text>
                  )}
                  {waypoint.description && (
                    <Text style={styles.waypointDescription}>{waypoint.description}</Text>
                  )}
                </View>
              </View>
            ))}
        </View>
      )}

      <View style={styles.actions}>
        {!excursion.completed_at && (
          <Button
            title="Mark as Completed"
            onPress={handleComplete}
            style={styles.actionButton}
          />
        )}
        <Button
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          onPress={handleToggleFavorite}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          title="Back to Home"
          onPress={() => router.push('/home')}
          variant="outline"
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    flex: 1,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginRight: spacing.md,
  },
  completedBanner: {
    backgroundColor: '#D1FAE5',
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.lg,
  },
  completedText: {
    fontSize: typography.sizes.sm,
    color: '#065F46',
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
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
  description: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.relaxed * typography.sizes.base,
  },
  mapContainer: {
    height: 300,
    borderRadius: spacing.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  mapPlaceholderText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  mapCoordinates: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  waypoint: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  waypointNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  waypointNumberText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.surface,
  },
  waypointContent: {
    flex: 1,
  },
  waypointName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  waypointDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.normal * typography.sizes.sm,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
