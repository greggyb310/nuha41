import { PlacesRequest, PlacesResponse, Place } from '../types/places';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

async function testPlacesLookup() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing environment variables");
    return;
  }

  const apiUrl = `${SUPABASE_URL}/functions/v1/places-lookup`;

  const testLocation: PlacesRequest = {
    latitude: 34.5400,
    longitude: -112.4685,
    radius: 10000,
  };

  console.log("Testing Places Lookup with Prescott, AZ coordinates:");
  console.log("Location:", testLocation);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testLocation),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      return;
    }

    const data = await response.json() as PlacesResponse;
    console.log("\n=== Places Found ===");
    console.log(`Status: ${data.status}`);
    console.log(`Count: ${data.places?.length || 0}`);

    if (data.places && data.places.length > 0) {
      console.log("\nPlaces:");
      data.places.forEach((place: Place, index: number) => {
        console.log(`\n${index + 1}. ${place.name}`);
        console.log(`   Type: ${place.kind}`);
        console.log(`   Location: ${place.latitude}, ${place.longitude}`);
        console.log(`   Distance: ${place.distance_m}m (${(place.distance_m / 1000).toFixed(2)}km)`);
        console.log(`   ID: ${place.id}`);
      });
    } else {
      console.log("No places found");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testPlacesLookup();
