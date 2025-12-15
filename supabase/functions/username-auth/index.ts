import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SignupRequest {
  action: "signup";
  username: string;
}

interface LoginRequest {
  action: "login";
  username: string;
}

type AuthRequest = SignupRequest | LoginRequest;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = (await req.json()) as AuthRequest;
    const { action, username } = body;

    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Username is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();

    if (action === "signup") {
      const { data: existingUser } = await supabase
        .from("usernames")
        .select("id")
        .ilike("username", normalizedUsername)
        .maybeSingle();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: "Username already taken" }),
          {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: `${normalizedUsername}@natureup.internal`,
        email_confirm: true,
        user_metadata: { username: normalizedUsername },
      });

      if (authError || !authData.user) {
        console.error("Failed to create user:", authError);
        return new Response(
          JSON.stringify({ error: "Failed to create account" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const userId = authData.user.id;

      const { error: usernameError } = await supabase
        .from("usernames")
        .insert({
          username: normalizedUsername,
          user_id: userId,
        });

      if (usernameError) {
        console.error("Failed to create username record:", usernameError);
        await supabase.auth.admin.deleteUser(userId);
        return new Response(
          JSON.stringify({ error: "Failed to create account" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: userId,
          username: normalizedUsername,
          full_name: username.trim(),
        });

      if (profileError) {
        console.error("Failed to create profile:", profileError);
      }

      const { data: sessionData, error: sessionError } =
        await supabase.auth.admin.generateLink({
          type: "magiclink",
          email: `${normalizedUsername}@natureup.internal`,
        });

      if (sessionError || !sessionData) {
        console.error("Failed to generate session:", sessionError);
        return new Response(
          JSON.stringify({ error: "Failed to create session" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          user: authData.user,
          session: sessionData.properties,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (action === "login") {
      const { data: usernameRecord, error: lookupError } = await supabase
        .from("usernames")
        .select("user_id")
        .ilike("username", normalizedUsername)
        .maybeSingle();

      if (lookupError || !usernameRecord) {
        return new Response(
          JSON.stringify({ error: "Invalid username" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data: userData, error: userError } =
        await supabase.auth.admin.getUserById(usernameRecord.user_id);

      if (userError || !userData.user) {
        console.error("Failed to get user:", userError);
        return new Response(
          JSON.stringify({ error: "Failed to authenticate" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data: sessionData, error: sessionError } =
        await supabase.auth.admin.generateLink({
          type: "magiclink",
          email: userData.user.email!,
        });

      if (sessionError || !sessionData) {
        console.error("Failed to generate session:", sessionError);
        return new Response(
          JSON.stringify({ error: "Failed to create session" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          user: userData.user,
          session: sessionData.properties,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});