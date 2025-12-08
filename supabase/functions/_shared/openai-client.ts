import OpenAI from "npm:openai@4.73.0";

const apiKey = Deno.env.get("OPENAI_API_KEY");

if (!apiKey) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

export const openai = new OpenAI({
  apiKey,
});

export const ASSISTANT_IDS = {
  HEALTH_COACH: Deno.env.get("OPENAI_HEALTH_COACH_ASSISTANT_ID") || "",
  EXCURSION_CREATOR: Deno.env.get("OPENAI_EXCURSION_CREATOR_ASSISTANT_ID") || "",
};

if (!ASSISTANT_IDS.HEALTH_COACH) {
  throw new Error("OPENAI_HEALTH_COACH_ASSISTANT_ID environment variable is required");
}

if (!ASSISTANT_IDS.EXCURSION_CREATOR) {
  throw new Error("OPENAI_EXCURSION_CREATOR_ASSISTANT_ID environment variable is required");
}