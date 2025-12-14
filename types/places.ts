export interface PlacePhoto {
  photo_reference: string;
  height: number;
  width: number;
}

export interface PlaceGeometry {
  location: {
    lat: number;
    lng: number;
  };
}

export interface Place {
  place_id: string;
  name: string;
  types: string[];
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: PlaceGeometry;
  photos?: PlacePhoto[];
}

export interface PlacesRequest {
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface PlacesResponse {
  places: Place[];
  status: string;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  rating?: number;
  user_ratings_total?: number;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
  photos?: PlacePhoto[];
  geometry: PlaceGeometry;
  types: string[];
  website?: string;
}
