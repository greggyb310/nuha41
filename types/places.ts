export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  kind: string;
  distance_m: number;
}

export interface PlacesRequest {
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface PlacesResponse {
  places: Place[];
  status: string;
  error?: string;
  detail?: string;
}

export interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now?: boolean;
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  vicinity?: string;
}

export interface PlaceAutocompleteResult {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
  types?: string[];
}

export interface PlaceDetailsResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

export interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
  type?: 'park' | 'natural_feature' | 'tourist_attraction' | 'hiking_area';
  keyword?: string;
}

export interface DirectionsResult {
  routes: Array<{
    legs: Array<{
      distance: {
        text: string;
        value: number;
      };
      duration: {
        text: string;
        value: number;
      };
      steps: Array<{
        distance: {
          text: string;
          value: number;
        };
        duration: {
          text: string;
          value: number;
        };
        html_instructions: string;
        polyline: {
          points: string;
        };
        start_location: {
          lat: number;
          lng: number;
        };
        end_location: {
          lat: number;
          lng: number;
        };
      }>;
    }>;
    overview_polyline: {
      points: string;
    };
  }>;
}

export interface DecodedPolyline {
  latitude: number;
  longitude: number;
}
