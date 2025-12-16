import Constants from 'expo-constants';
import { PlacesRequest, PlacesResponse } from '../types/places';

function getEnvVars(): { SUPABASE_URL: string; SUPABASE_ANON_KEY: string } | null {
  const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[PlacesAPI] Missing Supabase environment variables');
    return null;
  }

  return { SUPABASE_URL, SUPABASE_ANON_KEY };
}

export async function fetchNearbyNature(request: PlacesRequest): Promise<PlacesResponse> {
  const envVars = getEnvVars();
  if (!envVars) {
    return { places: [], status: 'error', error: 'Supabase not configured' };
  }
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = envVars;
  const url = `${SUPABASE_URL}/functions/v1/places-lookup`;

  console.log('[PlacesAPI] Fetching nearby nature:', request);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(request),
  });

  const data = (await res.json()) as PlacesResponse;

  console.log('[PlacesAPI] Response:', { status: res.status, placesCount: data.places?.length ?? 0 });

  if (!res.ok) {
    throw new Error(data?.error ?? 'places-lookup failed');
  }

  return data;
}

export const placesApi = {
  async searchNearby(request: PlacesRequest): Promise<PlacesResponse> {
    return fetchNearbyNature(request);
  },

  async findNatureSpots(latitude: number, longitude: number, radiusMeters: number = 8000): Promise<PlacesResponse> {
    return this.searchNearby({
      latitude,
      longitude,
      radius: radiusMeters,
    });
  },
};
