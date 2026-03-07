-- Create the simulation-videos storage bucket for video file uploads
-- Run this migration in your Supabase SQL Editor or via CLI

-- 1. Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'simulation-videos',
  'simulation-videos',
  true,
  52428800,  -- 50MB file size limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/ogg', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Allow public read access to all files in the bucket
CREATE POLICY IF NOT EXISTS "Public read access for simulation videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'simulation-videos');

-- 3. Allow authenticated users to upload files
CREATE POLICY IF NOT EXISTS "Authenticated users can upload simulation videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'simulation-videos');

-- 4. Allow authenticated users to update their uploads
CREATE POLICY IF NOT EXISTS "Authenticated users can update simulation videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'simulation-videos')
WITH CHECK (bucket_id = 'simulation-videos');

-- 5. Allow authenticated users to delete files
CREATE POLICY IF NOT EXISTS "Authenticated users can delete simulation videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'simulation-videos');
