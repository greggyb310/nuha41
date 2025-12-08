# OpenAI Assistant Configuration Guide

## Test Checkpoint 3 - Tool Call Verification

This guide explains how to configure your OpenAI Assistant with the required tool definitions for NatureUP Health.

## Overview

The NatureUP Health app uses OpenAI's Assistants API (NOT Chat Completions API) with function calling. The assistant must be configured to respond EXCLUSIVELY with tool calls, never with natural language.

## Required Tool Definitions

You need to configure your OpenAI Assistant with three tool definitions:

### 1. plan_excursion

Creates personalized nature therapy routes based on user preferences, location, and weather.

```json
{
  "type": "function",
  "function": {
    "name": "plan_excursion",
    "description": "Generate a personalized nature therapy excursion plan with waypoints, duration, and therapeutic benefits",
    "parameters": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the excursion plan"
        },
        "title": {
          "type": "string",
          "description": "Catchy, descriptive title for the excursion"
        },
        "summary": {
          "type": "string",
          "description": "Brief summary of the excursion and its therapeutic benefits"
        },
        "waypoints": {
          "type": "array",
          "description": "Ordered list of waypoints along the route",
          "items": {
            "type": "object",
            "properties": {
              "latitude": {
                "type": "number",
                "description": "Waypoint latitude coordinate"
              },
              "longitude": {
                "type": "number",
                "description": "Waypoint longitude coordinate"
              },
              "name": {
                "type": "string",
                "description": "Name of the waypoint location"
              },
              "description": {
                "type": "string",
                "description": "Description of what to do or observe at this waypoint"
              },
              "order": {
                "type": "integer",
                "description": "Sequential order of the waypoint (starting from 1)"
              }
            },
            "required": ["latitude", "longitude", "name", "description", "order"]
          }
        },
        "duration_minutes": {
          "type": "integer",
          "description": "Estimated duration of the excursion in minutes"
        },
        "distance_km": {
          "type": "number",
          "description": "Total distance of the route in kilometers"
        },
        "difficulty": {
          "type": "string",
          "enum": ["easy", "moderate", "challenging"],
          "description": "Physical difficulty level"
        },
        "terrain_type": {
          "type": "string",
          "description": "Type of terrain (forest, beach, mountain, park, urban)"
        },
        "therapeutic_benefits": {
          "type": "array",
          "description": "List of health and wellness benefits",
          "items": {
            "type": "string"
          }
        }
      },
      "required": [
        "id",
        "title",
        "summary",
        "waypoints",
        "duration_minutes",
        "distance_km",
        "difficulty",
        "terrain_type",
        "therapeutic_benefits"
      ]
    }
  }
}
```

### 2. coach_user

Provides wellness coaching, motivation, and personalized advice.

```json
{
  "type": "function",
  "function": {
    "name": "coach_user",
    "description": "Provide personalized wellness coaching, motivation, and advice to the user",
    "parameters": {
      "type": "object",
      "properties": {
        "spokenText": {
          "type": "string",
          "description": "The message to speak to the user (will be converted to audio)"
        },
        "intent": {
          "type": "string",
          "enum": ["motivate", "advise", "encourage", "educate", "celebrate"],
          "description": "The primary intent of the coaching message"
        },
        "exercises": {
          "type": "array",
          "description": "Optional breathing exercises, stretches, or mindfulness practices",
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "description": "Name of the exercise"
              },
              "description": {
                "type": "string",
                "description": "Step-by-step instructions"
              },
              "duration_minutes": {
                "type": "integer",
                "description": "How long the exercise takes"
              }
            },
            "required": ["name", "description"]
          }
        },
        "follow_up_suggestions": {
          "type": "array",
          "description": "Optional suggestions for next steps or related topics",
          "items": {
            "type": "string"
          }
        }
      },
      "required": ["spokenText", "intent"]
    }
  }
}
```

### 3. update_app_state

Controls navigation, UI hints, and data persistence in the app.

