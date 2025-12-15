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

const INTERNAL_PASSWORD = Deno.env.get("USERNAME_AUTH_PASSWORD") || "NatureUP_Internal_2024!";

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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || supabaseServiceKey);

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
    const syntheticEmail = `${normalizedUsername}@natureup.internal`;

    if (action === "signup") {
      const { data: existingUser } = await supabaseAdmin
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

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: syntheticEmail,
        password: INTERNAL_PASSWORD,
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

      const { error: usernameError } = await supabaseAdmin
        .from("usernames")
        .insert({
          username: normalizedUsername,
          user_id: userId,
        });

      if (usernameError) {
        console.error("Failed to create username record:", usernameError);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return new Response(
          JSON.stringify({ error: "Failed to create account" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .insert({
          user_id: userId,
          username: normalizedUsername,
          full_name: username.trim(),
        });

      if (profileError) {
        console.error("Failed to create profile:", profileError);
      }

      const { data: sessionData, error: sessionError } = await supabaseClient.auth.signInWithPassword({
        email: syntheticEmail,
        password: INTERNAL_PASSWORD,
      });

      if (sessionError || !sessionData.session) {
        console.error("Failed to create session:", sessionError);
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
          user: sessionData.user,
          session: {
            access_token: sessionData.session.access_token,
            refresh_token: sessionData.session.refresh_token,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (action === "login") {
      const { data: usernameRecord, error: lookupError } = await supabaseAdmin
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
        await supabaseAdmin.auth.admin.getUserById(usernameRecord.user_id);

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

      const { data: sessionData, error: sessionError } = await supabaseClient.auth.signInWithPassword({
        email: userData.user.email!,
        password: INTERNAL_PASSWORD,
      });

      if (sessionError || !sessionData.session) {
        console.error("Failed to create session:", sessionError);
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
          user: sessionData.user,
          session: {
            access_token: sessionData.session.access_token,
            refresh_token: sessionData.session.refresh_token,
          },
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