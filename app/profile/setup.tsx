import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, AppState, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Card, Badge, LoadingSpinner } from '../../components';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { User, CheckCircle, Circle } from 'lucide-react-native';

const HEALTH_GOALS = [
  'Reduce stress',
  'Improve sleep',
  'Increase energy',
  'Better mood',
  'Weight management',
  'Cardiovascular health',
  'Mental clarity',
  'Build resilience',
  'Connect with nature',
  'Physical fitness',
];

const ACTIVITY_PREFERENCES = [
  { key: 'walking', label: 'Walking' },
  { key: 'hiking', label: 'Hiking' },
  { key: 'meditation', label: 'Meditation' },
  { key: 'yoga', label: 'Outdoor Yoga' },
  { key: 'running', label: 'Running' },
  { key: 'cycling', label: 'Cycling' },
];

const DIFFICULTY_LEVELS = [
  { key: 'easy', label: 'Easy', description: 'Gentle walks and relaxation' },
  { key: 'moderate', label: 'Moderate', description: 'Balanced activity level' },
  { key: 'challenging', label: 'Challenging', description: 'Intense outdoor activities' },
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, profile, updateProfile, isLoading: authLoading } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(profile?.health_goals || []);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    (profile?.preferences as any)?.activities || []
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'moderate' | 'challenging'>(
    (profile?.preferences as any)?.difficulty || 'moderate'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const nameInputRef = useRef<TextInput>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (nameInputRef.current?.isFocused()) {
          setTimeout(() => {
            nameInputRef.current?.focus();
          }, 100);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const toggleActivity = (activity: string) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter((a) => a !== activity));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }

    if (selectedGoals.length === 0) {
      setError('Please select at least one health goal');
      return false;
    }

    if (selectedActivities.length === 0) {
      setError('Please select at least one activity preference');
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await updateProfile({
        full_name: fullName,
        health_goals: selectedGoals,
        preferences: {
          activities: selectedActivities,
          difficulty: selectedDifficulty,
        },
      });

      if (updateError) {
        setError(updateError.message || 'Failed to save profile');
        setIsLoading(false);
        return;
      }

      router.replace('/home');
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Help us personalize your wellness journey
          </Text>
        </View>

        <View style={styles.form}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <Input
              ref={nameInputRef}
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              leftIcon={<User size={20} color={colors.textSecondary} />}
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Health Goals</Text>
            <Text style={styles.sectionDescription}>
              Select all that apply (choose at least one)
            </Text>
            <View style={styles.goalsContainer}>
              {HEALTH_GOALS.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.goalChip,
                      isSelected && styles.goalChipSelected,
                    ]}
                    onPress={() => toggleGoal(goal)}
                    activeOpacity={0.7}
                  >
                    {isSelected ? (
                      <CheckCircle size={16} color={colors.primary} style={styles.goalIcon} />
                    ) : (
                      <Circle size={16} color={colors.textSecondary} style={styles.goalIcon} />
                    )}
                    <Text
                      style={[
                        styles.goalText,
                        isSelected && styles.goalTextSelected,
                      ]}
                    >
                      {goal}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Preferences</Text>
            <Text style={styles.sectionDescription}>
              What activities do you enjoy?
            </Text>
            <View style={styles.goalsContainer}>
              {ACTIVITY_PREFERENCES.map((activity) => {
                const isSelected = selectedActivities.includes(activity.key);
                return (
                  <TouchableOpacity
                    key={activity.key}
                    style={[
                      styles.goalChip,
                      isSelected && styles.goalChipSelected,
                    ]}
                    onPress={() => toggleActivity(activity.key)}
                    activeOpacity={0.7}
                  >
                    {isSelected ? (
                      <CheckCircle size={16} color={colors.primary} style={styles.goalIcon} />
                    ) : (
                      <Circle size={16} color={colors.textSecondary} style={styles.goalIcon} />
                    )}
                    <Text
                      style={[
                        styles.goalText,
                        isSelected && styles.goalTextSelected,
                      ]}
                    >
                      {activity.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Difficulty Level</Text>
            <Text style={styles.sectionDescription}>
              Choose your preferred activity intensity
            </Text>
            {DIFFICULTY_LEVELS.map((level) => {
              const isSelected = selectedDifficulty === level.key;
              return (
                <TouchableOpacity
                  key={level.key}
                  style={[
                    styles.difficultyCard,
                    isSelected && styles.difficultyCardSelected,
                  ]}
                  onPress={() => setSelectedDifficulty(level.key as 'easy' | 'moderate' | 'challenging')}
                  activeOpacity={0.7}
                >
                  <View style={styles.difficultyHeader}>
                    <Text
                      style={[
                        styles.difficultyLabel,
                        isSelected && styles.difficultyLabelSelected,
                      ]}
                    >
                      {level.label}
                    </Text>
                    {isSelected && (
                      <CheckCircle size={20} color={colors.primary} />
                    )}
                  </View>
                  <Text style={styles.difficultyDescription}>
                    {level.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Card>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title="Save Profile"
            onPress={handleSaveProfile}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            size="large"
            style={styles.saveButton}
          />

          <Button
            title="Skip for Now"
            onPress={() => router.replace('/home')}
            variant="ghost"
            size="medium"
            style={styles.skipButton}
          />
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
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
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
  section: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeights.normal * typography.sizes.sm,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
  },
  goalChipSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  goalIcon: {
    marginRight: spacing.xs,
  },
  goalText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  goalTextSelected: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  difficultyCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  difficultyCardSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  difficultyLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  difficultyLabelSelected: {
    color: colors.primary,
  },
  difficultyDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.normal * typography.sizes.sm,
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
  saveButton: {
    marginTop: spacing.md,
  },
  skipButton: {
    marginTop: spacing.sm,
  },
});
