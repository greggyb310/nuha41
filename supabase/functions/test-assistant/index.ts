import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { openai, ASSISTANT_IDS } from "../_shared/openai-client.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log("=== TEST ASSISTANT CHECKPOINT 3 STARTED ===");

    const thread = await openai.beta.threads.create();
    console.log("Thread created:", thread.id);

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: "I want to go on a nature walk near Golden Gate Park in San Francisco. Can you help me plan a relaxing excursion?",
    });
    console.log("Message added to thread");

    let run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_IDS.EXCURSION_CREATOR,
    });
    console.log("Run created:", run.id, "Status:", run.status);

    let attempts = 0;
    const maxAttempts = 30;

    while (run.status === "queued" || run.status === "in_progress") {
      if (attempts >= maxAttempts) {
        throw new Error("Run timed out after 30 attempts");
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log(`Poll attempt ${attempts + 1}: Status = ${run.status}`);
      attempts++;
    }

    console.log("Final run status:", run.status);

    if (run.status === "requires_action") {
      const toolCalls = run.required_action?.submit_tool_outputs?.tool_calls || [];

      console.log("=== TOOL CALLS DETECTED ===");
      console.log("Number of tool calls:", toolCalls.length);

      if (toolCalls.length > 0) {
        const firstToolCall = toolCalls[0];
        console.log("First tool call:", {
          id: firstToolCall.id,
          type: firstToolCall.type,
          function_name: firstToolCall.function.name,
          arguments: firstToolCall.function.arguments.substring(0, 200),
        });

        const parsedArgs = JSON.parse(firstToolCall.function.arguments);

        return new Response(
          JSON.stringify({
            success: true,
            hasToolCall: true,
            toolCall: {
              toolName: firstToolCall.function.name,
              arguments: parsedArgs,
            },
            rawResponse: {
              runId: run.id,
              runStatus: run.status,
              threadId: thread.id,
              toolCallsCount: toolCalls.length,
            },
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessages = messages.data.filter(
        (msg) => msg.role === "assistant"
      );

      console.log("=== RUN COMPLETED WITHOUT TOOL CALLS ===");
      console.log("Assistant responded with natural language");

      if (assistantMessages.length > 0) {
        const lastMessage = assistantMessages[0];
        const content = lastMessage.content[0];
        const text = content.type === "text" ? content.text.value : "";

        console.log("Assistant message:", text.substring(0, 200));

        return new Response(
          JSON.stringify({
            success: false,
            hasToolCall: false,
            error: "Assistant responded with natural language instead of tool calls",
            rawResponse: {
              runId: run.id,
              runStatus: run.status,
              threadId: thread.id,
              assistantMessage: text.substring(0, 500),
            },
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    console.log("=== UNEXPECTED RUN STATUS ===");
    return new Response(
      JSON.stringify({
        success: false,
        hasToolCall: false,
        error: `Unexpected run status: ${run.status}`,
        rawResponse: {
          runId: run.id,
          runStatus: run.status,
          threadId: thread.id,
        },
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
    console.error("=== ERROR IN TEST ASSISTANT ===");
    console.error(error);

    return new Response(
      JSON.stringify({
        success: false,
        hasToolCall: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});