import Constants from 'expo-constants';
import {
  GooglePlace,
  PlaceAutocompleteResult,
  PlaceDetailsResult,
  NearbySearchParams,
} from '../types/places';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey || '';
const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

export async function searchPlacesAutocomplete(
  input: string,
  latitude?: number,
  longitude?: number
): Promise<PlaceAutocompleteResult[]> {
  try {
    if (!input || input.trim().length < 2) {
      return [];
    }

    const params = new URLSearchParams({
      input: input.trim(),
      key: GOOGLE_MAPS_API_KEY,
      types: 'establishment|natural_feature|park',
    });

    if (latitude && longitude) {
      params.append('location', `${latitude},${longitude}`);
      params.append('radius', '50000');
    }

    const url = `${PLACES_API_BASE_URL}/autocomplete/json?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json() as any;

    if (data.status === 'OK' && data.predictions) {
      return data.predictions.map((prediction: any) => ({
        place_id: prediction.place_id,
        description: prediction.description,
        structured_formatting: prediction.structured_formatting,
        types: prediction.types,
      }));
    }

    if (data.status === 'ZERO_RESULTS') {
      return [];
    }

    console.error('[PlacesAPI] Autocomplete error:', data.status, data.error_message);
    return [];
  } catch (error) {
    console.error('[PlacesAPI] Autocomplete request failed:', error);
    return [];
  }
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetailsResult | null> {
  try {
    const params = new URLSearchParams({
      place_id: placeId,
      key: GOOGLE_MAPS_API_KEY,
      fields: 'place_id,name,formatted_address,geometry,types,rating,user_ratings_total,formatted_phone_number,website,opening_hours,photos',
    });

    const url = `${PLACES_API_BASE_URL}/details/json?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json() as any;

    if (data.status === 'OK' && data.result) {
      return data.result;
    }

    console.error('[PlacesAPI] Place details error:', data.status, data.error_message);
    return null;
  } catch (error) {
    console.error('[PlacesAPI] Place details request failed:', error);
    return null;
  }
}

export async function searchNearbyPlaces(
  params: NearbySearchParams
): Promise<GooglePlace[]> {
  try {
    const { latitude, longitude, radius = 5000, type = 'park', keyword } = params;

    const searchParams = new URLSearchParams({
      location: `${latitude},${longitude}`,
      radius: radius.toString(),
      type,
      key: GOOGLE_MAPS_API_KEY,
    });

    if (keyword) {
      searchParams.append('keyword', keyword);
    }

    const url = `${PLACES_API_BASE_URL}/nearbysearch/json?${searchParams.toString()}`;
    const response = await fetch(url);
    const data = await response.json() as any;

    if (data.status === 'OK' && data.results) {
      return data.results.map((result: any) => ({
        place_id: result.place_id,
        name: result.name,
        formatted_address: result.formatted_address,
        geometry: result.geometry,
        types: result.types,
        rating: result.rating,
        user_ratings_total: result.user_ratings_total,
        opening_hours: result.opening_hours,
        photos: result.photos,
        vicinity: result.vicinity,
      }));
    }

    if (data.status === 'ZERO_RESULTS') {
      return [];
    }

    console.error('[PlacesAPI] Nearby search error:', data.status, data.error_message);
    return [];
  } catch (error) {
    console.error('[PlacesAPI] Nearby search request failed:', error);
    return [];
  }
}

export async function getPhotoUrl(
  photoReference: string,
  maxWidth: number = 400
): Promise<string> {
  const params = new URLSearchParams({
    photo_reference: photoReference,
    maxwidth: maxWidth.toString(),
    key: GOOGLE_MAPS_API_KEY,
  });

  return `${PLACES_API_BASE_URL}/photo?${params.toString()}`;
}

export function filterNaturePlaces(places: GooglePlace[]): GooglePlace[] {
  const natureKeywords = [
    'park',
    'trail',
    'nature',
    'forest',
    'lake',
    'mountain',
    'beach',
    'garden',
    'reserve',
    'wilderness',
    'outdoor',
    'hiking',
    'scenic',
  ];

  return places.filter((place) => {
    const nameMatch = natureKeywords.some((keyword) =>
      place.name.toLowerCase().includes(keyword)
    );

    const typeMatch = place.types?.some((type) =>
      ['park', 'natural_feature', 'campground', 'tourist_attraction'].includes(type)
    );

    return nameMatch || typeMatch;
  });
}
