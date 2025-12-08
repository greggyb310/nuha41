/*
  # Create conversations table

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users, conversation owner
      - `assistant_type` (text) - "health_coach" or "excursion_creator"
      - `thread_id` (text) - OpenAI thread ID for stateful conversations
      - `message_count` (integer, default 0) - Number of messages in thread
      - `last_message_at` (timestamptz) - Last interaction timestamp
      - `created_at` (timestamptz) - Thread creation timestamp

  2. Security
    - Enable RLS on `conversations` table
    - Add policy for users to view their own conversations
    - Add policy for users to insert their own conversations
    - Add policy for users to update their own conversations
    - No DELETE policy (preserve conversation history)

  3. Indexes
    - Index on `user_id` for user's conversation history
    - Index on `thread_id` for OpenAI thread retrieval
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assistant_type text NOT NULL,
  thread_id text NOT NULL,
  message_count integer DEFAULT 0 NOT NULL,
  last_message_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_thread_id ON conversations(thread_id);