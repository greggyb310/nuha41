export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface LocationState {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
  permissionStatus: 'undetermined' | 'granted' | 'denied' | null;
}

export interface UseLocationReturn extends LocationState {
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
  clearError: () => void;
}
