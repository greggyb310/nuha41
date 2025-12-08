# Testing Edge Functions

This guide explains how to test the Supabase Edge Functions before building for iPhone deployment.

## Prerequisites

Before testing, ensure all environment variables are configured in Supabase Dashboard:

### Required Secrets (Edge Functions)

Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets

- `OPENAI_API_KEY` - Your OpenAI API key
- `HEALTH_COACH_ASSISTANT_ID` - OpenAI Health Coach Assistant ID
- `EXCURSION_ENGINE_ASSISTANT_ID` - OpenAI Excursion Creator Assistant ID
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (NOT anon key)

### Client Environment Variables (.env)

Already configured in the project:

```
EXPO_PUBLIC_SUPABASE_URL=https://shdakxvwvnmhkofdjlxs.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## Testing Endpoints

### 1. Health Coach Endpoint

**Endpoint:** `POST {{SUPABASE_URL}}/functions/v1/health-coach`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{SUPABASE_ANON_KEY}}
```

**Request Body (Basic):**
```json
{
  "userId": "test-user-id",
  "message": "I'm feeling stressed and have 30 minutes. What can I do?"
}
```

**Request Body (With Context):**
```json
{
  "userId": "test-user-id",
  "message": "I'm feeling stressed and have 30 minutes. What can I do?",
  "threadId": null,
  "context": {
    "profile": {
      "full_name": "John Doe",
      "health_goals": ["reduce stress", "improve sleep"],
      "preferences": {
        "preferred_terrain": "forest",
        "difficulty": "easy"
      }
    },
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "address": "San Francisco, CA"
    },
    "weather": {
      "temperature": 18,
      "feels_like": 16,
      "humidity": 65,
      "description": "Partly cloudy",
      "wind_speed": 3.5,
      "conditions": "clear"
    }
  }
}
```

**Expected Response:**
```json
{
  "threadId": "thread_abc123...",
  "message": {
    "id": "msg_1234567890",
    "role": "assistant",
    "content": "I understand you're feeling stressed...",
    "created_at": 1234567890000
  },
  "excursions": null,
  "coachingSteps": null
}
```

**Response with Excursions:**
```json
{
  "threadId": "thread_abc123...",
  "message": {
    "id": "msg_1234567890",
    "role": "assistant",
    "content": "I've created three excursion options for you...",
    "created_at": 1234567890000
  },
  "excursions": [
    {
      "id": "exc_1",
      "title": "Forest Meditation Walk",
      "description": "A peaceful 30-minute walk through the forest...",
      "duration_minutes": 30,
      "distance_km": 2.5,
      "difficulty": "easy",
      "route_data": {
        "waypoints": [
          {
            "latitude": 37.7749,
            "longitude": -122.4194,
            "name": "Start Point",
            "description": "Begin at the forest entrance",
            "order": 1
          }
        ],
        "start_location": {
          "latitude": 37.7749,
          "longitude": -122.4194
        },
        "end_location": {
          "latitude": 37.7749,
          "longitude": -122.4194
        },
        "terrain_type": "forest"
      },
      "therapeutic_benefits": [
        "Reduces stress",
        "Improves mood"
      ]
    }
  ],
  "coachingSteps": null
}
```

### 2. Save Excursion Endpoint

