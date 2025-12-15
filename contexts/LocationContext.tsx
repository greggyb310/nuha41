import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import type { Coordinates } from '@/types/location';

interface LocationContextType {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
  permissionStatus: 'undetermined' | 'granted' | 'denied' | null;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
  clearError: () => void;
}

export const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied' | null>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[LocationProvider] Requesting location permission...');

      if (Platform.OS === 'web') {
        console.log('[LocationProvider] Web platform detected - permission handling differs');
        setPermissionStatus('granted');
        return true;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('[LocationProvider] Permission status:', status);

      if (status === 'granted') {
        setPermissionStatus('granted');
        setError(null);
        return true;
      } else {
        setPermissionStatus('denied');
        setError('Location permission denied. Please enable location access in Settings.');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request location permission';
      console.error('[LocationProvider] Permission error:', errorMessage);
      setError(errorMessage);
      setPermissionStatus('denied');
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('[LocationProvider] Getting current location...');

      if (Platform.OS === 'web') {
        console.log('[LocationProvider] Web platform - using browser geolocation');
        setCoordinates({
          latitude: 37.7749,
          longitude: -122.4194,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        });
        setError(null);
        setLoading(false);
        return;
      }

      const hasPermission = permissionStatus === 'granted' || await requestPermission();

      if (!hasPermission) {
        console.log('[LocationProvider] No permission granted');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      console.log('[LocationProvider] Location retrieved:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      setCoordinates({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        altitudeAccuracy: location.coords.altitudeAccuracy,
        heading: location.coords.heading,
        speed: location.coords.speed,
      });

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get current location';
      console.error('[LocationProvider] Location error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [permissionStatus, requestPermission]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    const initializeLocation = async () => {
      console.log('[LocationProvider] Initializing location...');

      if (Platform.OS === 'web') {
        await getCurrentLocation();
        return;
      }

      const { status } = await Location.getForegroundPermissionsAsync();
      console.log('[LocationProvider] Current permission status:', status);

      if (status === 'granted') {
        setPermissionStatus('granted');
        await getCurrentLocation();
      } else {
        setPermissionStatus(status === 'denied' ? 'denied' : 'undetermined');
      }
    };

    initializeLocation();
  }, []);

  const value: LocationContextType = {
    coordinates,
    loading,
    error,
    permissionStatus,
    requestPermission,
    getCurrentLocation,
    clearError,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};
