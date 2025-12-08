import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner, Button, Badge } from '../../components';
import { colors, typography, spacing } from '../../constants/theme';
import { databaseService } from '../../services/database';
import type { Excursion } from '../../types/database';

export default function ExcursionsListScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'upcoming'>('all');

  useEffect(() => {
    loadExcursions();
  }, [filter]);

  const loadExcursions = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const completed = filter === 'completed' ? true : filter === 'upcoming' ? false : undefined;
      const { data, error: dbError } = await databaseService.getUserExcursions(user.id, completed);

      if (dbError) {
        throw new Error(dbError.message);
      }

      setExcursions(data || []);
    } catch (err) {
      console.error('Error loading excursions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load excursions');
    } finally {
      setLoading(false);
    }
  };

  const handleExcursionPress = (id: string) => {
    router.push(`/excursions/${id}`);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading excursions..." />;
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Excursions</Text>
        <Button
          title="Create New"
          onPress={() => router.push('/excursions/create')}
          style={styles.createButton}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'upcoming' && styles.filterButtonActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterButtonText, filter === 'upcoming' && styles.filterButtonTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterButtonText, filter === 'completed' && styles.filterButtonTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {excursions.length === 0 && !error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No excursions yet</Text>
          <Text style={styles.emptyStateText}>
            Create your first personalized nature therapy route
          </Text>
          <Button
            title="Create Excursion"
            onPress={() => router.push('/excursions/create')}
            style={styles.emptyStateButton}
          />
        </View>
      ) : (
        <View style={styles.list}>
          {excursions.map((excursion) => (
            <TouchableOpacity
              key={excursion.id}
              style={styles.excursionCard}
              onPress={() => handleExcursionPress(excursion.id)}
            >
              <View style={styles.excursionHeader}>
                <Text style={styles.excursionTitle} numberOfLines={2}>
                  {excursion.title}
                </Text>
                {excursion.difficulty && (
                  <Badge
                    label={excursion.difficulty.charAt(0).toUpperCase() + excursion.difficulty.slice(1)}
                    variant={
                      excursion.difficulty === 'easy'
                        ? 'success'
                        : excursion.difficulty === 'moderate'
                        ? 'warning'
                        : 'error'
                    }
                  />
                )}
              </View>

              {excursion.description && (
                <Text style={styles.excursionDescription} numberOfLines={2}>
                  {excursion.description}
                </Text>
              )}

              <View style={styles.excursionStats}>
                {excursion.duration_minutes && (
                  <Text style={styles.excursionStat}>
                    {excursion.duration_minutes} min
                  </Text>
                )}
                {excursion.distance_km && (
                  <Text style={styles.excursionStat}>
                    {excursion.distance_km.toFixed(1)} km
                  </Text>
                )}
                {excursion.route_data.terrain_type && (
                  <Text style={styles.excursionStat}>
                    {excursion.route_data.terrain_type}
                  </Text>
                )}
              </View>

              {excursion.completed_at && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>
                    Completed {new Date(excursion.completed_at).toLocaleDateString()}
                  </Text>
                </View>
              )}

              <Text style={styles.excursionDate}>
                Created {new Date(excursion.created_at).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  createButton: {
    paddingHorizontal: spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  filterButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  filterButtonTextActive: {
    color: colors.surface,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyStateTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeights.normal * typography.sizes.base,
  },
  emptyStateButton: {
    paddingHorizontal: spacing.xl,
  },
  list: {
    gap: spacing.md,
  },
  excursionCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  excursionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  excursionTitle: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  excursionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.normal * typography.sizes.sm,
    marginBottom: spacing.md,
  },
  excursionStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  excursionStat: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  completedBadgeText: {
    fontSize: typography.sizes.xs,
    color: '#065F46',
    fontWeight: typography.weights.semibold,
  },
  excursionDate: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});
