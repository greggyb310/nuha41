import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner, Button, Card } from '../../components';
import { colors, typography, spacing } from '../../constants/theme';
import { databaseService } from '../../services/database';
import { CheckCircle, Circle, MapPin, Clock, TrendingUp } from 'lucide-react-native';
import type { ExcursionOption } from '../../types/assistant';

export default function ExcursionChoicesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  const optionsParam = params.options as string;
  const options: ExcursionOption[] = optionsParam ? JSON.parse(optionsParam) : [];

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveExcursion = async () => {
    if (!user || selectedIndex < 0 || !options[selectedIndex]) {
      setError('Please select an excursion option');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const selectedOption = options[selectedIndex];

      const { data: savedExcursion, error: dbError } = await databaseService.createExcursion({
        user_id: user.id,
        title: selectedOption.title,
        description: selectedOption.description || null,
        route_data: selectedOption.route_data,
        duration_minutes: selectedOption.duration_minutes || null,
        distance_km: selectedOption.distance_km || null,
        difficulty: selectedOption.difficulty || null,
        completed_at: null,
      });

      if (dbError || !savedExcursion) {
        throw new Error(dbError?.message || 'Failed to save excursion');
      }

      router.replace(`/excursions/${savedExcursion.id}`);
    } catch (err) {
      console.error('Error saving excursion:', err);
      setError(err instanceof Error ? err.message : 'Failed to save excursion');
    } finally {
      setIsSaving(false);
    }
  };

  if (options.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No excursion options available</Text>
          <Button title="Go Back" onPress={() => router.back()} style={styles.backButton} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Choose Your Excursion</Text>
      <Text style={styles.subtitle}>Select the option that best fits your wellness goals</Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => setSelectedIndex(index)}
              activeOpacity={0.7}
            >
              <View style={styles.optionHeader}>
                <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                  {option.title}
                </Text>
                {isSelected ? (
                  <CheckCircle size={24} color={colors.primary} />
                ) : (
                  <Circle size={24} color={colors.textSecondary} />
                )}
              </View>

              <Text style={styles.optionDescription} numberOfLines={3}>
                {option.description}
              </Text>

              <View style={styles.optionMeta}>
                <View style={styles.metaItem}>
                  <Clock size={16} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{option.duration_minutes} min</Text>
                </View>
                <View style={styles.metaItem}>
                  <MapPin size={16} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{option.distance_km} km</Text>
                </View>
                <View style={styles.metaItem}>
                  <TrendingUp size={16} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{option.difficulty}</Text>
                </View>
              </View>

              {option.therapeutic_benefits && option.therapeutic_benefits.length > 0 && (
                <View style={styles.benefitsContainer}>
                  <Text style={styles.benefitsLabel}>Benefits:</Text>
                  <View style={styles.benefitsList}>
                    {option.therapeutic_benefits.slice(0, 2).map((benefit, i) => (
                      <Text key={i} style={styles.benefitTag}>
                        {benefit}
                      </Text>
                    ))}
                    {option.therapeutic_benefits.length > 2 && (
                      <Text style={styles.benefitTag}>
                        +{option.therapeutic_benefits.length - 2} more
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title={isSaving ? "Saving..." : "Start This Excursion"}
          onPress={handleSaveExcursion}
          disabled={isSaving || selectedIndex < 0}
          style={styles.startButton}
        />
        <Button
          title="Back"
          onPress={() => router.back()}
          variant="outline"
          disabled={isSaving}
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
  optionsContainer: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  optionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  optionTitleSelected: {
    color: colors.primary,
  },
  optionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeights.normal * typography.sizes.sm,
  },
  optionMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  benefitsContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  benefitsLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  benefitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  benefitTag: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
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
  startButton: {
    width: '100%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  backButton: {
    minWidth: 120,
  },
});
