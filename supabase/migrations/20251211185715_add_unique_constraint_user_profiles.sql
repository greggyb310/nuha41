/*
  # Add unique constraint to user_profiles.user_id
  
  1. Changes
    - Add UNIQUE constraint to `user_profiles.user_id` column
    - This ensures each user can only have one profile
    - Required for upsert operations to work correctly
  
  2. Data Safety
    - Uses IF NOT EXISTS pattern to avoid errors if constraint already exists
    - Removes any duplicate profiles before adding constraint (keeps newest)
*/

-- First, remove any duplicate profiles (keep only the most recent one per user)
DO $$
BEGIN
  DELETE FROM user_profiles
  WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM user_profiles
    ORDER BY user_id, updated_at DESC
  );
END $$;

-- Add unique constraint to user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_user_id_key'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;