import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");

  if (!GOOGLE_MAPS_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GOOGLE_MAPS_API_KEY not found" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({ key: GOOGLE_MAPS_API_KEY }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});