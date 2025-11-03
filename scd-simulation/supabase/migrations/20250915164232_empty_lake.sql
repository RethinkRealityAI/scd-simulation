/*
  # Fix RLS policies for simulation videos

  1. Security Changes
    - Drop existing restrictive RLS policies
    - Create public access policies for simulation videos
    - Allow unrestricted read/write access since no sensitive data

  2. Tables affected
    - `simulation_videos` - main video metadata table

  3. Policies created
    - Public read access for all users
    - Public write access for all users (insert, update, delete)
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Authenticated users can manage videos" ON simulation_videos;
DROP POLICY IF EXISTS "Public can read simulation videos" ON simulation_videos;

-- Create new public policies for unrestricted access
CREATE POLICY "Public can read all simulation videos"
  ON simulation_videos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert simulation videos"
  ON simulation_videos
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update simulation videos"
  ON simulation_videos
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete simulation videos"
  ON simulation_videos
  FOR DELETE
  TO public
  USING (true);

-- Ensure RLS is enabled but with permissive policies
ALTER TABLE simulation_videos ENABLE ROW LEVEL SECURITY;