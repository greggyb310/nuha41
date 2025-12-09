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
import type {
  HealthCoachRequest,
  HealthCoachResponse,
  SaveExcursionRequest,
  SaveExcursionResponse,
} from '../types/ai';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

function getAuthHeaders(sessionToken?: string) {
  const token = sessionToken ?? supabaseAnonKey;

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export const assistantAPI = {
  async createThread(request: CreateThreadRequest, sessionToken?: string): Promise<CreateThreadResponse> {
    const response = await fetch(`${supabaseUrl}/functions/v1/health-coach`, {
      method: 'POST',
      headers: getAuthHeaders(sessionToken),
      body: JSON.stringify({
        action: 'create_thread',
        ...request,
      }),
    });

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { error: await response.text() };
      }

      console.error('Create thread error:', response.status, errorBody);

      if (response.status === 401 || response.status === 403) {
        throw new Error('AUTH');
      } else if (response.status >= 500) {
        throw new Error('SERVER');
      } else {
        throw new Error(errorBody?.error || `HTTP ${response.status}`);
      }
    }

    const data = await response.json();
    return data as CreateThreadResponse;
  },

  async sendMessage(request: SendMessageRequest, sessionToken?: string): Promise<AssistantResponse> {
    const response = await fetch(`${supabaseUrl}/functions/v1/health-coach`, {
      method: 'POST',
      headers: getAuthHeaders(sessionToken),
      body: JSON.stringify({
        action: 'send_message',
        ...request,
      }),
    });

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { error: await response.text() };
      }

      console.error('Send message error:', response.status, errorBody);

      if (response.status === 401 || response.status === 403) {
        throw new Error('AUTH');
      } else if (response.status >= 500) {
        throw new Error('SERVER');
      } else {
        throw new Error(errorBody?.error || `HTTP ${response.status}`);
      }
    }

    const data = await response.json();
    return data as AssistantResponse;
  },

  async getThreadMessages(threadId: string, sessionToken?: string): Promise<any[]> {
    const response = await fetch(`${supabaseUrl}/functions/v1/health-coach`, {
      method: 'POST',
      headers: getAuthHeaders(sessionToken),
      body: JSON.stringify({
        action: 'get_messages',
        thread_id: threadId,
      }),
    });

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { error: await response.text() };
      }

      console.error('Get messages error:', response.status, errorBody);

      if (response.status === 401 || response.status === 403) {
        throw new Error('AUTH');
      } else if (response.status >= 500) {
        throw new Error('SERVER');
      } else {
        throw new Error(errorBody?.error || `HTTP ${response.status}`);
      }
    }

    const data = await response.json();
    return data as any[];
  },

  async createExcursion(request: ExcursionRequest, sessionToken?: string): Promise<ExcursionResponse> {
    const response = await fetch(`${supabaseUrl}/functions/v1/excursion-creator`, {
      method: 'POST',
      headers: getAuthHeaders(sessionToken),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { error: await response.text() };
      }

      console.error('Create excursion error:', response.status, errorBody);

      if (response.status === 401 || response.status === 403) {
        throw new Error('AUTH');
      } else if (response.status >= 500) {
        throw new Error('SERVER');
      } else {
        throw new Error(errorBody?.error || `HTTP ${response.status}`);
      }
    }

    const data = await response.json();
    return data as ExcursionResponse;
  },

  async getWeather(location: LocationInput, sessionToken?: string): Promise<WeatherData> {
    const response = await fetch(`${supabaseUrl}/functions/v1/weather`, {
      method: 'POST',
      headers: getAuthHeaders(sessionToken),
      body: JSON.stringify(location),
    });

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { error: await response.text() };
      }

      console.error('Get weather error:', response.status, errorBody);

      if (response.status === 401 || response.status === 403) {
        throw new Error('AUTH');
      } else if (response.status >= 500) {
        throw new Error('SERVER');
      } else {
        throw new Error(errorBody?.error || `HTTP ${response.status}`);
      }
    }

    const data = await response.json();
    return data as WeatherData;
  },

  async sendToHealthCoach(request: HealthCoachRequest, sessionToken?: string): Promise<HealthCoachResponse> {
    const response = await fetch(`${supabaseUrl}/functions/v1/health-coach`, {
      method: 'POST',
      headers: getAuthHeaders(sessionToken),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { error: await response.text() };
      }

      console.error('Health coach error:', response.status, errorBody);

      if (response.status === 401 || response.status === 403) {
        throw new Error('AUTH');
      } else if (response.status >= 500) {
        throw new Error('SERVER');
      } else {
        throw new Error(errorBody?.error || `HTTP ${response.status}`);
      }
    }

    const data = await response.json();
    return data as HealthCoachResponse;
  },

  async saveExcursion(request: SaveExcursionRequest, sessionToken?: string): Promise<SaveExcursionResponse> {
    const response = await fetch(`${supabaseUrl}/functions/v1/save-excursion`, {
      method: 'POST',
      headers: getAuthHeaders(sessionToken),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { error: await response.text() };
      }

      console.error('Save excursion error:', response.status, errorBody);

      if (response.status === 401 || response.status === 403) {
        throw new Error('AUTH');
      } else if (response.status >= 500) {
        throw new Error('SERVER');
      } else {
        throw new Error(errorBody?.error || `HTTP ${response.status}`);
      }
    }

    const data = await response.json();
    return data as SaveExcursionResponse;
  },
};
