import Constants from 'expo-constants';
import type { AssistantTestResult } from '../types/assistant';

const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export async function testAssistantToolCall(): Promise<AssistantTestResult> {
  try {
    console.log('=== CLIENT: Testing Assistant Tool Call ===');

    const apiUrl = `${SUPABASE_URL}/functions/v1/test-assistant`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response not OK:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const result: AssistantTestResult = data as AssistantTestResult;

    console.log('=== CLIENT: Test Result ===');
    console.log('Success:', result.success);
    console.log('Has Tool Call:', result.hasToolCall);

    if (result.toolCall) {
      console.log('Tool Name:', result.toolCall.toolName);
      console.log('Tool Arguments:', JSON.stringify(result.toolCall.arguments, null, 2));
    }

    if (result.error) {
      console.error('Error:', result.error);
    }

    return result;
  } catch (error) {
    console.error('=== CLIENT: Error Testing Assistant ===');
    console.error(error);

    return {
      success: false,
      hasToolCall: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
