# NatureUP Health

A voice-first mobile health app focused on personalized outdoor excursions and nature therapy.

## Tech Stack

- Expo SDK 54
- React Native 0.81.5
- React 19.1.0
- expo-router v4
- react-native-safe-area-context ~5.6.0
- react-native-screens ~4.16.0
- Supabase (Auth + Database)
- OpenAI Assistants API
- TypeScript

## Development Workflow

1. **Development**: Code in Bolt.new → Auto-push to GitHub
2. **Preview**: Go to [launch.expo.dev](https://launch.expo.dev) → Paste repo URL → Scan QR code
3. **Production**: `eas build --platform ios --profile preview`

## Setup

1. Update `.env` with your Supabase credentials
2. Update `eas.json` with your Apple Developer credentials
3. Run `npm install`
4. Run `npm start` (or preview via launch.expo.dev)

## Important Notes

**React 19.1.0 Compatibility:**
This project uses React 19.1.0 (required by Expo SDK 54 + React Native 0.81). The `package.json` includes critical `overrides` to force ALL dependencies to use React 19.1.0, preventing "Multiple copies of react" runtime errors. DO NOT remove these overrides.

## Project Structure

- `/app` - expo-router screens
- `/components` - Reusable UI components
- `/services` - API clients (Supabase, OpenAI)
- `/types` - TypeScript interfaces
- `/hooks` - Custom React hooks
- `/constants` - Theme, colors, config

## Bundle Identifier

`com.natureup.health4`
