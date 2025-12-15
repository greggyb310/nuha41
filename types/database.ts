export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      excursions: {
        Row: Excursion;
        Insert: Omit<Excursion, 'id' | 'created_at'>;
        Update: Partial<Omit<Excursion, 'id' | 'created_at' | 'user_id'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at'>;
        Update: Partial<Omit<Conversation, 'id' | 'created_at' | 'user_id'>>;
      };
      favorite_excursions: {
        Row: FavoriteExcursion;
        Insert: Omit<FavoriteExcursion, 'id' | 'created_at'>;
        Update: Partial<Omit<FavoriteExcursion, 'id' | 'created_at'>>;
      };
      usernames: {
        Row: Username;
        Insert: Omit<Username, 'id' | 'created_at'>;
        Update: Partial<Omit<Username, 'id' | 'created_at'>>;
      };
    };
  };
}

export interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  health_goals: string[] | null;
  preferences: UserPreferences | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  activities?: string[];
  difficulty?: 'easy' | 'moderate' | 'challenging';
  preferred_terrain?: 'forest' | 'beach' | 'mountain' | 'park' | 'urban';
  preferred_time?: 'morning' | 'afternoon' | 'evening';
  max_distance_km?: number;
  fitness_level?: 'beginner' | 'intermediate' | 'advanced';
  accessibility_needs?: string[];
  unit_system?: 'imperial' | 'metric';
}

export interface Excursion {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  route_data: RouteData;
  duration_minutes: number | null;
  distance_km: number | null;
  difficulty: 'easy' | 'moderate' | 'challenging' | null;
  created_at: string;
  completed_at: string | null;
}

export interface RouteData {
  waypoints: Waypoint[];
  start_location: Location;
  end_location: Location;
  terrain_type?: string;
  elevation_gain?: number;
}

export interface Waypoint {
  latitude: number;
  longitude: number;
  name?: string;
  description?: string;
  order: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  assistant_type: 'health_coach' | 'excursion_creator';
  thread_id: string;
  message_count: number;
  last_message_at: string;
  created_at: string;
}

export interface FavoriteExcursion {
  id: string;
  user_id: string;
  excursion_id: string;
  created_at: string;
}

export interface Username {
  id: string;
  username: string;
  user_id: string;
  created_at: string;
}

export type AssistantType = 'health_coach' | 'excursion_creator';
export type Difficulty = 'easy' | 'moderate' | 'challenging';
