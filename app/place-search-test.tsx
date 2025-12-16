import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, Star, MapPin as MapPinIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { PlaceSearchInput } from '../components/PlaceSearchInput';
import { Map } from '../components/Map';
import { Card } from '../components/Card';
import { useLocation } from '../hooks/useLocation';
import { getPlaceDetails } from '../services/google-places';
import { PlaceAutocompleteResult, PlaceDetailsResult } from '../types/places';

export default function PlaceSearchTestScreen() {
  const router = useRouter();
  const { coordinates: location, loading: locationLoading } = useLocation();
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetailsResult | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handlePlaceSelected = async (place: PlaceAutocompleteResult) => {
    setLoadingDetails(true);
    try {
      const details = await getPlaceDetails(place.place_id);
      if (details) {
        setSelectedPlace(details);
      }
    } catch (error) {
      console.error('[PlaceSearchTest] Failed to load place details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Search Test</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.searchCard}>
          <Text style={styles.sectionTitle}>Search for Nature Locations</Text>
          <PlaceSearchInput
            onPlaceSelected={handlePlaceSelected}
            currentLocation={location || undefined}
            placeholder="Search parks, trails, forests..."
          />
        </Card>

        {locationLoading && !location && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoText}>Getting your location...</Text>
          </Card>
        )}

        {location && !selectedPlace && (
          <Card style={styles.infoCard}>
            <MapPinIcon size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </Card>
        )}

        {selectedPlace && (
          <>
            <Card style={styles.mapCard}>
              <Map
                latitude={selectedPlace.geometry.location.lat}
                longitude={selectedPlace.geometry.location.lng}
                showMarker={true}
                initialRegion={{
                  latitude: selectedPlace.geometry.location.lat,
                  longitude: selectedPlace.geometry.location.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              />
            </Card>

            <Card style={styles.detailsCard}>
              <Text style={styles.placeName}>{selectedPlace.name}</Text>

              {selectedPlace.formatted_address && (
                <View style={styles.detailRow}>
                  <MapPinIcon size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{selectedPlace.formatted_address}</Text>
                </View>
              )}

              {selectedPlace.rating && (
                <View style={styles.detailRow}>
                  <Star size={16} color={colors.accent} />
                  <Text style={styles.detailText}>
                    {selectedPlace.rating} ({selectedPlace.user_ratings_total} reviews)
                  </Text>
                </View>
              )}

              {selectedPlace.opening_hours && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text
                    style={[
                      styles.detailText,
                      {
                        color: selectedPlace.opening_hours.open_now
                          ? colors.primary
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {selectedPlace.opening_hours.open_now ? 'Open Now' : 'Closed'}
                  </Text>
                </View>
              )}

              {selectedPlace.formatted_phone_number && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailText}>
                    {selectedPlace.formatted_phone_number}
                  </Text>
                </View>
              )}

              {selectedPlace.types && selectedPlace.types.length > 0 && (
                <View style={styles.typesContainer}>
                  {selectedPlace.types.slice(0, 3).map((type, index) => (
                    <View key={index} style={styles.typeBadge}>
                      <Text style={styles.typeText}>
                        {type.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinatesLabel}>Coordinates:</Text>
                <Text style={styles.coordinatesText}>
                  {selectedPlace.geometry.location.lat.toFixed(6)},{' '}
                  {selectedPlace.geometry.location.lng.toFixed(6)}
                </Text>
              </View>
            </Card>
          </>
        )}

        {loadingDetails && (
          <Card style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading place details...</Text>
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
  searchCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  mapCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  detailsCard: {
    marginBottom: spacing.md,
  },
  placeName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as any,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  detailText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  typeBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  coordinatesContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.accent,
  },
  coordinatesLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  coordinatesText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },
  loadingCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
});
