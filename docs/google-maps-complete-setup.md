# Complete Google Maps Setup Guide for NatureUP Health

This guide walks you through the complete setup process to integrate Google Maps into your iOS app.

---

## PHASE 1: Google Cloud Platform Configuration

### Step 1: Sign In to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account (or create one if needed)
3. If this is your first time, you may need to accept the Terms of Service

### Step 2: Create or Select a Project

1. Click the project dropdown at the top of the page (next to "Google Cloud")
2. Click **"NEW PROJECT"**
3. Enter a project name: `NatureUP Health` (or your preferred name)
4. Click **"CREATE"**
5. Wait for the project to be created, then select it from the project dropdown

### Step 3: Enable Billing (REQUIRED)

**CRITICAL**: Google Maps will NOT work without billing enabled. Even though you get free tier usage, a billing account is required.

1. Click the hamburger menu (three lines) in the top-left
2. Navigate to **Billing**
3. Click **"LINK A BILLING ACCOUNT"** or **"CREATE BILLING ACCOUNT"**
4. Follow the prompts to add a credit card
5. Verify your billing account is active

**Free Tier Details:**
- $200 free credit every month for Google Maps Platform
- More than enough for development and moderate production use
- You won't be charged unless you exceed the free tier

### Step 4: Enable Required APIs

You need to enable three APIs. For each API:

1. Click the hamburger menu → **APIs & Services** → **Library**
2. Search for the API name
3. Click on it
4. Click **"ENABLE"**
5. Wait for it to enable (takes a few seconds)

**Enable these three APIs:**

**a) Maps SDK for iOS**
- Allows your iOS app to display Google Maps
- Required for map tiles to load

**b) Places API**
- Allows searching for locations (e.g., "parks near me")
- Returns place details, photos, ratings, etc.

**c) Directions API**
- Calculates routes between waypoints
- Returns turn-by-turn directions and polylines

### Step 5: Create an API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"API key"**
4. Your API key will be created and displayed
5. **Copy the key immediately** - you'll need it in the next steps

**IMPORTANT**: Don't close this window yet! You need to restrict the key next.

### Step 6: Restrict the API Key (Security)

**Why?** Unrestricted keys can be stolen and abused, leading to massive bills.

1. After creating the key, a dialog appears. Click **"EDIT API KEY"** (or click the pencil icon next to your key)
2. Under **"Application restrictions"**:
   - Select **"iOS apps"**
   - Click **"+ ADD AN ITEM"**
   - Enter bundle ID: `com.natureup.health41`
   - Click **"DONE"**

3. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check these three APIs:
     - Maps SDK for iOS
     - Places API
     - Directions API
   - Click **"SAVE"**

**Note**: It can take up to 5 minutes for restrictions to propagate.

### Step 7: Save Your API Key

Copy your API key to a secure location. You'll need it for the next phase.

Your API key will look like: `AIzaSyD1234567890abcdefGHIJKLmnopqrs`

---

## PHASE 2: Configure EAS Secret

Now you'll store your API key securely in EAS (Expo Application Services) so it's available during builds.

### Prerequisites

1. You must have the Expo CLI installed globally
2. You must be logged in to your Expo account

If you haven't done this yet:

```bash
npm install -g eas-cli
eas login
```

### Create the EAS Secret

Run this command in your project directory (replace with your actual key):

```bash
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value AIzaSyD1234567890abcdefGHIJKLmnopqrs
```

**What this does:**
- Creates a secret named `GOOGLE_MAPS_API_KEY`
- Stores it securely on EAS servers
- Makes it available during builds
- The `eas.json` file already references this secret

### Verify the Secret Was Created

```bash
eas secret:list
```

You should see:

```
✔ GOOGLE_MAPS_API_KEY (project)
```

### Update Your Local .env File (Optional)

For local reference, update `.env`:

```env
GOOGLE_MAPS_API_KEY=AIzaSyD1234567890abcdefGHIJKLmnopqrs
```

**Note**: This is only for local reference. The actual build uses the EAS secret.

---

## PHASE 3: Build Your First EAS Development Client

A development client is like a custom version of Expo Go that includes native code (Google Maps SDK).

### Step 1: Trigger the Development Build

Run this command:

```bash
eas build --platform ios --profile development
```

