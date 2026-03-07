/*
  # Complete Database Schema for SCD Simulation
  
  This migration creates all required tables, storage buckets, and policies
  for the Sickle Cell Disease simulation application.
  
  ## Tables Created:
  1. simulation_videos - Store video content for each scene
  2. scene_characters - Store character information with avatars
  3. scene_audio_files - Store audio narration files linked to characters
  
  ## Storage Buckets:
  1. simulation-videos - Video files and posters
  2. character-avatars - Character avatar images
  3. scene-audio-files - Audio narration files
  
  ## Security:
  - RLS enabled on all tables
  - Public policies for reading content
  - Authenticated policies for admin management
  - Public storage access for media files
*/

-- ============================================================================
-- TABLES
-- ============================================================================

-- Create simulation_videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.simulation_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id INTEGER UNIQUE NOT NULL CHECK (scene_id >= 1 AND scene_id <= 10),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  poster_url TEXT,
  audio_narration_url TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scene_characters table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.scene_characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id INTEGER NOT NULL CHECK (scene_id >= 1 AND scene_id <= 10),
  character_name TEXT NOT NULL,
  character_role TEXT,
  avatar_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scene_audio_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.scene_audio_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id INTEGER NOT NULL CHECK (scene_id >= 1 AND scene_id <= 10),
  character_id UUID NOT NULL REFERENCES public.scene_characters(id) ON DELETE CASCADE,
  audio_title TEXT NOT NULL,
  audio_description TEXT,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  display_order INTEGER DEFAULT 0,
  auto_play BOOLEAN DEFAULT FALSE,
  hide_player BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_simulation_videos_scene_id ON public.simulation_videos(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_characters_scene_id ON public.scene_characters(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_audio_files_scene_id ON public.scene_audio_files(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_audio_files_character_id ON public.scene_audio_files(character_id);

-- ============================================================================
-- TRIGGERS (Updated At)
-- ============================================================================

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_simulation_videos_updated_at ON public.simulation_videos;
CREATE TRIGGER update_simulation_videos_updated_at
  BEFORE UPDATE ON public.simulation_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_scene_characters_updated_at ON public.scene_characters;
CREATE TRIGGER update_scene_characters_updated_at
  BEFORE UPDATE ON public.scene_characters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_scene_audio_files_updated_at ON public.scene_audio_files;
CREATE TRIGGER update_scene_audio_files_updated_at
  BEFORE UPDATE ON public.scene_audio_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.simulation_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_audio_files ENABLE ROW LEVEL SECURITY;

-- simulation_videos policies
DROP POLICY IF EXISTS "Public can read simulation videos" ON public.simulation_videos;
CREATE POLICY "Public can read simulation videos"
  ON public.simulation_videos
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage videos" ON public.simulation_videos;
CREATE POLICY "Authenticated users can manage videos"
  ON public.simulation_videos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- scene_characters policies
DROP POLICY IF EXISTS "Public can read characters" ON public.scene_characters;
CREATE POLICY "Public can read characters"
  ON public.scene_characters
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage characters" ON public.scene_characters;
CREATE POLICY "Authenticated users can manage characters"
  ON public.scene_characters
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- scene_audio_files policies
DROP POLICY IF EXISTS "Public can read audio files" ON public.scene_audio_files;
CREATE POLICY "Public can read audio files"
  ON public.scene_audio_files
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage audio files" ON public.scene_audio_files;
CREATE POLICY "Authenticated users can manage audio files"
  ON public.scene_audio_files
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Note: Storage buckets need to be created via Supabase Dashboard or API
-- The following SQL is for documentation purposes:
--
-- 1. simulation-videos (public bucket)
--    - For video files and poster images
--    - Public access for playback
--
-- 2. character-avatars (public bucket)
--    - For character avatar images
--    - Public access for display
--
-- 3. scene-audio-files (public bucket)
--    - For audio narration files
--    - Public access for playback

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.simulation_videos IS 'Stores video content for simulation scenes';
COMMENT ON TABLE public.scene_characters IS 'Stores character information and avatars for each scene';
COMMENT ON TABLE public.scene_audio_files IS 'Stores audio narration files linked to characters';

COMMENT ON COLUMN public.simulation_videos.scene_id IS 'Unique scene identifier (1-10)';
COMMENT ON COLUMN public.scene_characters.display_order IS 'Order in which characters appear in the scene';
COMMENT ON COLUMN public.scene_audio_files.auto_play IS 'Whether audio should play automatically when scene loads';
COMMENT ON COLUMN public.scene_audio_files.hide_player IS 'Whether to hide the audio player UI (for background audio)';

