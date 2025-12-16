import Constants from 'expo-constants';
import { DirectionsResult, DecodedPolyline } from '../types/places';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey || '';
const DIRECTIONS_API_URL = 'https://maps.googleapis.com/maps/api/directions/json';

export interface Waypoint {
  latitude: number;
  longitude: number;
}

export interface RouteInfo {
  polyline: DecodedPolyline[];
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  steps: Array<{
    instruction: string;
    distance: string;
    duration: string;
    startLocation: {
      latitude: number;
      longitude: number;
    };
    endLocation: {
      latitude: number;
      longitude: number;
    };
  }>;
}

export async function getDirections(
  origin: Waypoint,
  destination: Waypoint,
  waypoints?: Waypoint[],
  mode: 'walking' | 'driving' | 'bicycling' = 'walking'
): Promise<RouteInfo | null> {
  try {
    const params = new URLSearchParams({
      origin: `${origin.latitude},${origin.longitude}`,
      destination: `${destination.latitude},${destination.longitude}`,
      mode,
      key: GOOGLE_MAPS_API_KEY,
    });

    if (waypoints && waypoints.length > 0) {
      const waypointsStr = waypoints
        .map((wp) => `${wp.latitude},${wp.longitude}`)
        .join('|');
      params.append('waypoints', waypointsStr);
    }

    const url = `${DIRECTIONS_API_URL}?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json() as any;

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const leg = route.legs[0];

      const polyline = decodePolyline(route.overview_polyline.points);

      const steps = leg.steps.map((step: any) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        distance: step.distance.text,
        duration: step.duration.text,
        startLocation: {
          latitude: step.start_location.lat,
          longitude: step.start_location.lng,
        },
        endLocation: {
          latitude: step.end_location.lat,
          longitude: step.end_location.lng,
        },
      }));

      return {
        polyline,
        distance: leg.distance,
        duration: leg.duration,
        steps,
      };
    }

    console.error('[DirectionsAPI] No routes found');
    return null;
  } catch (error) {
    console.error('[DirectionsAPI] Request failed:', error);
    return null;
  }
}

export async function getMultiWaypointRoute(
  waypoints: Waypoint[],
  mode: 'walking' | 'driving' | 'bicycling' = 'walking'
): Promise<RouteInfo | null> {
  if (waypoints.length < 2) {
    console.error('[DirectionsAPI] Need at least 2 waypoints');
    return null;
  }

  const origin = waypoints[0];
  const destination = waypoints[waypoints.length - 1];
  const intermediateWaypoints = waypoints.slice(1, -1);

  return getDirections(origin, destination, intermediateWaypoints, mode);
}

export function decodePolyline(encoded: string): DecodedPolyline[] {
  const poly: DecodedPolyline[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return poly;
}

export function calculateTotalDistance(waypoints: Waypoint[]): number {
  if (waypoints.length < 2) return 0;

  let totalDistance = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const distance = calculateDistanceBetween(waypoints[i], waypoints[i + 1]);
    totalDistance += distance;
  }

  return totalDistance;
}

function calculateDistanceBetween(point1: Waypoint, point2: Waypoint): number {
  const R = 6371;
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}
