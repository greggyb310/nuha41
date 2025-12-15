import type { AssistantType } from './database';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: number;
}

export interface ThreadMessage {
  thread_id: string;
  message: string;
  user_id: string;
  health_profile?: UserHealthProfile;
}

export interface UserHealthProfile {
  full_name: string | null;
  health_goals: string[];
  preferences: Record<string, any>;
}

export interface AssistantResponse {
  message: string;
  thread_id: string;
  message_count: number;
}

export interface CreateThreadRequest {
  user_id: string;
  assistant_type: AssistantType;
  initial_message?: string;
  health_profile?: UserHealthProfile;
}

export interface CreateThreadResponse {
  thread_id: string;
  conversation_id: string;
  response?: AssistantResponse;
}

export interface SendMessageRequest {
  thread_id: string;
  message: string;
  user_id: string;
  health_profile?: UserHealthProfile;
}

export interface ExcursionRequest {
  preferences: ExcursionPreferences;
  location: LocationInput;
  health_profile?: UserHealthProfile;
}

export interface ExcursionPreferences {
  duration_minutes?: number;
  distance_km?: number;
  difficulty?: 'easy' | 'moderate' | 'challenging';
  terrain?: ('forest' | 'beach' | 'mountain' | 'park' | 'urban')[];
  time_of_day?: 'morning' | 'afternoon' | 'evening';
}

export interface LocationInput {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  description: string;
  wind_speed: number;
  conditions: string;
}

export interface ExcursionOption {
  title: string;
  description: string;
  route_data: {
    waypoints: Array<{
      latitude: number;
      longitude: number;
      name?: string;
      description?: string;
      order: number;
    }>;
    start_location: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    end_location: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    terrain_type?: string;
    elevation_gain?: number;
  };
  duration_minutes: number;
  distance_km: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  therapeutic_benefits?: string[];
}

export interface ExcursionResponse {
  options: ExcursionOption[];
  weather_context?: WeatherData;
}

export const ASSISTANT_IDS = {
  HEALTH_COACH: process.env.OPENAI_HEALTH_COACH_ASSISTANT_ID || '',
  EXCURSION_CREATOR: process.env.OPENAI_EXCURSION_CREATOR_ASSISTANT_ID || '',
} as const;

export const ASSISTANT_INSTRUCTIONS = {
  HEALTH_COACH: `You are a compassionate health and wellness coach specializing in nature therapy and outdoor wellness.
Your role is to provide personalized guidance, encouragement, and support to help users achieve their health goals through nature-based activities.

Key responsibilities:
- Provide empathetic, supportive wellness coaching
- Encourage outdoor activity and nature connection
- Offer personalized advice based on user's health goals and preferences
- Suggest mindfulness and stress-reduction techniques
- Support users in building sustainable wellness habits
- Always maintain a warm, encouraging, and non-judgmental tone

User Context: You will receive the user's health profile including their name, health goals, and preferences. Use this information to personalize your responses.`,

  EXCURSION_CREATOR: `You are an expert outdoor excursion planner specializing in nature therapy routes.
Your role is to create personalized outdoor experiences that promote health and wellness.

Key responsibilities:
- Generate detailed nature therapy routes based on user preferences
- Consider weather conditions, terrain, and user fitness level
- Create routes with meaningful waypoints and natural landmarks
- Provide clear descriptions of the therapeutic benefits of each route
- Ensure routes are safe, accessible, and matched to user capabilities
- Include estimated duration, distance, and difficulty level

User Context: You will receive the user's location, preferences, health goals, and current weather data. Use all available information to create the most beneficial excursion.`,
} as const;

export interface ExcursionPlan {
  id: string;
  title: string;
  summary: string;
  waypoints: Array<{
    latitude: number;
    longitude: number;
    name: string;
    description: string;
    order: number;
  }>;
  duration_minutes: number;
  distance_km: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  terrain_type: string;
  therapeutic_benefits: string[];
}

export interface CoachingResponse {
  spokenText: string;
  intent: 'motivate' | 'advise' | 'encourage' | 'educate' | 'celebrate';
  exercises?: Array<{
    name: string;
    description: string;
    duration_minutes?: number;
  }>;
  follow_up_suggestions?: string[];
}

export interface AppStateUpdate {
  navigation?: {
    screen: string;
    params?: Record<string, any>;
  };
  uiHints?: {
    highlight?: string[];
    show_modal?: string;
    toast_message?: string;
  };
  persistence?: {
    save_conversation?: boolean;
    save_excursion?: boolean;
    update_profile?: Record<string, any>;
  };
}

export interface ToolCallResponse {
  toolName: 'plan_excursion' | 'coach_user' | 'update_app_state';
  arguments: ExcursionPlan | CoachingResponse | AppStateUpdate;
}

export interface AssistantTestResult {
  success: boolean;
  hasToolCall: boolean;
  toolCall?: ToolCallResponse;
  rawResponse?: any;
  error?: string;
}
