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

### Update Environment Variables

Edit `.env` file in the project root:

```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

Replace `YOUR_ACTUAL_API_KEY_HERE` with your Google Maps API key from Step 3.

### Update app.json

The `app.json` file is already configured with placeholder keys. The actual API key will be loaded from your environment variables during build.

If you need to manually update `app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_ACTUAL_API_KEY_HERE"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ACTUAL_API_KEY_HERE"
        }
      }
    }
  }
}
```

## Step 6: Rebuild the App

After adding your API key, rebuild the app:

### For Development Build (Expo Go)

```bash
npm start
```

**Note**: Expo Go has limitations with native modules like Google Maps. For full functionality, create a development build:

```bash
eas build --profile development --platform ios
```

### For Production Build

```bash
eas build --profile production --platform ios
```

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

1. **Never commit API keys to version control**
   - API keys are in `.env` which is in `.gitignore`
   - Use environment variables for all builds

2. **Use API key restrictions**
   - Restrict by iOS bundle identifier in production
   - Restrict to specific APIs you use
   - Regularly rotate API keys

3. **Monitor API usage**
   - Set up billing alerts
   - Review API usage regularly
   - Implement rate limiting if needed

4. **Use different keys for environments**
   - Development key (less restricted)
   - Production key (fully restricted)

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
