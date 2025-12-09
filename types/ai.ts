export interface WellnessActivity {
  name: string;
  description: string;
  duration_minutes?: number;
}

export interface Waypoint {
  latitude: number;
  longitude: number;
  name: string;
  description: string;
  order: number;
  wellness_activity?: WellnessActivity;
}

export interface ExcursionOption {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  distance_km: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  route_data: {
    waypoints: Waypoint[];
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
  therapeutic_benefits?: string[];
}

export interface CoachingSteps {
  steps: Array<{
    title: string;
    description: string;
    duration_minutes?: number;
  }>;
  intent: 'motivate' | 'advise' | 'encourage' | 'educate' | 'celebrate';
}

export interface HealthCoachRequest {
  message: string;
  threadId?: string;
  context?: {
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    weather?: {
      temperature: number;
      feels_like: number;
      humidity: number;
      description: string;
      wind_speed: number;
      conditions: string;
    };
    profile?: {
      full_name: string | null;
      health_goals: string[];
      preferences: Record<string, any>;
    };
  };
}

export interface HealthCoachResponse {
  threadId: string;
  message: {
    id: string;
    role: 'assistant';
    content: string;
    created_at: number;
  };
  excursions?: ExcursionOption[] | null;
  coachingSteps?: CoachingSteps | null;
}

export interface SaveExcursionRequest {
  userId: string;
  excursionData: {
    title: string;
    description: string;
    duration_minutes: number;
    distance_km: number;
    difficulty: 'easy' | 'moderate' | 'challenging';
    route_data: {
      waypoints: Waypoint[];
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
  };
}

export interface SaveExcursionResponse {
  excursionId: string;
  success: boolean;
}
