import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log("=== TEST CHECKPOINT 1 ===");
    console.log("Request URL:", req.url);
    console.log("Request Method:", req.method);
    console.log("Request Headers:", JSON.stringify([...req.headers.entries()]));
    
    const payload = await req.json();
    
    console.log("Received NatureUpRequest:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("=========================");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payload received and logged successfully!",
        receivedAt: new Date().toISOString(),
        payloadSize: JSON.stringify(payload).length,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});