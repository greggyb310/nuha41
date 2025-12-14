# Places API - Usage Guide

## Quick Start

### 1. Import the Service

```typescript
import { placesApi } from '../services/places-api';
import { Place, PlacesResponse } from '../types/places';
```

### 2. Search for Nearby Nature Spots

```typescript
const searchNearby = async (userLat: number, userLng: number) => {
  try {
    const result = await placesApi.findNatureSpots(userLat, userLng, 5000);

    if (result.status === 'OK' && result.places.length > 0) {
      result.places.forEach((place: Place) => {
        console.log(`Found: ${place.name}`);
        console.log(`Location: ${place.geometry.location.lat}, ${place.geometry.location.lng}`);
        console.log(`Rating: ${place.rating || 'N/A'}`);
      });
    } else {
      console.log('No nature spots found nearby');
    }
  } catch (error) {
    console.error('Error searching for places:', error);
  }
};
```

### 3. Example with Custom Radius

```typescript
const findParks = async (lat: number, lng: number) => {
  const response = await placesApi.searchNearby({
    latitude: lat,
    longitude: lng,
    radius: 10000, // 10km radius
  });

  return response.places;
};
```

## React Native Component Example

```typescript
import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { placesApi } from '../services/places-api';
import { Place } from '../types/places';
import { useLocation } from '../hooks/useLocation';

export default function NearbyPlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { latitude, longitude } = useLocation();

  useEffect(() => {
    if (latitude && longitude) {
      searchPlaces();
    }
  }, [latitude, longitude]);

  const searchPlaces = async () => {
    if (!latitude || !longitude) return;

    setLoading(true);
    setError(null);

    try {
      const result = await placesApi.findNatureSpots(
        latitude,
        longitude,
        5000
      );

      if (result.status === 'OK') {
        setPlaces(result.places);
      } else {
        setError('No nature spots found nearby');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text>Loading nearby places...</Text>;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Nature Spots</Text>
      <FlatList
        data={places}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <View style={styles.placeCard}>
            <Text style={styles.placeName}>{item.name}</Text>
            {item.rating && (
              <Text style={styles.rating}>
                ⭐ {item.rating} ({item.user_ratings_total} reviews)
              </Text>
            )}
            <Text style={styles.types}>{item.types.join(', ')}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  placeCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3E1F',
  },
  rating: {
    fontSize: 14,
    color: '#5A6C4A',
    marginTop: 4,
  },
  types: {
    fontSize: 12,
    color: '#7FA957',
    marginTop: 4,
  },
  error: {
    color: '#D32F2F',
    padding: 16,
  },
});
```

## Integration with Map

```typescript
import MapView, { Marker } from 'react-native-maps';
import { Place } from '../types/places';

interface MapWithPlacesProps {
  userLocation: { lat: number; lng: number };
  places: Place[];
}

export function MapWithPlaces({ userLocation, places }: MapWithPlacesProps) {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {/* User location */}
      <Marker
        coordinate={{
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        }}
        title="You are here"
        pinColor="blue"
      />

      {/* Nature spots */}
      {places.map((place) => (
        <Marker
          key={place.place_id}
          coordinate={{
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          }}
          title={place.name}
          description={`${place.types.join(', ')} - Rating: ${place.rating || 'N/A'}`}
          pinColor="green"
        />
      ))}
    </MapView>
  );
}
```

## Type Reference

### PlacesRequest

```typescript
interface PlacesRequest {
  latitude: number;     // User's latitude
  longitude: number;    // User's longitude
  radius?: number;      // Search radius in meters (default: 5000)
}
```

### PlacesResponse

```typescript
interface PlacesResponse {
  places: Place[];      // Array of found places
  status: string;       // "OK" or "ZERO_RESULTS"
}
```

### Place

```typescript
interface Place {
  place_id: string;              // Unique identifier
  name: string;                  // Place name
  types: string[];               // Categories (e.g., ["park"])
  vicinity?: string;             // Address
  rating?: number;               // Average rating (1-5)
  user_ratings_total?: number;   // Number of reviews
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
  photos?: PlacePhoto[];         // Available photos
}
```

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Loading States**: Show loading indicators while fetching
3. **Caching**: Consider caching results to reduce API calls
4. **User Feedback**: Display helpful messages when no places found
5. **Rate Limiting**: Don't call the API too frequently to control costs

## Test Locations

### Prescott, AZ
```typescript
{ latitude: 34.5400, longitude: -112.4685, radius: 10000 }
```
Expected: Prescott National Forest, Watson Lake, Willow Lake, etc.

### Yosemite Area
```typescript
{ latitude: 37.8651, longitude: -119.5383, radius: 20000 }
```
Expected: Yosemite National Park, various trails

### Urban Test (Central Park, NYC)
```typescript
{ latitude: 40.7829, longitude: -73.9654, radius: 2000 }
```
Expected: Central Park, various sections
