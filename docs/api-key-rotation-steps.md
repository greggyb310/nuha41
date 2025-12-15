# API Key Rotation - Next Steps

## ⚠️ IMMEDIATE ACTION REQUIRED

Your Google Maps API key was exposed in Git history. All code changes have been completed. Follow these steps to complete the security fix.

---

## Step 1: Rotate the API Key (Do This First)

### In Google Cloud Console

1. Go to [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **"+ CREATE CREDENTIALS"** → **"API Key"**
3. **Copy the new API key** (you'll need it for Step 2)
4. Click **"Restrict Key"** and configure:
   - **Application restrictions**: Select "iOS apps"
   - **Add bundle identifier**: `com.natureup.health4`
   - **API restrictions**: Select "Restrict key" and enable:
     - Maps SDK for iOS
     - Maps SDK for Android
     - Places API
5. Click **"Save"**
6. **Delete the old exposed key**: `AIzaSyAT0dGMcg_4xhG3s-GJXdXxvclN-anRLj4`

---

## Step 2: Update EAS Secret

Run this command (replace `YOUR_NEW_KEY` with the key from Step 1):

```bash
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value YOUR_NEW_KEY --type string
```

Verify it was created:

```bash
eas secret:list
```

---

## Step 3: Update Bolt Database Secret

1. Go to **Bolt Database** → **Edge Functions** → **Secrets**
2. Find the secret named `GOOGLE_MAPS_API_KEY`
3. Update it with your new API key from Step 1
4. Save the changes

This is required for the `places-lookup` edge function to work.

---

## Step 4: (Optional) Update Local Development

If you want to test locally in Expo Go:

1. Edit `.env` file
2. Replace the placeholder with your new API key:
   ```
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_NEW_KEY
   ```

**Note**: This is optional and only for local development. EAS builds use secrets.

---

## Step 5: Test the Changes

### Test EAS Build

```bash
eas build --profile preview --platform ios
```

Once the build completes, install it on your iPhone and verify:
- Maps display correctly
- Location services work
- No API key errors

### Test Edge Function

The `places-lookup` edge function should now use the new API key from Bolt Database secrets. Test it by searching for nearby places in the app.

---

## What Was Changed

All these changes have been completed:

✅ `.env` - Removed exposed API key, added placeholder
✅ `app.json` - Changed to use `$GOOGLE_MAPS_API_KEY` from EAS Secrets
✅ `.env.example` - Created template for new developers
✅ `eas.json` - Added environment configuration for all build profiles
✅ `supabase/functions/get-maps-key/` - Deleted insecure edge function
✅ `docs/google-maps-setup.md` - Updated with secure EAS Secrets approach

---

## Security Status

**Before (Exposed)**:
- API key hardcoded in `.env` → ❌ Exposed in Git
- API key hardcoded in `app.json` → ❌ Exposed in Git
- `get-maps-key` edge function → ❌ Exposed key to clients

**After (Secure)**:
- `.env` uses placeholder → ✅ Safe (not in Git)
- `app.json` uses `$GOOGLE_MAPS_API_KEY` → ✅ Safe
- EAS Secrets store the real key → ✅ Encrypted
- Bolt Database secrets for edge functions → ✅ Secure
- Old exposed key will be deleted → ✅ Invalidated

---

## Important Notes

1. **The old API key is still active** until you delete it in Step 1
2. **Git history still contains the old key** - this is why rotation is critical
3. **EAS Secrets are encrypted** and only accessible during build time
4. **Bolt Database secrets** are separate from EAS Secrets (both need updating)

---

## Troubleshooting

### "API key not found" error during build

Make sure you created the EAS Secret with the exact name: `GOOGLE_MAPS_API_KEY`

### Maps not loading in the app

Check that:
1. The new API key has the correct restrictions (bundle ID, APIs)
2. Billing is enabled in Google Cloud Console
3. Maps SDK for iOS is enabled

### Edge function errors

Verify that:
1. Bolt Database secret `GOOGLE_MAPS_API_KEY` is updated
2. The `places-lookup` function is redeployed if needed

---

## Questions?

Refer to the updated documentation:
- `docs/google-maps-setup.md` - Complete Google Maps setup guide
- `docs/places-api-usage.md` - How the Places API integration works

---

**Security is complete once all steps are done!**
