import { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Search, X, MapPin } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { searchPlacesAutocomplete } from '../services/google-places';
import { PlaceAutocompleteResult } from '../types/places';

interface PlaceSearchInputProps {
  onPlaceSelected: (place: PlaceAutocompleteResult) => void;
  currentLocation?: { latitude: number; longitude: number };
  placeholder?: string;
  autoFocus?: boolean;
}

export function PlaceSearchInput({
  onPlaceSelected,
  currentLocation,
  placeholder = 'Search for nature locations...',
  autoFocus = false,
}: PlaceSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<PlaceAutocompleteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsLoading(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const searchResults = await searchPlacesAutocomplete(
          searchQuery,
          currentLocation?.latitude,
          currentLocation?.longitude
        );
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('[PlaceSearchInput] Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, currentLocation]);

  const handleSelectPlace = (place: PlaceAutocompleteResult) => {
    setSearchQuery(place.structured_formatting?.main_text || place.description);
    setShowResults(false);
    onPlaceSelected(place);
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setShowResults(false);
  };

  const renderResultItem = ({ item }: { item: PlaceAutocompleteResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectPlace(item)}
    >
      <MapPin size={20} color={colors.primary} style={styles.resultIcon} />
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultMainText}>
          {item.structured_formatting?.main_text || item.description}
        </Text>
        {item.structured_formatting?.secondary_text && (
          <Text style={styles.resultSecondaryText}>
            {item.structured_formatting.secondary_text}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchInputContainer}>
        <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          autoFocus={autoFocus}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.loadingIndicator}
          />
        )}
      </View>

      {showResults && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            renderItem={renderResultItem}
            keyExtractor={(item) => item.place_id}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {showResults && results.length === 0 && !isLoading && searchQuery.length >= 2 && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No places found</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1000,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  loadingIndicator: {
    marginLeft: spacing.sm,
  },
  resultsContainer: {
    marginTop: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  resultIcon: {
    marginRight: spacing.md,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultMainText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium as any,
  },
  resultSecondaryText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  noResultsContainer: {
    marginTop: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
