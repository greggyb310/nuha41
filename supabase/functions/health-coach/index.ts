import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { openai, ASSISTANT_IDS } from "../_shared/openai-client.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseClient } from "../_shared/supabaseClient.ts";

interface HealthCoachRequest {
  userId: string;
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

interface ExcursionOption {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  distance_km: number;
  difficulty: "easy" | "moderate" | "challenging";
  route_data: {
    waypoints: Array<{
      latitude: number;
      longitude: number;
      name: string;
      description: string;
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
  therapeutic_benefits?: string[];
}

interface CoachingSteps {
  steps: Array<{
    title: string;
    description: string;
    duration_minutes?: number;
  }>;
  intent: "motivate" | "advise" | "encourage" | "educate" | "celebrate";
}

function buildContextMessage(req: HealthCoachRequest): string {
  const parts = [];

  if (req.context?.profile) {
    if (req.context.profile.full_name) {
      parts.push(`User's name: ${req.context.profile.full_name}`);
    }
    if (req.context.profile.health_goals && req.context.profile.health_goals.length > 0) {
      parts.push(`Health goals: ${req.context.profile.health_goals.join(", ")}`);
    }
  }

  if (req.context?.location) {
    const loc = req.context.location;
    parts.push(
      `Current location: ${loc.address || `${loc.latitude}, ${loc.longitude}`}`
    );
  }

  if (req.context?.weather) {
    const w = req.context.weather;
    parts.push(
      `Current weather: ${w.description}, ${w.temperature}°C (feels like ${w.feels_like}°C), ${w.humidity}% humidity, wind ${w.wind_speed} m/s`
    );
  }

  if (parts.length === 0) return req.message;

  return `${parts.join("\n")}\n\nUser message: ${req.message}`;
}

async function loadUserProfile(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("full_name, health_goals, preferences")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("Failed to load user profile:", error);
    return null;
  }

  return data;
}

async function saveConversation(
  userId: string,
  threadId: string,
  messageCount: number
) {
  const supabase = getSupabaseClient();

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("thread_id", threadId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("conversations")
      .update({
        message_count: messageCount,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("conversations").insert({
      user_id: userId,
      assistant_type: "health_coach",
      thread_id: threadId,
      message_count: messageCount,
      last_message_at: new Date().toISOString(),
    });
  }
}

function parseToolCalls(run: any): {
  excursions: ExcursionOption[] | null;
  coachingSteps: CoachingSteps | null;
  textResponse: string;
} {
  let excursions: ExcursionOption[] | null = null;
  let coachingSteps: CoachingSteps | null = null;
  let textResponse = "";

  if (run.required_action?.type === "submit_tool_outputs") {
    const toolCalls = run.required_action.submit_tool_outputs.tool_calls;

    for (const toolCall of toolCalls) {
      try {
        const args = JSON.parse(toolCall.function.arguments);

        if (toolCall.function.name === "plan_excursion") {
          const option: ExcursionOption = {
            id: args.id,
            title: args.title,
            description: args.summary || args.description,
            duration_minutes: args.duration_minutes,
            distance_km: args.distance_km,
            difficulty: args.difficulty,
            route_data: {
              waypoints: args.waypoints,
              start_location: args.waypoints[0] || { latitude: 0, longitude: 0 },
              end_location:
                args.waypoints[args.waypoints.length - 1] || {
                  latitude: 0,
                  longitude: 0,
                },
              terrain_type: args.terrain_type,
              elevation_gain: 0,
            },
            therapeutic_benefits: args.therapeutic_benefits,
          };

          if (!excursions) excursions = [];
          excursions.push(option);

          textResponse += `I've created an excursion plan called "${args.title}". ${
            args.summary || args.description
          }\n\n`;
        }

        if (toolCall.function.name === "coach_user") {
          textResponse += args.spokenText + "\n\n";

          if (args.exercises && args.exercises.length > 0) {
            coachingSteps = {
              steps: args.exercises.map((ex: any) => ({
                title: ex.name,
                description: ex.description,
                duration_minutes: ex.duration_minutes,
              })),
              intent: args.intent,
            };
          }
        }
      } catch (err) {
        console.error("Failed to parse tool call:", err);
      }
    }
  }

  return { excursions, coachingSteps, textResponse: textResponse.trim() };
}

async function processMessage(req: HealthCoachRequest) {
  const profile = req.context?.profile || (await loadUserProfile(req.userId));

  const contextMessage = buildContextMessage({
    ...req,
    context: {
      ...req.context,
      profile: profile || undefined,
    },
  });

  let threadId = req.threadId;
  if (!threadId) {
    const thread = await openai.beta.threads.create();
    threadId = thread.id;
  }

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: contextMessage,
  });

  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: ASSISTANT_IDS.HEALTH_COACH,
  });

  let responseText = "";
  let excursions: ExcursionOption[] | null = null;
  let coachingSteps: CoachingSteps | null = null;

  if (run.status === "requires_action") {
    const parsed = parseToolCalls(run);
    excursions = parsed.excursions;
    coachingSteps = parsed.coachingSteps;
    responseText = parsed.textResponse || "Let me know what you'd like to do!";
  } else if (run.status === "completed") {
    const messages = await openai.beta.threads.messages.list(threadId);
    const assistantMessage = messages.data.find((msg) => msg.role === "assistant");

    if (assistantMessage && assistantMessage.content[0].type === "text") {
      responseText = assistantMessage.content[0].text.value;
    }
  } else {
    throw new Error(`Run failed with status: ${run.status}`);
  }

  const messages = await openai.beta.threads.messages.list(threadId);
  const messageCount = messages.data.length;

  await saveConversation(req.userId, threadId, messageCount);

  return {
    threadId,
    message: {
      id: `msg_${Date.now()}`,
      role: "assistant" as const,
      content: responseText,
      created_at: Date.now(),
    },
    excursions,
    coachingSteps,
  };
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: HealthCoachRequest = await req.json();

    if (!body.userId || !body.message) {
      return new Response(
        JSON.stringify({ error: "userId and message are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await processMessage(body);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in health-coach function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
