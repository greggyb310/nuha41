import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Navigation, Plus, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { Map } from '../components/Map';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useLocation } from '../hooks/useLocation';
import { getMultiWaypointRoute, formatDistance, formatDuration } from '../services/google-directions';
import type { Waypoint, RouteInfo } from '../services/google-directions';

export default function DirectionsTestScreen() {
  const router = useRouter();
  const { coordinates: location } = useLocation();
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleWaypoints: Waypoint[] = [
    { latitude: 34.0522, longitude: -118.2437 },
    { latitude: 34.0549, longitude: -118.2426 },
    { latitude: 34.0584, longitude: -118.2394 },
  ];

  useEffect(() => {
    if (location) {
      setWaypoints([
        location,
        {
          latitude: location.latitude + 0.01,
          longitude: location.longitude + 0.01,
        },
        {
          latitude: location.latitude + 0.02,
          longitude: location.longitude - 0.01,
        },
      ]);
    }
  }, [location]);

  const handleCalculateRoute = async () => {
    if (waypoints.length < 2) {
      setError('Need at least 2 waypoints to calculate a route');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const routeInfo = await getMultiWaypointRoute(waypoints, 'walking');
      if (routeInfo) {
        setRoute(routeInfo);
      } else {
        setError('Failed to calculate route. Please try different waypoints.');
      }
    } catch (err) {
      console.error('[DirectionsTest] Route calculation failed:', err);
      setError('An error occurred while calculating the route');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWaypoint = () => {
    if (waypoints.length === 0) {
      if (location) {
        setWaypoints([location]);
      }
      return;
    }

    const lastWaypoint = waypoints[waypoints.length - 1];
    setWaypoints([
      ...waypoints,
      {
        latitude: lastWaypoint.latitude + 0.01,
        longitude: lastWaypoint.longitude + 0.005,
      },
    ]);
  };

  const handleRemoveWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
    setRoute(null);
  };

  const handleUseSampleWaypoints = () => {
    setWaypoints(sampleWaypoints);
    setRoute(null);
  };

  const markers = waypoints.map((wp, index) => ({
    latitude: wp.latitude,
    longitude: wp.longitude,
    title: index === 0 ? 'Start' : index === waypoints.length - 1 ? 'End' : `Waypoint ${index}`,
    pinColor: index === 0 ? colors.primary : index === waypoints.length - 1 ? '#e74c3c' : colors.accent,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Directions Test</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.waypointsCard}>
          <Text style={styles.sectionTitle}>Waypoints</Text>

          {waypoints.length === 0 && (
            <Text style={styles.infoText}>No waypoints added yet</Text>
          )}

          {waypoints.map((waypoint, index) => (
            <View key={index} style={styles.waypointRow}>
              <View style={styles.waypointInfo}>
                <Text style={styles.waypointLabel}>
                  {index === 0 ? 'Start' : index === waypoints.length - 1 ? 'End' : `Point ${index}`}
                </Text>
                <Text style={styles.waypointCoords}>
                  {waypoint.latitude.toFixed(4)}, {waypoint.longitude.toFixed(4)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveWaypoint(index)}
                style={styles.removeButton}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.buttonRow}>
            <Button
              title="Add Waypoint"
              onPress={handleAddWaypoint}
              variant="secondary"
              style={styles.addButton}
            />
            <Button
              title="Use Sample"
              onPress={handleUseSampleWaypoints}
              variant="secondary"
              style={styles.sampleButton}
            />
          </View>

          {waypoints.length >= 2 && (
            <Button
              title={loading ? 'Calculating...' : 'Calculate Route'}
              onPress={handleCalculateRoute}
              disabled={loading}
              style={styles.calculateButton}
            />
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </Card>

        {route && (
          <>
            <Card style={styles.mapCard}>
              <Map
                markers={markers}
                polyline={route.polyline}
                initialRegion={{
                  latitude: waypoints[0].latitude,
                  longitude: waypoints[0].longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              />
            </Card>

            <Card style={styles.routeInfoCard}>
              <Text style={styles.sectionTitle}>Route Information</Text>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Distance:</Text>
                <Text style={styles.statValue}>
                  {formatDistance(route.distance.value)}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Duration:</Text>
                <Text style={styles.statValue}>
                  {formatDuration(route.duration.value)}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Waypoints:</Text>
                <Text style={styles.statValue}>{waypoints.length}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Polyline Points:</Text>
                <Text style={styles.statValue}>{route.polyline.length}</Text>
              </View>
            </Card>

            {route.steps && route.steps.length > 0 && (
              <Card style={styles.stepsCard}>
                <Text style={styles.sectionTitle}>
                  Turn-by-Turn Directions ({route.steps.length} steps)
                </Text>

                {route.steps.slice(0, 5).map((step, index) => (
                  <View key={index} style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.stepInfo}>
                      <Text style={styles.stepInstruction}>{step.instruction}</Text>
                      <Text style={styles.stepDistance}>
                        {step.distance} • {step.duration}
                      </Text>
                    </View>
                  </View>
                ))}

                {route.steps.length > 5 && (
                  <Text style={styles.moreStepsText}>
                    + {route.steps.length - 5} more steps
                  </Text>
                )}
              </Card>
            )}
          </>
        )}

        {loading && (
          <Card style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Calculating route...</Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  waypointsCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  waypointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },
  waypointInfo: {
    flex: 1,
  },
  waypointLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  waypointCoords: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  removeButton: {
    padding: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  addButton: {
    flex: 1,
  },
  sampleButton: {
    flex: 1,
  },
  calculateButton: {
    marginTop: spacing.md,
  },
  errorContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: '#fee',
    borderRadius: borderRadius.sm,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: '#c33',
    textAlign: 'center',
  },
  mapCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  routeInfoCard: {
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },
  statLabel: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium as any,
  },
  statValue: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold as any,
  },
  stepsCard: {
    marginBottom: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    fontSize: typography.sizes.sm,
    color: colors.surface,
    fontWeight: typography.weights.bold as any,
  },
  stepInfo: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stepDistance: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  moreStepsText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  loadingCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
