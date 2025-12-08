import Constants from 'expo-constants';
import { supabase } from './supabase';
import type { NatureUpRequest } from '../types/api';

export async function sendTestRequest(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const testPayload: NatureUpRequest = {
      user: {
        id: user.id,
        healthGoals: ['reduce stress', 'improve sleep'],
        preferences: {
          preferredTime: 'morning',
          difficulty: 'moderate',
        },
      },
      input: {
        modality: 'text',
        transcript: 'Plan me a nature walk',
        language: 'en',
      },
      context: {
        screen: 'home',
        location: {
          lat: 37.7749,
          lng: -122.4194,
          accuracyMeters: 10,
        },
        weatherSummary: {
          temperature: 72,
          condition: 'sunny',
        },
      },
      capabilities: {
        canUseLocation: true,
        canUseBackgroundAudio: true,
      },
      clientVersion: '1.0.0',
    };

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No active session');
    }

    const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
    const anonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    console.log('Debug - supabaseUrl:', supabaseUrl ? 'Found' : 'Missing');
    console.log('Debug - anonKey:', anonKey ? 'Found' : 'Missing');
    console.log('Debug - Constants.expoConfig.extra:', Constants.expoConfig?.extra);

    if (!supabaseUrl || !anonKey) {
      throw new Error('Missing Supabase credentials - check app.json extra section');
    }

    const functionUrl = `${supabaseUrl}/functions/v1/test-request`;

    console.log('Sending test payload to:', functionUrl);
    console.log('Payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const result = await response.json() as {
      success: boolean;
      message?: string;
      error?: string;
      receivedAt?: string;
      payloadSize?: number;
    };

    console.log('Edge Function response:', result);

    if (!response.ok) {
      throw new Error(result.error || 'Request failed');
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('Test request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
