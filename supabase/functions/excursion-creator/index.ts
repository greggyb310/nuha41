import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { openai, ASSISTANT_IDS } from "../_shared/openai-client.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

interface ExcursionRequest {
  user_id: string;
  preferences: {
    duration_minutes?: number;
    distance_km?: number;
    difficulty?: "easy" | "moderate" | "challenging";
    terrain?: "forest" | "beach" | "mountain" | "park" | "urban";
    time_of_day?: "morning" | "afternoon" | "evening";
  };
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  health_profile?: {
    full_name: string | null;
    health_goals: string[];
    preferences: Record<string, any>;
  };
  weather_data?: {
    temperature: number;
    feels_like: number;
    humidity: number;
    description: string;
    wind_speed: number;
    conditions: string;
  };
}

function formatExcursionPrompt(req: ExcursionRequest): string {
  const parts = [];

  parts.push("Create a personalized nature therapy excursion with the following parameters:");
  parts.push(`\nLocation: ${req.location.address || `${req.location.latitude}, ${req.location.longitude}`}`);

  if (req.preferences.duration_minutes) {
    parts.push(`Duration: ${req.preferences.duration_minutes} minutes`);
  }

  if (req.preferences.distance_km) {
    parts.push(`Distance: ${req.preferences.distance_km} km`);
  }

  if (req.preferences.difficulty) {
    parts.push(`Difficulty: ${req.preferences.difficulty}`);
  }

  if (req.preferences.terrain) {
    parts.push(`Preferred terrain: ${req.preferences.terrain}`);
  }

  if (req.preferences.time_of_day) {
    parts.push(`Time of day: ${req.preferences.time_of_day}`);
  }

  if (req.weather_data) {
    parts.push(`\nCurrent weather: ${req.weather_data.description}, ${req.weather_data.temperature}°C (feels like ${req.weather_data.feels_like}°C)`);
    parts.push(`Humidity: ${req.weather_data.humidity}%, Wind speed: ${req.weather_data.wind_speed} m/s`);
  }

  if (req.health_profile) {
    if (req.health_profile.full_name) {
      parts.push(`\nUser: ${req.health_profile.full_name}`);
    }
    if (req.health_profile.health_goals && req.health_profile.health_goals.length > 0) {
      parts.push(`Health goals: ${req.health_profile.health_goals.join(", ")}`);
    }
  }

  return parts.join("\n");
}

async function createExcursion(req: ExcursionRequest) {
  try {
    const thread = await openai.beta.threads.create();

    const prompt = formatExcursionPrompt(req);

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: prompt,
    });

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: ASSISTANT_IDS.EXCURSION_CREATOR,
      tool_choice: "required",
    });

    if (run.status !== "requires_action") {
      throw new Error(`Expected run to require action, but got status: ${run.status}`);
    }

    if (run.required_action?.type !== "submit_tool_outputs") {
      throw new Error("Expected submit_tool_outputs action");
    }

    const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
    const planExcursionCall = toolCalls.find(call => call.function.name === "plan_excursion");

    if (!planExcursionCall) {
      throw new Error("No plan_excursion tool call found");
    }

    const excursionData = JSON.parse(planExcursionCall.function.arguments);
    console.log("Excursion plan from tool call:", excursionData);

    if (!excursionData.waypoints || !Array.isArray(excursionData.waypoints) || excursionData.waypoints.length === 0) {
      throw new Error("Excursion planner returned no waypoints. Please check OpenAI Assistant configuration or try again.");
    }

    return {
      title: excursionData.title,
      description: excursionData.summary || excursionData.description,
      route_data: {
        waypoints: excursionData.waypoints,
        start_location: excursionData.waypoints[0],
        end_location: excursionData.waypoints[excursionData.waypoints.length - 1],
        terrain_type: excursionData.terrain_type,
        elevation_gain: 0
      },
      duration_minutes: excursionData.duration_minutes,
      distance_km: excursionData.distance_km,
      difficulty: excursionData.difficulty,
      therapeutic_benefits: excursionData.therapeutic_benefits,
    };
  } catch (error) {
    console.error("Error creating excursion:", error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: ExcursionRequest = await req.json();

    if (!body.location || typeof body.location.latitude !== "number" || typeof body.location.longitude !== "number") {
      return new Response(
        JSON.stringify({ error: "Valid location with latitude and longitude is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await createExcursion(body);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in excursion-creator function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});