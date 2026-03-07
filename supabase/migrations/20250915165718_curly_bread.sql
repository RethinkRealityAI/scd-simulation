/*
  # Fix RLS Policies for Video Uploads

  This migration completely resolves RLS policy violations by:
  1. Dropping all existing restrictive policies
  2. Creating permissive public policies for all operations
  3. Ensuring storage bucket policies allow public access
  4. Fixing any schema misalignments

  ## Changes Made
  - Remove all authentication-based restrictions
  - Allow public read/write access to simulation_videos table
  - Ensure storage bucket has proper public policies
  - Fix any column constraints that might cause issues
*/

-- First, ensure we're working with the correct table
-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Public can read all simulation videos" ON simulation_videos;
DROP POLICY IF EXISTS "Public can insert simulation videos" ON simulation_videos;
DROP POLICY IF EXISTS "Public can update simulation videos" ON simulation_videos;
DROP POLICY IF EXISTS "Public can delete simulation videos" ON simulation_videos;

-- Ensure RLS is enabled (required for policies to work)
ALTER TABLE simulation_videos ENABLE ROW LEVEL SECURITY;

-- Create completely permissive policies for all operations
CREATE POLICY "Allow all reads on simulation_videos"
  ON simulation_videos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow all inserts on simulation_videos"
  ON simulation_videos
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow all updates on simulation_videos"
  ON simulation_videos
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all deletes on simulation_videos"
  ON simulation_videos
  FOR DELETE
  TO public
  USING (true);

-- Ensure the storage bucket exists and has proper policies
-- Note: This might fail if bucket already exists, which is fine
DO $$
BEGIN
  -- Try to create the bucket, ignore if it already exists
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('simulation-videos', 'simulation-videos', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
EXCEPTION
  WHEN OTHERS THEN
    -- Bucket might already exist, just ensure it's public
    UPDATE storage.buckets 
    SET public = true 
    WHERE id = 'simulation-videos';
END $$;

-- Create storage policies for the bucket
-- Drop existing storage policies first
DROP POLICY IF EXISTS "Public can view simulation videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload simulation videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can update simulation videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete simulation videos" ON storage.objects;

-- Create permissive storage policies
CREATE POLICY "Allow public read access to simulation videos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'simulation-videos');

CREATE POLICY "Allow public upload to simulation videos"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'simulation-videos');

CREATE POLICY "Allow public update of simulation videos"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'simulation-videos')
  WITH CHECK (bucket_id = 'simulation-videos');

CREATE POLICY "Allow public delete of simulation videos"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'simulation-videos');

-- Ensure the table structure is correct and constraints won't cause issues
-- Make sure scene_id constraint allows all values 1-10
ALTER TABLE simulation_videos 
DROP CONSTRAINT IF EXISTS simulation_videos_scene_id_check;

ALTER TABLE simulation_videos 
ADD CONSTRAINT simulation_videos_scene_id_check 
CHECK (scene_id >= 1 AND scene_id <= 10);

-- Ensure all columns have appropriate defaults where needed
ALTER TABLE simulation_videos 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE simulation_videos 
ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE simulation_videos 
ALTER COLUMN updated_at SET DEFAULT now();