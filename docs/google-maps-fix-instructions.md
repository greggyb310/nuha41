# Google Maps iOS Tiles Fix - Implementation Complete

## What Was Fixed

The root cause of blank map tiles was that Expo does not interpolate environment variables in `app.json`. The literal string `"$GOOGLE_MAPS_API_KEY"` was being compiled into the iOS binary instead of the actual API key value.

## Changes Made

### 1. Created Dynamic Config (`app.config.ts`)

A new `app.config.ts` file now reads the Google Maps API key from environment variables at build time:

```ts
import "dotenv/config";

export default ({ config }: any) => ({
  ...config,
  ios: {
    ...config.ios,
    config: {
      ...config.ios?.config,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },
});
```

### 2. Removed Hardcoded Keys from `app.json`

Removed all `googleMapsApiKey` references from static `app.json` configuration.

### 3. Added `dotenv` Dependency

Installed `dotenv` package to enable environment variable loading in the config file.

### 4. Updated Environment Files

Changed environment variable name from `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` to `GOOGLE_MAPS_API_KEY` (build-time variable, not runtime).

---

## Required Next Steps (EAS Cloud Build)

### Step 1: Create EAS Secret

You must add the Google Maps API key as an EAS secret. Run this command:

```bash
eas secret:create --name GOOGLE_MAPS_API_KEY --value YOUR_ACTUAL_GOOGLE_MAPS_API_KEY
```

Replace `YOUR_ACTUAL_GOOGLE_MAPS_API_KEY` with your real API key from Google Cloud Console.

### Step 2: Verify Google Cloud Setup

Ensure your Google Cloud project has:

1. **Maps SDK for iOS** enabled
2. **Billing** enabled
3. **API Key Restrictions** configured:
   - Application restrictions: iOS apps
   - Bundle ID: `com.natureup.health41`
   - API restrictions: Maps SDK for iOS

### Step 3: Create New iOS Build

This is a **native configuration change**, so you must rebuild:

```bash
eas build --platform ios --profile preview
```

OTA/JS updates will NOT fix this issue. A new native build is required.

### Step 4: Test on Device

After the build completes:

1. Install the new build on your test device (via TestFlight or direct install)
2. Open the map view
3. Verify that map tiles load correctly
4. Check that user location appears with map tiles

---

## Expected Result

After rebuilding with the proper API key:
- Google Maps tiles will render normally
- No more blank/gray map backgrounds
- User location pin will display on top of visible map tiles

---

## Why This Happened

Expo's static `app.json` does not support variable interpolation. The string `"$GOOGLE_MAPS_API_KEY"` was treated as a literal value, not a variable reference. This is a common gotcha when migrating from other build systems.

The fix uses `app.config.ts`, which is JavaScript that runs during the build process and can access `process.env` variables.

---

## Troubleshooting

### Map tiles still blank after rebuild?

1. Verify EAS secret was created: `eas secret:list`
2. Check the build logs for the API key value (it should NOT be `$GOOGLE_MAPS_API_KEY`)
3. Verify Google Cloud Console billing is enabled
4. Check API key restrictions match the bundle ID exactly
5. Ensure Maps SDK for iOS is enabled in Google Cloud

### Build fails?

1. Verify `dotenv` is in `package.json` dependencies
2. Check that `app.config.ts` has no syntax errors
3. Ensure `.env` file exists (even with placeholder values)

---

## Local Development Note

For local development builds, you can add your API key to the `.env` file:

```
GOOGLE_MAPS_API_KEY=your-key-here
```

But for production/preview builds via EAS, you **must** use EAS secrets.
