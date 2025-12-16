import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { LoadingSpinner, Button, WeatherCard, Map } from '../../components';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { Settings, User, LogOut, X } from 'lucide-react-native';
import { Place } from '../../types/places';
import { fetchNearbyNature } from '../../services/places-api';

const DEFAULT_COORDS = { latitude: 37.7749, longitude: -122.4194 };

export default function HomeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, profile, hasCompletedProfile, signOut } = useAuth();
  const { coordinates, loading: locationLoading, error: locationError, getCurrentLocation } = useLocation();
  const displayCoordinates = coordinates || DEFAULT_COORDS;
  const { weather, loading: weatherLoading, error: weatherError, refresh: refreshWeather } = useWeather(
    displayCoordinates.latitude,
    displayCoordinates.longitude
  );
  const [showSettings, setShowSettings] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isLoading, isAuthenticated, pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('[HomeScreen] Fetching location on mount');
      getCurrentLocation();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!coordinates) return;

    (async () => {
      try {
        setPlacesLoading(true);
        setPlacesError(null);

        const res = await fetchNearbyNature({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          radius: 8000,
        });

        setPlaces(res.places ?? []);
      } catch (e) {
        setPlacesError(e instanceof Error ? e.message : 'Failed to load nearby places');
        setPlaces([]);
      } finally {
        setPlacesLoading(false);
      }
    })();
  }, [coordinates]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSignOut = async () => {
    setShowSettings(false);
    await signOut();
    router.replace('/auth/login');
  };

  const handleProfile = () => {
    setShowSettings(false);
    router.push('/profile/setup');
  };

  const markers = places.map((p) => ({
    latitude: p.latitude,
    longitude: p.longitude,
    title: `${p.name} (${Math.round(p.distance_m)}m)`,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            Hello{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.settingsButtonPressed
            ]}
            onPress={() => setShowSettings(true)}
          >
            <Settings size={28} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>NatureUP Health</Text>
        <Text style={styles.subtitle}>Your personalized nature therapy companion</Text>

        <View style={styles.mapContainer}>
          <Map
            latitude={displayCoordinates.latitude}
            longitude={displayCoordinates.longitude}
            showMarker={true}
            markers={markers}
          />
          {(locationLoading || placesLoading) && (
            <View style={styles.mapOverlay}>
              <LoadingSpinner size="small" />
              <Text style={styles.locationText}>
                {locationLoading ? 'Getting your location...' : 'Finding nature spots...'}
              </Text>
            </View>
          )}
        </View>

        <WeatherCard
          weather={weather}
          loading={weatherLoading}
          error={weatherError}
          onRefresh={refreshWeather}
        />

        <View style={styles.quickActions}>
          <Button
            title="Create Excursion"
            onPress={() => router.push('/excursions/create')}
            style={styles.actionButton}
          />
          <Button
            title="View My Excursions"
            onPress={() => router.push('/excursions')}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showSettings}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSettings(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSettings(false)}
              >
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
              <User size={24} color={colors.primary} />
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
              <LogOut size={24} color={colors.error} />
              <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsButton: {
    padding: spacing.md,
    borderRadius: borderRadius.full,
  },
  settingsButtonPressed: {
    backgroundColor: colors.accent,
    opacity: 0.8,
  },
  greeting: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.sizes.base,
    marginBottom: spacing.xl,
  },
  quickActions: {
    width: '100%',
    maxWidth: 400,
    gap: spacing.md,
    alignSelf: 'center',
  },
  actionButton: {
    width: '100%',
  },
  locationCard: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
    alignSelf: 'center',
  },
  locationText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    minWidth: 120,
  },
  mapContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: spacing.lg,
    alignSelf: 'center',
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  menuItemText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  signOutText: {
    color: colors.error,
  },
});
