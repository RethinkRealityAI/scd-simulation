/*
# Audio Management System for Simulation Scenes

1. New Tables
   - `scene_audio_files` - Stores audio files with character associations
   - `scene_characters` - Stores character information and avatar images

2. Security
   - Enable RLS on both new tables
   - Add policies for public access (matching existing video table pattern)

3. Storage
   - Create storage buckets for audio files and character avatars
   - Set up public access policies for both buckets
*/

-- Create scene_characters table for character information
CREATE TABLE IF NOT EXISTS scene_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id integer NOT NULL,
  character_name text NOT NULL,
  character_role text,
  avatar_url text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT scene_characters_scene_id_check CHECK (((scene_id >= 1) AND (scene_id <= 10)))
);

-- Create scene_audio_files table for audio management
CREATE TABLE IF NOT EXISTS scene_audio_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id integer NOT NULL,
  character_id uuid REFERENCES scene_characters(id) ON DELETE CASCADE,
  audio_title text NOT NULL,
  audio_description text,
  audio_url text NOT NULL,
  duration_seconds integer,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT scene_audio_files_scene_id_check CHECK (((scene_id >= 1) AND (scene_id <= 10)))
);

-- Enable RLS on new tables
ALTER TABLE scene_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_audio_files ENABLE ROW LEVEL SECURITY;

-- Create policies for scene_characters (public access)
CREATE POLICY "Allow all reads on scene_characters"
  ON scene_characters
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow all inserts on scene_characters"
  ON scene_characters
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow all updates on scene_characters"
  ON scene_characters
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all deletes on scene_characters"
  ON scene_characters
  FOR DELETE
  TO public
  USING (true);

-- Create policies for scene_audio_files (public access)
CREATE POLICY "Allow all reads on scene_audio_files"
  ON scene_audio_files
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow all inserts on scene_audio_files"
  ON scene_audio_files
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow all updates on scene_audio_files"
  ON scene_audio_files
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all deletes on scene_audio_files"
  ON scene_audio_files
  FOR DELETE
  TO public
  USING (true);

-- Create storage buckets for audio files and avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('scene-audio-files', 'scene-audio-files', true),
  ('character-avatars', 'character-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create storage policies for audio files bucket
CREATE POLICY "Public Access for scene-audio-files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'scene-audio-files');

CREATE POLICY "Public Upload for scene-audio-files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'scene-audio-files');

CREATE POLICY "Public Update for scene-audio-files"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'scene-audio-files')
WITH CHECK (bucket_id = 'scene-audio-files');

CREATE POLICY "Public Delete for scene-audio-files"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'scene-audio-files');

-- Create storage policies for character avatars bucket
CREATE POLICY "Public Access for character-avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'character-avatars');

CREATE POLICY "Public Upload for character-avatars"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'character-avatars');

CREATE POLICY "Public Update for character-avatars"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'character-avatars')
WITH CHECK (bucket_id = 'character-avatars');

CREATE POLICY "Public Delete for character-avatars"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'character-avatars');

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scene_characters_updated_at
    BEFORE UPDATE ON scene_characters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scene_audio_files_updated_at
    BEFORE UPDATE ON scene_audio_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();