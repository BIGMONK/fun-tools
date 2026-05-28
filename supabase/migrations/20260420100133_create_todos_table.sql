/*
  # Create Todos Table

  ## Summary
  Creates the core todos table for the fun tool website's task management feature.

  ## New Tables
  - `todos`
    - `id` (uuid, primary key) - unique identifier
    - `text` (text, not null) - the todo item content
    - `completed` (boolean, default false) - completion status
    - `created_at` (timestamptz) - creation timestamp
    - `completed_at` (timestamptz) - timestamp when task was completed

  ## Security
  - RLS enabled on todos table
  - Public insert policy: anyone can create todos
  - Public select policy: anyone can view todos
  - Public update policy: anyone can update todos
  - Public delete policy: anyone can delete todos

  ## Notes
  This is a public tool with no authentication requirement, so policies allow open access
  while still using RLS for structural consistency.
*/

CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view todos"
  ON todos FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert todos"
  ON todos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update todos"
  ON todos FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete todos"
  ON todos FOR DELETE
  USING (true);
