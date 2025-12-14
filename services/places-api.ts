import { PlacesRequest, PlacesResponse } from '../types/places';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const placesApi = {
  async searchNearby(request: PlacesRequest): Promise<PlacesResponse> {
    const apiUrl = `${SUPABASE_URL}/functions/v1/places-lookup`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Places API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data as PlacesResponse;
  },

  async findNatureSpots(latitude: number, longitude: number, radiusMeters: number = 5000): Promise<PlacesResponse> {
    return this.searchNearby({
      latitude,
      longitude,
      radius: radiusMeters,
    });
  },
};
