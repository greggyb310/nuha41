export type NatureUpRequest = {
  user: {
    id: string;
    healthGoals?: string[];
    preferences?: Record<string, any>;
  };
  input: {
    modality: "voice" | "text";
    transcript: string;
    language?: string;
  };
  context: {
    screen: string;
    excursionId?: string;
    location?: {
      lat: number;
      lng: number;
      accuracyMeters?: number;
    };
    weatherSummary?: {
      temperature: number;
      condition: string;
    };
  };
  capabilities: {
    canUseLocation: boolean;
    canUseBackgroundAudio: boolean;
  };
  clientVersion: string;
};

export type ExcursionPlan = {
  id: string;
  title: string;
  summary: string;
  durationMinutes: number;
  distanceKm: number;
  difficulty: "easy" | "moderate" | "hard";
  waypoints: {
    name: string;
    lat: number;
    lng: number;
    description?: string;
  }[];
  safetyNotes?: string[];
};

export type CoachingResponse = {
  spokenText: string;
  textSummary?: string;
  intent:
    | "motivation"
    | "reflection"
    | "breathing_exercise"
    | "grounding_exercise";
  exercises?: {
    type: "breath" | "mindfulness" | "movement";
    steps: string[];
    durationSeconds?: number;
  }[];
};

export type AppStateUpdate = {
  navigation?: {
    targetScreen: string;
    params?: Record<string, any>;
  };
  uiHints?: {
    bannerMessage?: string;
    showConfetti?: boolean;
  };
  persistence?: {
    saveExcursionId?: string;
    markExcursionCompleted?: boolean;
  };
};

export type NatureUpResponse = {
  coaching?: CoachingResponse;
  excursionPlan?: ExcursionPlan;
  appStateUpdate?: AppStateUpdate;
  rawThreadId?: string;
};
