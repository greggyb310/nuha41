import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { LocationProvider } from '../contexts/LocationContext';
import { useFrameworkReady } from '../hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <LocationProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="home/index" />
          <Stack.Screen name="coach" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/sign-up" />
          <Stack.Screen name="auth/reset-password" />
          <Stack.Screen name="profile/setup" />
        </Stack>
        <StatusBar style="auto" />
      </LocationProvider>
    </AuthProvider>
  );
}
