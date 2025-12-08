import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

const OPENWEATHER_API_KEY = Deno.env.get("OPENWEATHER_API_KEY");

if (!OPENWEATHER_API_KEY) {
  throw new Error("OPENWEATHER_API_KEY environment variable is required");
}

interface LocationRequest {
  latitude: number;
  longitude: number;
}

interface WeatherResponse {
  temperature: number;
  feels_like: number;
  humidity: number;
  description: string;
  wind_speed: number;
  conditions: string;
}

async function getWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenWeatherMap API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      wind_speed: data.wind.speed,
      conditions: data.weather[0].main,
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: LocationRequest = await req.json();

    if (typeof body.latitude !== "number" || typeof body.longitude !== "number") {
      return new Response(
        JSON.stringify({ error: "Valid latitude and longitude are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (body.latitude < -90 || body.latitude > 90 || body.longitude < -180 || body.longitude > 180) {
      return new Response(
        JSON.stringify({ error: "Invalid coordinates range" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const weatherData = await getWeather(body.latitude, body.longitude);

    return new Response(
      JSON.stringify(weatherData),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in weather function:", error);
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
