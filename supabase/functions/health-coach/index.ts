import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { openai, ASSISTANT_IDS } from "../_shared/openai-client.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

interface CreateThreadRequest {
  action: "create_thread";
  user_id: string;
  assistant_type: string;
  initial_message?: string;
  health_profile?: {
    full_name: string | null;
    health_goals: string[];
    preferences: Record<string, any>;
  };
}

interface SendMessageRequest {
  action: "send_message";
  thread_id: string;
  message: string;
  user_id: string;
  health_profile?: {
    full_name: string | null;
    health_goals: string[];
    preferences: Record<string, any>;
  };
}

interface GetMessagesRequest {
  action: "get_messages";
  thread_id: string;
}

type RequestBody = CreateThreadRequest | SendMessageRequest | GetMessagesRequest;

function formatHealthProfile(profile?: {
  full_name: string | null;
  health_goals: string[];
  preferences: Record<string, any>;
}): string {
  if (!profile) return "";

  const parts = [];

  if (profile.full_name) {
    parts.push(`User's name: ${profile.full_name}`);
  }

  if (profile.health_goals && profile.health_goals.length > 0) {
    parts.push(`Health goals: ${profile.health_goals.join(", ")}`);
  }

  if (profile.preferences && Object.keys(profile.preferences).length > 0) {
    parts.push(`Preferences: ${JSON.stringify(profile.preferences)}`);
  }

  return parts.join("\n");
}

async function createThread(req: CreateThreadRequest) {
  try {
    const thread = await openai.beta.threads.create();

    let responseMessage = "";

    if (req.initial_message) {
      const profileContext = formatHealthProfile(req.health_profile);
      const messageContent = profileContext
        ? `${profileContext}\n\nUser message: ${req.initial_message}`
        : req.initial_message;

      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: messageContent,
      });

      const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: ASSISTANT_IDS.HEALTH_COACH,
      });

      if (run.status === "completed") {
        const messages = await openai.beta.threads.messages.list(thread.id);
        const assistantMessage = messages.data.find((msg) => msg.role === "assistant");

        if (assistantMessage && assistantMessage.content[0].type === "text") {
          responseMessage = assistantMessage.content[0].text.value;
        }
      }
    }

    return {
      thread_id: thread.id,
      response: responseMessage ? {
        message: responseMessage,
        thread_id: thread.id,
        message_count: 1,
      } : undefined,
    };
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
}

async function sendMessage(req: SendMessageRequest) {
  try {
    const profileContext = formatHealthProfile(req.health_profile);
    const messageContent = profileContext
      ? `${profileContext}\n\nUser message: ${req.message}`
      : req.message;

    await openai.beta.threads.messages.create(req.thread_id, {
      role: "user",
      content: messageContent,
    });

    const run = await openai.beta.threads.runs.createAndPoll(req.thread_id, {
      assistant_id: ASSISTANT_IDS.HEALTH_COACH,
    });

    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(req.thread_id);
      const assistantMessage = messages.data.find((msg) => msg.role === "assistant");

      if (assistantMessage && assistantMessage.content[0].type === "text") {
        return {
          message: assistantMessage.content[0].text.value,
          thread_id: req.thread_id,
          message_count: messages.data.length,
        };
      }
    }

    throw new Error(`Run failed with status: ${run.status}`);
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

async function getMessages(req: GetMessagesRequest) {
  try {
    const messages = await openai.beta.threads.messages.list(req.thread_id);

    return messages.data.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content[0].type === "text" ? msg.content[0].text.value : "",
      created_at: msg.created_at,
    }));
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: RequestBody = await req.json();

    let result;

    switch (body.action) {
      case "create_thread":
        result = await createThread(body);
        break;
      case "send_message":
        result = await sendMessage(body);
        break;
      case "get_messages":
        result = await getMessages(body);
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in health-coach function:", error);
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
