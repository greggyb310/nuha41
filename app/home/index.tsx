import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { LoadingSpinner, Button, WeatherCard, Map } from '../../components';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { Settings, User, LogOut, X } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, profile, hasCompletedProfile, signOut } = useAuth();
  const { coordinates, loading: locationLoading, error: locationError, getCurrentLocation } = useLocation();
  const { weather, loading: weatherLoading, error: weatherError, refresh: refreshWeather } = useWeather(
    coordinates?.latitude,
    coordinates?.longitude
  );
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    } else if (!isLoading && isAuthenticated && !hasCompletedProfile && pathname !== '/profile/setup') {
      router.replace('/profile/setup');
    }
  }, [isLoading, isAuthenticated, hasCompletedProfile, pathname]);

  useEffect(() => {
    if (isAuthenticated && !coordinates && !locationLoading) {
      console.log('[HomeScreen] Fetching location on mount');
      getCurrentLocation();
    }
  }, [isAuthenticated, coordinates, locationLoading]);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            Hello{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettings(true)}
          >
            <Settings size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>NatureUP Health</Text>
        <Text style={styles.subtitle}>Your personalized nature therapy companion</Text>

        {coordinates && (
          <View style={styles.mapContainer}>
            <Map
              latitude={coordinates.latitude}
              longitude={coordinates.longitude}
              showMarker={true}
            />
          </View>
        )}

        {locationLoading && !coordinates && (
          <View style={styles.locationCard}>
            <LoadingSpinner size="small" />
            <Text style={styles.locationText}>Getting your location...</Text>
          </View>
        )}

        {locationError && !coordinates && (
          <View style={styles.locationCard}>
            <Text style={styles.errorText}>{locationError}</Text>
            <Button
              title="Retry"
              onPress={getCurrentLocation}
              style={styles.retryButton}
            />
          </View>
        )}

        {coordinates && (
          <WeatherCard
            weather={weather}
            loading={weatherLoading}
            error={weatherError}
            onRefresh={refreshWeather}
          />
        )}

        <View style={styles.quickActions}>
          <Button
            title="Talk to Coach"
            onPress={() => router.push('/coach')}
            style={styles.actionButton}
          />
          <Button
            title="Create Excursion"
            onPress={() => router.push('/excursions/create')}
            variant="secondary"
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
      </Modal>
    </View>
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
    padding: spacing.xs,
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
