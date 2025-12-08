import Constants from 'expo-constants';
import type { NatureUpRequest } from '../types/api';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

const headers = {
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
};

interface ValidationResponse {
  valid: boolean;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
  error?: string;
}

export async function sendValidRequest(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const validPayload: NatureUpRequest = {
      user: {
        id: 'test-user-123',
        healthGoals: ['reduce stress', 'improve fitness'],
        preferences: {
          activities: ['hiking', 'walking'],
          difficulty: 'moderate'
        }
      },
      input: {
        modality: 'text',
        transcript: 'I want to go for a walk in nature today',
        language: 'en'
      },
      context: {
        screen: 'home',
        location: {
          lat: 37.7749,
          lng: -122.4194,
          accuracyMeters: 10
        },
        weatherSummary: {
          temperature: 72,
          condition: 'sunny'
        }
      },
      capabilities: {
        canUseLocation: true,
        canUseBackgroundAudio: false
      },
      clientVersion: '1.0.0'
    };

    console.log('=== SENDING VALID REQUEST ===');
    console.log('Payload:', JSON.stringify(validPayload, null, 2));

    const response = await fetch(`${supabaseUrl}/functions/v1/validate-request`, {
      method: 'POST',
      headers,
      body: JSON.stringify(validPayload),
    });

    const data = await response.json() as ValidationResponse;

    console.log('=== RESPONSE RECEIVED ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));

    if (response.ok && data.valid) {
      return {
        success: true,
        message: 'Valid request accepted!'
      };
    } else {
      return {
        success: false,
        error: data.message || 'Request validation failed'
      };
    }
  } catch (error) {
    console.error('=== REQUEST FAILED ===', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function sendInvalidRequest(): Promise<{ success: boolean; message?: string; error?: string; errors?: any[] }> {
  try {
    const invalidPayload = {
      user: {
        healthGoals: ['reduce stress'],
      },
      input: {
        modality: 'invalid-modality',
        transcript: 123,
      },
      context: {
        location: {
          lat: 'not-a-number',
          lng: -122.4194,
        }
      },
      capabilities: {
        canUseLocation: 'yes',
        canUseBackgroundAudio: 'no'
      }
    };

    console.log('=== SENDING INVALID REQUEST ===');
    console.log('Payload:', JSON.stringify(invalidPayload, null, 2));

    const response = await fetch(`${supabaseUrl}/functions/v1/validate-request`, {
      method: 'POST',
      headers,
      body: JSON.stringify(invalidPayload),
    });

    const data = await response.json() as ValidationResponse;

    console.log('=== RESPONSE RECEIVED ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));

    if (!response.ok && !data.valid) {
      return {
        success: true,
        message: 'Invalid request correctly rejected',
        errors: data.errors
      };
    } else {
      return {
        success: false,
        error: 'Invalid request was not rejected!'
      };
    }
  } catch (error) {
    console.error('=== REQUEST FAILED ===', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