**What happens:**
1. EAS packages your code
2. Injects the Google Maps API key from the EAS secret
3. Compiles native iOS code with Google Maps SDK
4. Builds the development client (10-20 minutes)
5. Gives you a download link

### Step 2: Monitor the Build

The command will show you a URL like:

```
https://expo.dev/accounts/natureuphealth/projects/natureup-health/builds/abc123
```

Open this URL in your browser to:
- Watch build progress in real-time
- See build logs if something fails
- Access the download link when complete

### Step 3: Install on Your iPhone

When the build completes:

1. Open the build URL on your iPhone (or scan the QR code)
2. Tap **"Install"** or **"Add to Home Screen"**
3. iOS will download and install the development client
4. The app icon will appear on your home screen

**Note**: You may need to trust the developer certificate:
- Go to Settings → General → VPN & Device Management
- Tap your developer profile
- Tap "Trust"

### Step 4: Launch the Development Client

1. Open the NatureUP Health app on your iPhone
2. You'll see the Expo development client interface
3. It will automatically connect to your Expo project

---

## BUILD CHECKPOINT #1: Verify Google Maps Works

### Test the Map Component

1. In the development client, navigate to the map test screen
2. The app will request location permission - tap **"Allow While Using App"**

### What to Verify

**SUCCESS INDICATORS:**
- ✅ Google Maps tiles load (not Apple Maps)
- ✅ Google logo appears in bottom-left corner
- ✅ Your location shows as a blue dot
- ✅ Test markers render correctly
- ✅ Zoom, pan, and rotate gestures work smoothly
- ✅ No "Development Mode" watermark (that's Apple Maps)

**FAILURE INDICATORS:**
- ❌ Map shows "For development purposes only" watermark = API key issue
- ❌ Map tiles don't load = billing not enabled
- ❌ Blank gray map = configuration error
- ❌ App crashes when opening map = native module issue

### Common Issues and Solutions

#### Issue: "For development purposes only" watermark

**Cause**: API key restrictions haven't propagated yet, or wrong bundle ID

**Solutions**:
1. Wait 5 minutes for restrictions to propagate
2. Verify bundle ID in Google Cloud Console matches `com.natureup.health41`
3. Temporarily remove restrictions to test (not recommended for production)

#### Issue: Blank gray map, no tiles load

**Cause**: Billing not enabled on Google Cloud project

**Solutions**:
1. Go to Google Cloud Console → Billing
2. Verify billing account is linked and active
3. Check that you have available credit or valid payment method

#### Issue: Map doesn't load at all

**Cause**: API key not injected correctly

**Solutions**:
1. Verify EAS secret exists: `eas secret:list`
2. Check eas.json references the correct secret name
3. Rebuild with: `eas build --platform ios --profile development --clear-cache`

#### Issue: Can't see my location (no blue dot)

**Cause**: Location permissions not granted

**Solutions**:
1. Go to iPhone Settings → NatureUP Health → Location
2. Select "While Using the App"
3. Restart the app

---

## Next Steps

Once Google Maps tiles load successfully:

1. **Phase 2**: Add Place Search functionality (search for parks, trails, etc.)
2. **Phase 3**: Add Directions API (draw routes between waypoints)
3. **Phase 4**: Integrate everything into the excursion workflow

---

## Troubleshooting Commands

### Check EAS secrets
```bash
eas secret:list
```

### Delete a secret (if you need to recreate it)
```bash
eas secret:delete --name GOOGLE_MAPS_API_KEY
```

### View build logs
```bash
eas build:view --id <build-id>
```

### Clear build cache and rebuild
```bash
eas build --platform ios --profile development --clear-cache
```

---

## Important Notes

- **Development Client vs Expo Go**: You MUST use the development client. Expo Go cannot load Google Maps native modules.
- **Build Time**: First builds take 15-25 minutes. Subsequent builds are faster (5-10 minutes).
- **API Usage**: During development, you're well within the free tier. Monitor usage in Google Cloud Console.
- **Key Security**: NEVER commit API keys to GitHub. Always use EAS secrets for builds.

---

## Support Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [react-native-maps GitHub](https://github.com/react-native-maps/react-native-maps)

---

Ready to proceed? Once you've completed these steps and verified Google Maps loads, we can move on to implementing Place Search and Directions!
