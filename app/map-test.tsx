import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocation } from '../hooks/useLocation';
import { Map } from '../components/Map';
import { Button, LoadingSpinner } from '../components';
import { colors, typography, spacing } from '../constants/theme';
import { MapPin, Navigation } from 'lucide-react-native';

export default function MapTestScreen() {
  const router = useRouter();
  const { coordinates, loading, error, getCurrentLocation } = useLocation();
  const [testMarkers, setTestMarkers] = useState<Array<{ latitude: number; longitude: number; title: string }>>([]);

  useEffect(() => {
    if (coordinates) {
      setTestMarkers([
        {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          title: 'Your Location',
        },
        {
          latitude: coordinates.latitude + 0.01,
          longitude: coordinates.longitude + 0.01,
          title: 'Test Marker 1',
        },
        {
          latitude: coordinates.latitude - 0.01,
          longitude: coordinates.longitude + 0.01,
          title: 'Test Marker 2',
        },
      ]);
    }
  }, [coordinates]);

  if (loading && !coordinates) {
    return <LoadingSpinner fullScreen message="Getting your location..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Map Test</Text>
        <Text style={styles.subtitle}>Testing map display and location services</Text>
      </View>

      {error && !coordinates && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Retry Location"
            onPress={getCurrentLocation}
            size="small"
            style={styles.retryButton}
          />
        </View>
      )}

      {coordinates && (
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.infoLabel}>Latitude:</Text>
            <Text style={styles.infoValue}>{coordinates.latitude.toFixed(6)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Navigation size={16} color={colors.primary} />
            <Text style={styles.infoLabel}>Longitude:</Text>
            <Text style={styles.infoValue}>{coordinates.longitude.toFixed(6)}</Text>
          </View>
        </View>
      )}

      {Platform.OS === 'web' ? (
        <View style={styles.webNotice}>
          <Text style={styles.webNoticeTitle}>Web Platform Notice</Text>
          <Text style={styles.webNoticeText}>
            Maps are optimized for iOS. On web, you'll see a placeholder with coordinates.
            Build and test on iOS for full map functionality.
          </Text>
        </View>
      ) : null}

      <View style={styles.mapContainer}>
        {coordinates ? (
          <Map
            initialRegion={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            markers={testMarkers}
          />
        ) : (
          <View style={styles.noLocationContainer}>
            <Text style={styles.noLocationText}>Location not available</Text>
            <Button
              title="Get Location"
              onPress={getCurrentLocation}
              style={styles.getLocationButton}
            />
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Button
          title="Refresh Location"
          onPress={getCurrentLocation}
          disabled={loading}
          variant="outline"
        />
        <Button
          title="Back to Home"
          onPress={() => router.push('/home')}
          variant="outline"
        />
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Test Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Location Services:</Text>
          <Text style={[styles.statusValue, coordinates ? styles.statusSuccess : styles.statusError]}>
            {coordinates ? 'Working' : 'Not Available'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Map Component:</Text>
          <Text style={[styles.statusValue, styles.statusSuccess]}>
            Loaded
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Test Markers:</Text>
          <Text style={[styles.statusValue, styles.statusSuccess]}>
            {testMarkers.length} markers
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.normal * typography.sizes.sm,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: '#DC2626',
    marginBottom: spacing.sm,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  webNotice: {
    backgroundColor: '#E0F2F1',
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  webNoticeTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  webNoticeText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.normal * typography.sizes.xs,
  },
  mapContainer: {
    flex: 1,
    borderRadius: spacing.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceSecondary,
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  noLocationText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  getLocationButton: {
    minWidth: 150,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  statusTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  statusValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  statusSuccess: {
    color: '#10B981',
  },
  statusError: {
    color: '#DC2626',
  },
});
