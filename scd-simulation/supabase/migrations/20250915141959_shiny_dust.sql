/*
  # Create simulation videos table

  1. New Tables
    - `simulation_videos`
      - `id` (uuid, primary key)
      - `scene_id` (integer, scene number 1-10)
      - `title` (text, scene title)
      - `description` (text, scene description)
      - `video_url` (text, URL to video file)
      - `poster_url` (text, optional poster image URL)
      - `audio_narration_url` (text, optional audio narration URL)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `simulation_videos` table
    - Add policy for public read access (videos are educational content)
    - Add policy for authenticated users to manage videos
*/

CREATE TABLE IF NOT EXISTS simulation_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id integer NOT NULL UNIQUE CHECK (scene_id >= 1 AND scene_id <= 10),
  title text NOT NULL,
  description text NOT NULL,
  video_url text NOT NULL,
  poster_url text,
  audio_narration_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE simulation_videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to videos (educational content)
CREATE POLICY "Public can read simulation videos"
  ON simulation_videos
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to manage videos
CREATE POLICY "Authenticated users can manage videos"
  ON simulation_videos
  FOR ALL
  TO authenticated
  USING (true);

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('simulation-videos', 'simulation-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to video files
CREATE POLICY "Public can view video files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'simulation-videos');

-- Allow authenticated users to upload video files
CREATE POLICY "Authenticated users can upload videos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'simulation-videos');

-- Allow authenticated users to update video files
CREATE POLICY "Authenticated users can update videos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'simulation-videos');

-- Allow authenticated users to delete video files
CREATE POLICY "Authenticated users can delete videos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'simulation-videos');