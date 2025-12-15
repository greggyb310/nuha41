module.exports = {
  expo: {
    name: "NatureUP Health",
    slug: "natureup-health",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.natureup.health4",
      supportsTablet: false,
      infoPlist: {
        NSMicrophoneUsageDescription: "NatureUP Health needs access to your microphone for voice coaching sessions.",
        NSLocationWhenInUseUsageDescription: "NatureUP Health needs your location to suggest nearby nature excursions.",
        NSCameraUsageDescription: "NatureUP Health needs camera access to capture nature moments during excursions."
      },
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY
      }
    },
    android: {
      package: "com.natureup.health4",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow NatureUP Health to use your location to find nearby nature excursions."
        }
      ]
    ],
    scheme: "natureup",
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "your-project-id-here"
      },
      supabaseUrl: "https://osfpvrbnudanwzffavem.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZnB2cmJudWRhbnd6ZmZhdmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjkwNzEsImV4cCI6MjA4MDgwNTA3MX0.mAdXxSIcbql24BywyKPeNA6bOTXToL8yLpmblsbBfSQ"
    }
  }
};
