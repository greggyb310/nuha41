import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");

if (!GOOGLE_MAPS_API_KEY) {
  throw new Error("GOOGLE_MAPS_API_KEY environment variable is required");
}

interface PlacesRequest {
  latitude: number;
  longitude: number;
  radius?: number;
}

interface Place {
  place_id: string;
  name: string;
  types: string[];
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

interface PlacesResponse {
  places: Place[];
  status: string;
}

const NATURE_TYPES = [
  "park",
  "natural_feature",
  "tourist_attraction",
  "point_of_interest",
];

async function searchNearbyPlaces(
  lat: number,
  lng: number,
  radius: number
): Promise<PlacesResponse> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", radius.toString());
  url.searchParams.set("type", "park");
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY!);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Places API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API returned status: ${data.status}`);
    }

    const filteredPlaces = (data.results || []).filter((place: Place) => {
      return place.types?.some((type: string) => NATURE_TYPES.includes(type));
    });

    return {
      places: filteredPlaces.slice(0, 10),
      status: data.status,
    };
  } catch (error) {
    console.error("Error fetching places:", error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: PlacesRequest = await req.json();

    if (typeof body.latitude !== "number" || typeof body.longitude !== "number") {
      return new Response(
        JSON.stringify({ error: "Valid latitude and longitude are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (
      body.latitude < -90 ||
      body.latitude > 90 ||
      body.longitude < -180 ||
      body.longitude > 180
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid coordinates range" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const radius = body.radius || 5000;

    if (radius < 100 || radius > 50000) {
      return new Response(
        JSON.stringify({ error: "Radius must be between 100 and 50000 meters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const placesData = await searchNearbyPlaces(
      body.latitude,
      body.longitude,
      radius
    );

    return new Response(JSON.stringify(placesData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in places-lookup function:", error);
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
