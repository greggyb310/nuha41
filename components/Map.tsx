import { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Polyline = maps.Polyline;
} catch (e) {
  console.log('[Map] react-native-maps not available');
}

interface MarkerData {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  pinColor?: string;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MapProps {
  latitude?: number;
  longitude?: number;
  showMarker?: boolean;
  markers?: MarkerData[];
  polyline?: Array<{ latitude: number; longitude: number }>;
  initialRegion?: Region;
}

function MapPlaceholder({ latitude, longitude, markers }: { latitude?: number; longitude?: number; markers?: MarkerData[] }) {
  const displayLat = latitude || (markers && markers[0]?.latitude) || 0;
  const displayLng = longitude || (markers && markers[0]?.longitude) || 0;

  return (
    <View style={styles.placeholder}>
      <MapPin size={48} color={colors.primary} />
      <Text style={styles.placeholderTitle}>Map</Text>
      {displayLat !== 0 && displayLng !== 0 && (
        <Text style={styles.placeholderCoords}>
          {displayLat.toFixed(4)}, {displayLng.toFixed(4)}
        </Text>
      )}
      {markers && markers.length > 1 && (
        <Text style={styles.placeholderWaypoints}>
          {markers.length} waypoints
        </Text>
      )}
    </View>
  );
}

export function Map({
  latitude,
  longitude,
  showMarker = true,
  markers,
  polyline,
  initialRegion
}: MapProps) {
  const [hasError, setHasError] = useState(false);

  if (Platform.OS === 'web' || !MapView || hasError) {
    return <MapPlaceholder latitude={latitude} longitude={longitude} markers={markers} />;
  }

  const region = initialRegion || {
    latitude: latitude || (markers && markers[0]?.latitude) || 0,
    longitude: longitude || (markers && markers[0]?.longitude) || 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.mapWrapper}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={false}
        onMapReady={() => console.log('[Map] Map ready')}
        onError={(e: any) => {
          console.log('[Map] Error:', e);
          setHasError(true);
        }}
      >
        {showMarker && latitude && longitude && Marker && (
          <Marker
            coordinate={{ latitude, longitude }}
            title="Your Location"
          />
        )}

        {markers && Marker && markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.title}
            description={marker.description}
            pinColor={marker.pinColor || colors.primary}
          />
        ))}

        {polyline && polyline.length > 1 && Polyline && (
          <Polyline
            coordinates={polyline}
            strokeColor={colors.primary}
            strokeWidth={3}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrapper: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  placeholderTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  placeholderCoords: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  placeholderWaypoints: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    marginTop: spacing.xs,
  },
});
