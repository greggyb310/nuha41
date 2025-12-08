import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { databaseService } from '../services/database';
import type { UserPreferences } from '../types/database';

export type UnitSystem = 'imperial' | 'metric';

interface UseMapPreferencesReturn {
  unitSystem: UnitSystem;
  isLoading: boolean;
  error: string | null;
  updateUnitSystem: (system: UnitSystem) => Promise<void>;
}

export const useMapPreferences = (): UseMapPreferencesReturn => {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unitSystem: UnitSystem = profile?.preferences?.unit_system ?? 'imperial';

  const updateUnitSystem = useCallback(async (system: UnitSystem) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentPreferences = profile?.preferences ?? {};
      const updatedPreferences: UserPreferences = {
        ...currentPreferences,
        unit_system: system,
      };

      const { error: updateError } = await databaseService.updateUserProfile(
        user.id,
        { preferences: updatedPreferences }
      );

      if (updateError) {
        setError(updateError.message);
      } else {
        await refreshProfile();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update unit system');
    } finally {
      setIsLoading(false);
    }
  }, [user, profile, refreshProfile]);

  return {
    unitSystem,
    isLoading,
    error,
    updateUnitSystem,
  };
};
