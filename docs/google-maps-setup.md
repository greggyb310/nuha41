# Google Maps Setup Guide

This guide explains how to set up Google Maps API for NatureUP Health.

## Overview

The app uses Google Maps as the default map provider for displaying nature excursion routes, waypoints, and user location. Google Maps provides better map quality, detailed terrain information, and reliable performance on both iOS and Android.

## Prerequisites

- A Google Cloud Platform account
- Billing enabled on your Google Cloud project (required for Maps SDK)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `NatureUP Health Maps`
4. Click "Create"

## Step 2: Enable Required APIs

Enable the following APIs in your Google Cloud project:

1. Go to [APIs & Services](https://console.cloud.google.com/apis/dashboard)
2. Click "+ ENABLE APIS AND SERVICES"
3. Search for and enable:
   - **Maps SDK for iOS** (required for iOS)
   - **Maps SDK for Android** (optional, for future Android support)
   - **Places API** (optional, for location search features)
   - **Directions API** (optional, for route navigation)

## Step 3: Create API Key

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "+ CREATE CREDENTIALS" → "API Key"
3. Copy the generated API key
4. Click "Restrict Key" to secure your API key

## Step 4: Restrict API Key (Recommended)

### Application Restrictions

For development:
- Select "None" to allow testing on all platforms

For production:
- **iOS apps**: Select "iOS apps" and add your bundle identifier: `com.natureup.health4`
- **Android apps**: Select "Android apps" and add your package name and SHA-1 fingerprint

### API Restrictions

1. Select "Restrict key"
2. Enable only the APIs you need:
   - Maps SDK for iOS
   - Maps SDK for Android (if using Android)
   - Places API (if using place search)
   - Directions API (if using navigation)

## Step 5: Configure the App

### Important: Use EAS Secrets for Production

**NEVER hardcode API keys in `.env` or `app.json`** - they will be exposed in version control and client bundles.

### For Local Development (Optional)

Edit `.env` file for local testing only:

```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_DEVELOPMENT_API_KEY_HERE
```

**Note**: The `.env` file is gitignored and only used for local development in Expo Go.

### For EAS Builds (Production)

Use EAS Secrets to securely store your API key:

```bash
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value YOUR_API_KEY_HERE --type string
```

Verify the secret was created:

```bash
eas secret:list
```

### How It Works

- `app.json` uses the placeholder `$GOOGLE_MAPS_API_KEY`
- During EAS builds, this is replaced with the actual key from EAS Secrets
- The key is NEVER stored in version control
- Each build profile (development, preview, production) uses the same secret

### Configuration Files (Already Set Up)

The following files are pre-configured:

**app.json**:
```json
{
  "ios": {
    "config": {
      "googleMapsApiKey": "$GOOGLE_MAPS_API_KEY"
    }
  },
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "$GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

**eas.json**:
```json
{
  "build": {
    "development": {
      "env": {
        "GOOGLE_MAPS_API_KEY": "$GOOGLE_MAPS_API_KEY"
      }
    },
    "preview": {
      "env": {
        "GOOGLE_MAPS_API_KEY": "$GOOGLE_MAPS_API_KEY"
      }
    },
    "production": {
      "env": {
        "GOOGLE_MAPS_API_KEY": "$GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

## Step 6: Rebuild the App

After configuring EAS Secrets, rebuild the app:

### For Local Development (Expo Go)

```bash
npm start
```

**Note**: Expo Go has limitations with native modules like Google Maps. For full functionality, create a development build.

### For EAS Development Build

```bash
eas build --profile development --platform ios
```

### For Preview Build (TestFlight)

```bash
eas build --profile preview --platform ios
```

### For Production Build

```bash
eas build --profile production --platform ios
```

**Important**: EAS Secrets are automatically injected during build time. You don't need to pass any additional flags.

## Step 7: Verify Installation

1. Open the app on your iOS device
2. Navigate to the Map Test screen: `/map-test`
3. Verify that:
   - Location services are working
   - Map displays correctly with Google Maps branding
   - Test markers appear on the map
   - Map is interactive (zoom, pan)

## Troubleshooting

### Issue: Map shows as blank or white screen

**Solution**:
- Verify API key is correct in `.env`
- Check that Maps SDK for iOS is enabled in Google Cloud Console
- Ensure billing is enabled on your Google Cloud project
- Check app restrictions match your bundle identifier

### Issue: "This app is not authorized to use Google Maps"

**Solution**:
- Verify the API key restrictions in Google Cloud Console
- Ensure bundle identifier matches: `com.natureup.health4`
- For development, temporarily remove application restrictions

### Issue: Map works in Expo Go but not in standalone build

**Solution**:
- Create a development build with `eas build --profile development`
- Expo Go has limitations with native modules
- Google Maps requires a custom native build

### Issue: Billing errors or quota exceeded

**Solution**:
- Enable billing on your Google Cloud project
- Check your [API usage dashboard](https://console.cloud.google.com/apis/dashboard)
- Set up billing alerts to monitor costs
- Consider API key restrictions to prevent unauthorized usage

## Cost Considerations

Google Maps Platform uses pay-as-you-go pricing:

- **Maps SDK for iOS/Android**: $7 per 1,000 map loads (first 28,000 per month free)
- **Places API**: $17 per 1,000 requests (first $200 monthly credit)
- **Directions API**: $5 per 1,000 requests

For a small app with moderate usage, the free tier should be sufficient. Set up billing alerts to monitor costs.

## Security Best Practices

1. **Use EAS Secrets for all builds**
   - NEVER hardcode API keys in `.env` or `app.json`
   - Use `eas secret:create` to store sensitive keys
   - Keys are encrypted and only accessible during build time

2. **Secure your repository**
   - `.env` file is gitignored
   - `app.json` uses `$GOOGLE_MAPS_API_KEY` placeholder
   - No API keys committed to version control

3. **Use API key restrictions**
   - Restrict by iOS bundle identifier: `com.natureup.health4`
   - Restrict to specific APIs (Maps SDK, Places API only)
   - Regularly rotate API keys

4. **Monitor API usage**
   - Set up billing alerts in Google Cloud Console
   - Review API usage regularly
   - Set daily/monthly quota limits to prevent abuse

5. **Rotate keys if compromised**
   - Create a new API key in Google Cloud Console
   - Update EAS Secret: `eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value NEW_KEY --type string --force`
   - Update Bolt Database secret `GOOGLE_MAPS_API_KEY` for edge functions
   - Delete the old compromised key

6. **Edge function security**
   - `places-lookup` edge function uses Bolt Database secrets
   - Never expose API keys to client code
   - Always proxy Google Maps API calls through edge functions

## Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Maps SDK for iOS Guide](https://developers.google.com/maps/documentation/ios-sdk)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)

## Support

If you encounter issues:

1. Check the [React Native Maps Issues](https://github.com/react-native-maps/react-native-maps/issues)
2. Review [Google Maps Platform Support](https://developers.google.com/maps/support)
3. Check Expo documentation for [react-native-maps](https://docs.expo.dev/versions/latest/sdk/map-view/)
