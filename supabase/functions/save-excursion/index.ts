import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { getSupabaseClient } from "../_shared/supabaseClient.ts";

interface SaveExcursionRequest {
  userId: string;
  excursionData: {
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
  };
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: SaveExcursionRequest = await req.json();

    if (!body.userId || !body.excursionData) {
      return new Response(
        JSON.stringify({ error: "userId and excursionData are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { userId, excursionData } = body;

    if (
      !excursionData.title ||
      !excursionData.description ||
      !excursionData.duration_minutes ||
      !excursionData.distance_km ||
      !excursionData.difficulty ||
      !excursionData.route_data
    ) {
      return new Response(
        JSON.stringify({
          error:
            "excursionData must include title, description, duration_minutes, distance_km, difficulty, and route_data",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("excursions")
      .insert({
        user_id: userId,
        title: excursionData.title,
        description: excursionData.description,
        duration_minutes: excursionData.duration_minutes,
        distance_km: excursionData.distance_km,
        difficulty: excursionData.difficulty,
        route_data: excursionData.route_data,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to save excursion:", error);
      return new Response(
        JSON.stringify({
          error: `Failed to save excursion: ${error.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        excursionId: data.id,
        success: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in save-excursion function:", error);
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
