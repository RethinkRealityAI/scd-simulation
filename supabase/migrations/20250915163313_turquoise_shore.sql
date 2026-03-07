/*
  # Complete Simulation Videos Setup

  1. New Tables
    - `simulation_videos`
      - `id` (uuid, primary key)
      - `scene_id` (integer, unique, 1-10)
      - `title` (text)
      - `description` (text)
      - `video_url` (text)
      - `poster_url` (text, optional)
      - `audio_narration_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Storage
    - Create `simulation-videos` bucket with proper policies
    - Allow public read access for video playback
    - Allow authenticated upload/update/delete for admin

  3. Security
    - Enable RLS on `simulation_videos` table
    - Add policy for public read access
    - Add policy for authenticated users to manage videos
*/

-- Create the simulation_videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS simulation_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id integer UNIQUE NOT NULL CHECK (scene_id >= 1 AND scene_id <= 10),
  title text NOT NULL,
  description text NOT NULL,
  video_url text NOT NULL,
  poster_url text,
  audio_narration_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE simulation_videos ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public can read simulation videos" ON simulation_videos;
CREATE POLICY "Public can read simulation videos"
  ON simulation_videos
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage videos" ON simulation_videos;
CREATE POLICY "Authenticated users can manage videos"
  ON simulation_videos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_simulation_videos_updated_at ON simulation_videos;
CREATE TRIGGER update_simulation_videos_updated_at
  BEFORE UPDATE ON simulation_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket (this will be handled by the application)
-- The bucket creation is done in the useVideoData hook to handle conflicts properly