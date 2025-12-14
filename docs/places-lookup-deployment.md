# Places Lookup Edge Function - Deployment Guide

## Overview

The `places-lookup` edge function uses Google Maps Places API to find nearby nature spots (parks, trails, natural features) based on user location.

## Prerequisites

1. **Google Maps API Key** - Already added to Supabase secrets
2. **Enabled APIs** in Google Cloud Console:
   - Places API (New)
   - Maps JavaScript API

## Step 1: Add API Key to Bolt Database

The function needs the Google Maps API key in Bolt Database secrets:

1. Go to Bolt Database → Settings → Secrets
2. Add new secret:
   - Name: `GOOGLE_MAPS_API_KEY`
   - Value: (same key from Supabase secrets)

## Step 2: Deploy the Function

1. Go to Bolt Database → Edge Functions
2. Create new function:
   - Name: `places-lookup`
   - Source: `supabase/functions/places-lookup`
   - Branch: `main`
3. Click **Deploy**

## Step 3: Test the Function

### Using Thunder Client (or Postman)

**Endpoint:**
```
POST https://your-bolt-database.supabase.co/functions/v1/places-lookup
```

**Headers:**
```
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
Content-Type: application/json
```

**Body (Prescott, AZ test):**
```json
{
  "latitude": 34.5400,
  "longitude": -112.4685,
  "radius": 10000
}
```

### Using the Test Script

```bash
cd project
npx tsx services/test-places-api.ts
```

### Expected Response

```json
{
  "status": "OK",
  "places": [
    {
      "place_id": "ChIJ...",
      "name": "Prescott National Forest",
      "types": ["park", "point_of_interest"],
      "vicinity": "Prescott, AZ",
      "rating": 4.8,
      "user_ratings_total": 1234,
      "geometry": {
        "location": {
          "lat": 34.5400,
          "lng": -112.4685
        }
      },
      "photos": [...]
    },
    ...
  ]
}
```

## Expected Places in Prescott, AZ

The function should return nature spots like:
- Prescott National Forest
- Watson Lake Park
- Willow Lake Park
- Granite Mountain Wilderness
- Thumb Butte Trail
- Lynx Lake Recreation Area
- Goldwater Lake
- Heritage Park Zoological Sanctuary

## API Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `latitude` | number | Yes | - | Latitude (-90 to 90) |
| `longitude` | number | Yes | - | Longitude (-180 to 180) |
| `radius` | number | No | 5000 | Search radius in meters (100-50000) |

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | "OK" or "ZERO_RESULTS" |
| `places` | array | Array of place objects (max 10) |
| `places[].place_id` | string | Unique Google Places ID |
| `places[].name` | string | Place name |
| `places[].types` | array | Place types (e.g., ["park"]) |
| `places[].rating` | number | Average rating (1-5) |
| `places[].geometry.location` | object | Lat/lng coordinates |

## Nature Types Filtered

The function filters for these Google Place types:
- `park`
- `natural_feature`
- `tourist_attraction` (when combined with nature types)
- `point_of_interest` (when combined with nature types)

## Error Handling

The function validates:
- Latitude/longitude are valid numbers in correct range
- Radius is between 100-50000 meters
- Google API responses are successful

## Troubleshooting

### "GOOGLE_MAPS_API_KEY environment variable is required"
- API key not set in Bolt Database secrets

### "REQUEST_DENIED"
- Google Places API not enabled in Google Cloud Console
- API key restrictions may be blocking the request

### "ZERO_RESULTS"
- No nature spots found in the radius
- Try increasing the `radius` parameter

## Next Steps

Once this function is deployed and tested:
1. Integrate into the React Native app via `services/places-api.ts`
2. Use the `Place` types from `types/places.ts`
3. Display places on the map using `react-native-maps`
4. Allow users to select places for excursion planning

## Cost Considerations

Google Places API pricing (as of 2024):
- Nearby Search: $32 per 1000 requests
- Place Photos: $7 per 1000 requests

Consider caching results and implementing rate limiting for production.
