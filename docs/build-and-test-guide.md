# Build and Test Guide for Google Maps Integration

This guide provides quick commands and steps for building and testing the Google Maps integration at each phase.

---

## Prerequisites Checklist

Before starting any build:

- [ ] Google Cloud Platform project created
- [ ] Billing enabled on GCP project
- [ ] Maps SDK for iOS, Places API, and Directions API enabled
- [ ] API key created with iOS app restriction (bundle ID: com.natureup.health41)
- [ ] EAS secret created: `eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value YOUR_KEY`
- [ ] Verify secret: `eas secret:list`

---

## Build Commands

### Initial Setup (One-time)

```bash
# Install dependencies
npm install

# Login to EAS (if not already)
eas login

# Create EAS secret for Google Maps API key
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value YOUR_ACTUAL_API_KEY

# Verify secret was created
eas secret:list
```

### BUILD CHECKPOINT #1: Basic Google Maps

**Purpose**: Verify Google Maps tiles load correctly

```bash
# Check TypeScript compilation first
npm run build

# Build development client
eas build --platform ios --profile development

# Monitor build progress
# Open the build URL in browser or run:
eas build:list

# Once complete, install on iPhone:
# 1. Open build URL on iPhone
# 2. Tap "Install" or scan QR code
# 3. Trust developer certificate in Settings
```

**What to Test:**
1. Open the app on iPhone
2. Navigate to `/map-test` screen
3. Verify:
   - Google Maps tiles load (not Apple Maps)
   - Google logo in bottom-left corner
   - Blue dot shows your location
   - Three test markers display
   - Map gestures work (zoom, pan, rotate)

**Common Issues:**
- Gray tiles = billing not enabled on GCP
- "Development Mode" watermark = using Apple Maps instead of Google
- No tiles at all = API key not injected or wrong bundle ID restriction

---

### BUILD CHECKPOINT #2: Place Search

**Purpose**: Test place autocomplete and search functionality

**Before Building:**
```bash
# Verify code compiles
npm run build

# Check for any TypeScript errors
```

**Build Command:**
```bash
eas build --platform ios --profile development
```

**What to Test:**
1. Open the app on iPhone
2. Navigate to `/place-search-test` screen
3. Test search functionality:
   - Type "parks near me"
   - Verify autocomplete suggestions appear
   - Select a place from the list
   - Verify marker appears on map
   - Verify place details card displays
4. Try different searches:
   - "hiking trails"
   - "nature reserve"
   - "forest"

**Common Issues:**
- No search results = Places API not enabled
- Search returns non-nature places = filtering working as expected
- Slow search = debouncing is working (300ms delay is normal)

---

### BUILD CHECKPOINT #3: Directions

**Purpose**: Test route calculation and polyline drawing

**Before Building:**
```bash
npm run build
```

**Build Command:**
```bash
eas build --platform ios --profile development
```

**What to Test:**
1. Open the app on iPhone
2. Navigate to `/directions-test` screen
3. Test directions:
   - Tap "Use Sample" to add sample waypoints
   - Tap "Calculate Route"
   - Verify polyline draws on map
   - Verify distance and duration display
   - Check turn-by-turn directions
4. Test custom waypoints:
   - Add your own waypoints
   - Remove waypoints
   - Recalculate route

**Common Issues:**
- No route calculated = Directions API not enabled
- Polyline doesn't draw = polyline decode error (check console logs)
- Route doesn't connect waypoints = invalid coordinates

---

### BUILD CHECKPOINT #4: Full Integration

**Purpose**: Test complete excursion workflow with all features

**Before Building:**
```bash
# Final code check
npm run build

# Optional: Clear build cache if you had previous issues
eas build --platform ios --profile development --clear-cache
```

**Build Command:**
```bash
eas build --platform ios --profile development
```

**What to Test:**
1. Complete excursion flow:
   - Search for starting location
   - Add 2-3 waypoints via search
   - Verify route draws between all waypoints
   - Check distance and duration calculations
   - Save excursion to Supabase
   - Load saved excursion
   - Verify map displays correctly
2. Edge cases:
   - No internet connection
   - Invalid search queries
   - Locations with no connecting route
   - Rapid navigation between screens

---

## Testing Commands

### Local Development

```bash
# Start Expo development server
npm start

# TypeScript check (NO emitting, just validation)
npm run build
```

**Note**: Web preview will show map placeholders. You MUST use the EAS development client on iPhone to test real Google Maps.

---

## Troubleshooting Build Issues

### Build Fails

```bash
# View detailed build logs
eas build:view --id BUILD_ID

# Clear cache and retry
eas build --platform ios --profile development --clear-cache

# Check for TypeScript errors
npm run build
```

### API Key Issues

```bash
# Check if secret exists
eas secret:list

# Delete and recreate secret
eas secret:delete --name GOOGLE_MAPS_API_KEY
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value YOUR_NEW_KEY

# Rebuild
eas build --platform ios --profile development
```

### Maps Not Loading

1. Verify billing enabled: [Google Cloud Console → Billing](https://console.cloud.google.com/billing)
2. Check APIs enabled: [APIs & Services → Library](https://console.cloud.google.com/apis/library)
3. Verify API key restrictions: [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
4. Check bundle ID matches: `com.natureup.health41`

---

## Quick Reference: Test Screens

Access these screens in the app to test each feature:

| Screen | Route | Purpose |
|--------|-------|---------|
| Map Test | `/map-test` | Basic Google Maps tiles |
| Place Search | `/place-search-test` | Search and autocomplete |
| Directions | `/directions-test` | Route calculation |

---

## Build Time Expectations

- **First build**: 15-25 minutes
- **Subsequent builds**: 5-10 minutes
- **With cache clear**: 10-15 minutes

---

## Installation on iPhone

### Via QR Code
1. Build completes
2. Open EAS build URL on desktop
3. Scan QR code with iPhone camera
4. Tap notification to install

### Via Direct Link
1. Open build URL on iPhone browser
2. Tap "Install"
3. Follow iOS prompts

### Trust Developer Certificate
1. Settings → General → VPN & Device Management
2. Tap your developer profile
3. Tap "Trust"

---

## Success Criteria

### Checkpoint #1 Success
- ✅ Google Maps tiles load
- ✅ Google logo visible
- ✅ Location blue dot shows
- ✅ Markers render
- ✅ Gestures work

### Checkpoint #2 Success
- ✅ Search returns results
- ✅ Autocomplete works
- ✅ Selected place shows on map
- ✅ Place details display

### Checkpoint #3 Success
- ✅ Route calculates
- ✅ Polyline draws
- ✅ Distance/duration accurate
- ✅ Multiple waypoints work

### Checkpoint #4 Success
- ✅ End-to-end flow works
- ✅ Save to Supabase works
- ✅ Load from Supabase works
- ✅ No crashes or errors

---

## Next Steps After Testing

Once all checkpoints pass:

1. Integrate into existing excursion screens
2. Add place search to excursion creation
3. Enhance excursion display with directions
4. Add offline support and error handling
5. Optimize performance
6. Prepare for production build

---

## Production Build (After All Tests Pass)

```bash
# Production build for App Store
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios --profile production
```

---

## Support

If you encounter issues not covered here:

1. Check Google Cloud Console logs
2. Review EAS build logs
3. Check Expo Router console output on device
4. Verify all APIs are enabled and billing is active
5. Test with unrestricted API key temporarily to isolate issue