**Endpoint:** `POST {{SUPABASE_URL}}/functions/v1/save-excursion`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{SUPABASE_ANON_KEY}}
```

**Request Body:**
```json
{
  "userId": "test-user-id",
  "excursionData": {
    "title": "Forest Meditation Walk",
    "description": "A peaceful 30-minute walk through the forest",
    "duration_minutes": 30,
    "distance_km": 2.5,
    "difficulty": "easy",
    "route_data": {
      "waypoints": [
        {
          "latitude": 37.7749,
          "longitude": -122.4194,
          "name": "Start Point",
          "description": "Begin at the forest entrance",
          "order": 1
        },
        {
          "latitude": 37.7750,
          "longitude": -122.4195,
          "name": "Meditation Spot",
          "description": "Stop here for 5 minutes of mindful breathing",
          "order": 2
        }
      ],
      "start_location": {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "address": "Forest Entrance"
      },
      "end_location": {
        "latitude": 37.7750,
        "longitude": -122.4195,
        "address": "Meditation Spot"
      },
      "terrain_type": "forest",
      "elevation_gain": 50
    }
  }
}
```

**Expected Response:**
```json
{
  "excursionId": "550e8400-e29b-41d4-a716-446655440000",
  "success": true
}
```

## Testing with cURL

### Health Coach
```bash
curl -X POST https://shdakxvwvnmhkofdjlxs.supabase.co/functions/v1/health-coach \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "userId": "test-user-id",
    "message": "I need help reducing stress"
  }'
```

### Save Excursion
```bash
curl -X POST https://shdakxvwvnmhkofdjlxs.supabase.co/functions/v1/save-excursion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "userId": "test-user-id",
    "excursionData": {
      "title": "Test Walk",
      "description": "Test description",
      "duration_minutes": 30,
      "distance_km": 2.0,
      "difficulty": "easy",
      "route_data": {
        "waypoints": [],
        "start_location": {"latitude": 0, "longitude": 0},
        "end_location": {"latitude": 0, "longitude": 0}
      }
    }
  }'
```

## Testing with Thunder Client (VS Code)

1. Install Thunder Client extension in VS Code
2. Create a new request
3. Set method to POST
4. Enter the endpoint URL
5. Add headers (Content-Type and Authorization)
6. Paste the request body
7. Click "Send"

## Common Errors and Solutions

### Error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"

**Cause:** Environment variables not configured in Supabase Dashboard

**Solution:**
1. Go to Supabase Dashboard → Your Project
2. Navigate to Project Settings → Edge Functions → Secrets
3. Add the missing environment variables
4. Redeploy the edge function

### Error: "OPENAI_API_KEY environment variable is required"

**Cause:** OpenAI API key not configured

**Solution:**
1. Get your OpenAI API key from https://platform.openai.com/api-keys
2. Add it to Supabase Edge Functions secrets as `OPENAI_API_KEY`

### Error: "userId and message are required"

**Cause:** Missing required fields in request body

**Solution:** Ensure your request includes both `userId` and `message` fields

### Error: "Run failed with status: failed"

**Cause:** OpenAI Assistant encountered an error or timeout

**Solution:**
1. Check OpenAI Platform status: https://status.openai.com
2. Verify your Assistant IDs are correct
3. Check Supabase function logs for detailed error messages

### Error: "Failed to save excursion"

**Cause:** Database RLS policy preventing insert or missing required fields

**Solution:**
1. Verify RLS policies are configured correctly on `excursions` table
2. Ensure all required fields are present in `excursionData`
3. Check Supabase logs for detailed database error

## Verification Checklist

Before building for iPhone:

- [ ] All Supabase secrets are configured
- [ ] Health coach endpoint responds successfully
- [ ] Save excursion endpoint persists to database
- [ ] Conversation records are saved to `conversations` table
- [ ] User profile enrichment works correctly
- [ ] Error responses are properly formatted
- [ ] CORS headers are present in all responses

## Next Steps

Once all edge functions are tested and working:

1. Run `npm run build` to verify TypeScript compilation
2. Test the coach screen in Bolt.new web preview
3. Push to GitHub
4. Test on iPhone via launch.expo.dev
5. If everything works, proceed with EAS build for TestFlight

## Useful Commands

View function logs in Supabase Dashboard:
1. Go to Edge Functions → Select function → Logs tab
2. Filter by time range and error level

Deploy edge functions:
```bash
supabase functions deploy health-coach
supabase functions deploy save-excursion
```

Note: Deployment is handled automatically by Bolt.new, but you can also deploy manually if needed.
