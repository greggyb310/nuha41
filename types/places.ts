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
