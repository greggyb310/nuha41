/*
  # Create Username Authentication System

  1. New Tables
    - `usernames`
      - `id` (uuid, primary key) - Unique identifier
      - `username` (text, unique, not null) - Username stored in lowercase for case-insensitive lookups
      - `user_id` (uuid, foreign key) - References auth.users
      - `created_at` (timestamptz) - Record creation timestamp

  2. Changes
    - Add `username` column to `user_profiles` table for easy access
    - Create unique index on lowercase username for fast, case-insensitive lookups

  3. Security
    - Enable RLS on `usernames` table
    - Add policy for users to read only their own username
    - Add policy for authenticated users to view their own username
    - Service role can bypass RLS for auth operations

  4. Indexes
    - Unique index on username (lowercase) for case-insensitive uniqueness
    - Index on user_id for reverse lookups
*/

-- Create usernames table
CREATE TABLE IF NOT EXISTS usernames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create unique index on lowercase username for case-insensitive uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_usernames_username_lower ON usernames(LOWER(username));

-- Create index on user_id for reverse lookups
CREATE INDEX IF NOT EXISTS idx_usernames_user_id ON usernames(user_id);

-- Enable RLS on usernames table
ALTER TABLE usernames ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own username
CREATE POLICY "Users can view own username"
  ON usernames
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add username column to user_profiles for convenience
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN username text;
  END IF;
END $$;

-- Create index on user_profiles.username
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