```json
{
  "type": "function",
  "function": {
    "name": "update_app_state",
    "description": "Update the app's UI state, navigation, or trigger data persistence",
    "parameters": {
      "type": "object",
      "properties": {
        "navigation": {
          "type": "object",
          "description": "Navigate to a different screen in the app",
          "properties": {
            "screen": {
              "type": "string",
              "description": "Screen name to navigate to (home, profile, excursion-detail, map-view)"
            },
            "params": {
              "type": "object",
              "description": "Parameters to pass to the screen",
              "additionalProperties": true
            }
          },
          "required": ["screen"]
        },
        "uiHints": {
          "type": "object",
          "description": "Visual hints or UI updates",
          "properties": {
            "highlight": {
              "type": "array",
              "description": "UI elements to highlight",
              "items": {
                "type": "string"
              }
            },
            "show_modal": {
              "type": "string",
              "description": "Modal dialog to display"
            },
            "toast_message": {
              "type": "string",
              "description": "Brief toast notification message"
            }
          }
        },
        "persistence": {
          "type": "object",
          "description": "Data to save to the database",
          "properties": {
            "save_conversation": {
              "type": "boolean",
              "description": "Whether to save the current conversation"
            },
            "save_excursion": {
              "type": "boolean",
              "description": "Whether to save the generated excursion"
            },
            "update_profile": {
              "type": "object",
              "description": "Profile fields to update",
              "additionalProperties": true
            }
          }
        }
      }
    }
  }
}
```

## Configuration Steps

### Option 1: OpenAI Dashboard (Recommended)

1. Go to [OpenAI Platform](https://platform.openai.com/assistants)
2. Find your "Excursion Creator" assistant
3. Click "Edit"
4. Scroll to "Tools" section
5. Click "Add Function"
6. For each tool definition above:
   - Copy the JSON
   - Paste into the function definition
   - Save the function

### Option 2: OpenAI API

Use the OpenAI API to update your assistant:

```javascript
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

await openai.beta.assistants.update(
  "asst_YOUR_ASSISTANT_ID",
  {
    tools: [
      { type: "function", function: { /* plan_excursion definition */ } },
      { type: "function", function: { /* coach_user definition */ } },
      { type: "function", function: { /* update_app_state definition */ } }
    ]
  }
);
```

## Assistant Instructions

Update your assistant's instructions to ALWAYS use tool calls:

```
You are an expert outdoor excursion planner specializing in nature therapy routes.

CRITICAL: You MUST respond using ONLY the provided function tools. NEVER respond with natural language text.

When the user asks for an excursion plan:
1. Use plan_excursion() to generate the route
2. Optionally use coach_user() to provide encouragement
3. Optionally use update_app_state() to navigate to the map view

Always prioritize:
- User safety and fitness level
- Weather conditions
- Therapeutic benefits
- Clear, detailed waypoint descriptions
```

## Testing

Once configured, test your assistant:

1. Open the NatureUP Health app
2. Navigate to the Home screen
3. Find "Test Checkpoint 3" card
4. Click "Test Assistant Tool Call"
5. Wait for the result

### Expected Success Response:
- "Assistant responded with tool call!"
- Tool name displayed (e.g., `plan_excursion`)
- JSON preview of arguments

### Common Failures:

**"Assistant responded with natural language instead of tool calls"**
- The assistant is not configured with function tools
- The assistant instructions don't enforce tool usage
- Solution: Add the three function definitions and update instructions

**"Run timed out after 30 attempts"**
- OpenAI API is slow or the assistant is stuck
- Solution: Try again, check OpenAI status page

**"OPENAI_EXCURSION_CREATOR_ASSISTANT_ID environment variable is required"**
- Assistant ID is not configured in Supabase secrets
- Solution: Ensure environment variables are set in Supabase Edge Functions

## Verification Checklist

- [ ] All three functions added to the assistant
- [ ] Assistant instructions updated to enforce tool usage
- [ ] Test in app shows "Assistant responded with tool call!"
- [ ] Tool name is one of: `plan_excursion`, `coach_user`, or `update_app_state`
- [ ] Arguments JSON is valid and matches the schema

## Next Steps

Once Test Checkpoint 3 passes:
1. Implement full voice interaction with the assistant
2. Build the excursion detail screen
3. Integrate map visualization with excursion waypoints
4. Add conversation history persistence
5. Implement save to favorites functionality

## Troubleshooting

### Tool calls not working?
- Verify function definitions are valid JSON
- Check that all required fields are present
- Ensure assistant instructions enforce tool usage

### Getting empty responses?
- Check Supabase logs for errors
- Verify OpenAI API key is configured
- Ensure assistant IDs are correct

### Need help?
- Review OpenAI's [Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- Check [Assistants API Documentation](https://platform.openai.com/docs/assistants/overview)
