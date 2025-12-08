/*
  # Create excursions table

  1. New Tables
    - `excursions`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users, route owner
      - `title` (text) - Excursion name
      - `description` (text, nullable) - Detailed description of route and benefits
      - `route_data` (jsonb) - GeoJSON or structured waypoint data
      - `duration_minutes` (integer, nullable) - Expected duration
      - `distance_km` (numeric, nullable) - Total distance
      - `difficulty` (text, nullable) - "easy", "moderate", or "challenging"
      - `created_at` (timestamptz) - When route was generated
      - `completed_at` (timestamptz, nullable) - When user completed the excursion

  2. Security
    - Enable RLS on `excursions` table
    - Add policy for users to view their own excursions
    - Add policy for users to insert their own excursions
    - Add policy for users to update their own excursions
    - Add policy for users to delete their own excursions

  3. Indexes
    - Index on `user_id` for user's excursion list
*/

CREATE TABLE IF NOT EXISTS excursions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  route_data jsonb NOT NULL,
  duration_minutes integer,
  distance_km numeric,
  difficulty text,
  created_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz
);

ALTER TABLE excursions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own excursions"
  ON excursions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own excursions"
  ON excursions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own excursions"
  ON excursions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own excursions"
  ON excursions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_excursions_user_id ON excursions(user_id);