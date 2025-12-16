import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

type PlacesRequest = {
  latitude: number;
  longitude: number;
  radius?: number;
};

type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  kind: string;
  distance_m: number;
};

function toRad(n: number) {
  return (n * Math.PI) / 180;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function pickCenter(el: any): { lat: number; lon: number } | null {
  if (typeof el.lat === "number" && typeof el.lon === "number") return { lat: el.lat, lon: el.lon };
  if (el.center && typeof el.center.lat === "number" && typeof el.center.lon === "number") {
    return { lat: el.center.lat, lon: el.center.lon };
  }
  return null;
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as PlacesRequest;
    const { latitude, longitude } = body;
    const radius = Math.min(Math.max(body.radius ?? 8000, 500), 20000);

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      return new Response(JSON.stringify({ error: "Invalid latitude/longitude" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const query = `
[out:json][timeout:25];
(
  node(around:${radius},${latitude},${longitude})[leisure=park];
  way(around:${radius},${latitude},${longitude})[leisure=park];

  node(around:${radius},${latitude},${longitude})[leisure=nature_reserve];
  way(around:${radius},${latitude},${longitude})[leisure=nature_reserve];

  node(around:${radius},${latitude},${longitude})[boundary=national_park];
  relation(around:${radius},${latitude},${longitude})[boundary=national_park];

  node(around:${radius},${latitude},${longitude})[tourism=trailhead];
  node(around:${radius},${latitude},${longitude})[information=trailhead];

  node(around:${radius},${latitude},${longitude})[tourism=picnic_site];
);
out center 60;
`;

    const overpassUrl = "https://overpass-api.de/api/interpreter";
    const resp = await fetch(overpassUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: "Overpass error", detail: t.slice(0, 300) }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await resp.json();
    const elements: any[] = Array.isArray(json.elements) ? json.elements : [];

    const places: Place[] = elements
      .map((el) => {
        const center = pickCenter(el);
        if (!center) return null;

        const tags = el.tags ?? {};
        const name = typeof tags.name === "string" ? tags.name : "Unnamed nature spot";
        const kind =
          tags.tourism === "trailhead" || tags.information === "trailhead"
            ? "trailhead"
            : tags.leisure === "park"
              ? "park"
              : tags.leisure === "nature_reserve"
                ? "nature_reserve"
                : tags.boundary === "national_park"
                  ? "national_park"
                  : tags.tourism === "picnic_site"
                    ? "picnic_site"
                    : "nature";

        const distance_m = Math.round(haversineMeters(latitude, longitude, center.lat, center.lon));

        return {
          id: `${el.type}:${el.id}`,
          name,
          latitude: center.lat,
          longitude: center.lon,
          kind,
          distance_m,
        } as Place;
      })
      .filter((p): p is Place => Boolean(p))
      .sort((a, b) => a.distance_m - b.distance_m)
      .slice(0, 3);

    return new Response(JSON.stringify({ places, status: "OK" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in places-lookup:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
