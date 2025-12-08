/*
  # Create favorite_excursions table

  1. New Tables
    - `favorite_excursions`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users, user who favorited
      - `excursion_id` (uuid, foreign key) - References excursions, favorited excursion
      - `created_at` (timestamptz) - When favorited

  2. Constraints
    - Unique constraint on (user_id, excursion_id) to prevent duplicate favorites

  3. Security
    - Enable RLS on `favorite_excursions` table
    - Add policy for users to view their own favorites
    - Add policy for users to insert their own favorites
    - Add policy for users to delete their own favorites

  4. Indexes
    - Index on `user_id` for user's favorites
    - Index on `excursion_id` for excursion popularity
*/

CREATE TABLE IF NOT EXISTS favorite_excursions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  excursion_id uuid REFERENCES excursions(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, excursion_id)
);

ALTER TABLE favorite_excursions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorite_excursions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorite_excursions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorite_excursions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_favorite_excursions_user_id ON favorite_excursions(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_excursions_excursion_id ON favorite_excursions(excursion_id);