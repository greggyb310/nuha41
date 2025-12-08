import { useState, useEffect, useCallback } from 'react';
import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  description: string;
  wind_speed: number;
  conditions: string;
}

interface CachedWeather {
  data: WeatherData;
  timestamp: number;
}

const CACHE_DURATION = 30 * 60 * 1000;

const weatherCache: { [key: string]: CachedWeather } = {};

export function useWeather(latitude?: number, longitude?: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCacheKey = (lat: number, lon: number) => `${lat.toFixed(3)},${lon.toFixed(3)}`;

  const fetchWeather = useCallback(async (lat: number, lon: number, force = false) => {
    const cacheKey = getCacheKey(lat, lon);

    if (!force && weatherCache[cacheKey]) {
      const cached = weatherCache[cacheKey];
      const age = Date.now() - cached.timestamp;

      if (age < CACHE_DURATION) {
        console.log('Using cached weather data');
        setWeather(cached.data);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/weather`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude: lat, longitude: lon }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to fetch weather');
      }

      const data = await response.json() as WeatherData;

      weatherCache[cacheKey] = {
        data,
        timestamp: Date.now(),
      };

      setWeather(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(message);
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    if (latitude !== undefined && longitude !== undefined) {
      fetchWeather(latitude, longitude, true);
    }
  }, [latitude, longitude, fetchWeather]);

  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      fetchWeather(latitude, longitude);
    }
  }, [latitude, longitude, fetchWeather]);

  return {
    weather,
    loading,
    error,
    refresh,
  };
}
