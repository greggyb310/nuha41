import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { colors, typography, spacing } from '../constants/theme';

interface MarkerData {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

interface MapProps {
  latitude?: number;
  longitude?: number;
  showMarker?: boolean;
  markers?: MarkerData[];
  polyline?: Array<{ latitude: number; longitude: number }>;
  initialRegion?: Region;
}

export function Map({
  latitude,
  longitude,
  showMarker = true,
  markers,
  polyline,
  initialRegion
}: MapProps) {
  if (Platform.OS === 'web') {
    const displayLat = latitude || initialRegion?.latitude || (markers && markers[0]?.latitude) || 0;
    const displayLng = longitude || initialRegion?.longitude || (markers && markers[0]?.longitude) || 0;

    return (
      <View style={styles.webFallback}>
        <Text style={styles.webFallbackText}>
          Map preview available on iOS
        </Text>
        <Text style={styles.webFallbackCoords}>
          {displayLat.toFixed(6)}, {displayLng.toFixed(6)}
        </Text>
        {markers && markers.length > 1 && (
          <Text style={styles.webFallbackText}>
            {markers.length} waypoints
          </Text>
        )}
      </View>
    );
  }

  const region = initialRegion || {
    latitude: latitude || (markers && markers[0]?.latitude) || 0,
    longitude: longitude || (markers && markers[0]?.longitude) || 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={region}
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass={true}
      showsScale={false}
    >
      {showMarker && latitude && longitude && (
        <Marker
          coordinate={{ latitude, longitude }}
          title="Your Location"
        />
      )}

      {markers && markers.map((marker, index) => (
        <Marker
          key={index}
          coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
          title={marker.title}
          description={marker.description}
        />
      ))}

      {polyline && polyline.length > 1 && (
        <Polyline
          coordinates={polyline}
          strokeColor={colors.primary}
          strokeWidth={3}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 300,
    borderRadius: spacing.md,
    overflow: 'hidden',
  },
  webFallback: {
    width: '100%',
    height: 300,
    borderRadius: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  webFallbackText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  webFallbackCoords: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },
});
