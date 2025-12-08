import Constants from 'expo-constants';
import type {
  CreateThreadRequest,
  CreateThreadResponse,
  SendMessageRequest,
  AssistantResponse,
  ExcursionRequest,
  ExcursionResponse,
  WeatherData,
  LocationInput,
} from '../types/assistant';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

const headers = {
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
};

export const assistantAPI = {
  async createThread(request: CreateThreadRequest): Promise<CreateThreadResponse> {
    const response = await fetch(`${supabaseUrl}/functions/v1/health-coach`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'create_thread',
        ...request,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create thread: ${errorText}`);
    }

    const data = await response.json();
    return data as CreateThreadResponse;
  },

  async sendMessage(request: SendMessageRequest): Promise<AssistantResponse> {
    const response = await fetch(`${supabaseUrl}/functions/v1/health-coach`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'send_message',
        ...request,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send message: ${errorText}`);
    }

    const data = await response.json();
    return data as AssistantResponse;
  },

  async getThreadMessages(threadId: string): Promise<any[]> {
    const response = await fetch(`${supabaseUrl}/functions/v1/health-coach`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'get_messages',
        thread_id: threadId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get messages: ${errorText}`);
    }

    const data = await response.json();
    return data as any[];
  },

  async createExcursion(request: ExcursionRequest): Promise<ExcursionResponse> {
    const response = await fetch(`${supabaseUrl}/functions/v1/excursion-creator`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create excursion: ${errorText}`);
    }

    const data = await response.json();
    return data as ExcursionResponse;
  },

  async getWeather(location: LocationInput): Promise<WeatherData> {
    const response = await fetch(`${supabaseUrl}/functions/v1/weather`, {
      method: 'POST',
      headers,
      body: JSON.stringify(location),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get weather: ${errorText}`);
    }

    const data = await response.json();
    return data as WeatherData;
  },
};
