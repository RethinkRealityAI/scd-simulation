/*
  # Fix Anonymous Access Policies
  
  Updates RLS policies to ensure anonymous (non-authenticated) users can:
  - Read simulation videos
  - Read scene configurations
  - Read scene order
  - Insert session data and analytics
  
  This is crucial for the public-facing simulation to work without authentication.
*/

-- ============================================================================
-- SIMULATION VIDEOS - Allow anonymous read access
-- ============================================================================

DROP POLICY IF EXISTS "Anon can read simulation videos" ON public.simulation_videos;
CREATE POLICY "Anon can read simulation videos"
  ON public.simulation_videos
  FOR SELECT
  TO anon
  USING (true);

-- Keep the public policy as well for backwards compatibility
DROP POLICY IF EXISTS "Public can read simulation videos" ON public.simulation_videos;
CREATE POLICY "Public can read simulation videos"
  ON public.simulation_videos
  FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- SCENE CONFIGURATIONS - Allow anonymous read access
-- ============================================================================

DROP POLICY IF EXISTS "Anon can read active scene configurations" ON public.scene_configurations;
CREATE POLICY "Anon can read active scene configurations"
  ON public.scene_configurations
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Update public policy to be more explicit
DROP POLICY IF EXISTS "Public can read active scene configurations" ON public.scene_configurations;
CREATE POLICY "Public can read active scene configurations"
  ON public.scene_configurations
  FOR SELECT
  TO public
  USING (is_active = true);

-- ============================================================================
-- SESSION DATA - Allow anonymous insert
-- ============================================================================

-- Ensure the session_data table exists and has proper policies
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'session_data') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Anon can insert session data" ON public.session_data;
    DROP POLICY IF EXISTS "Anyone can insert session data" ON public.session_data;
    
    -- Create new policy for anonymous insert
    CREATE POLICY "Anon can insert session data"
      ON public.session_data
      FOR INSERT
      TO anon
      WITH CHECK (true);
      
    -- Create policy for public insert as well
    CREATE POLICY "Public can insert session data"
      ON public.session_data
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- USER ANALYTICS - Allow anonymous insert
-- ============================================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_analytics') THEN
    DROP POLICY IF EXISTS "Anon can insert analytics" ON public.user_analytics;
    
    CREATE POLICY "Anon can insert analytics"
      ON public.user_analytics
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- SCENE CHARACTERS - Allow anonymous read access
-- ============================================================================

DROP POLICY IF EXISTS "Anon can read characters" ON public.scene_characters;
CREATE POLICY "Anon can read characters"
  ON public.scene_characters
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================================
-- SCENE AUDIO FILES - Allow anonymous read access
-- ============================================================================

DROP POLICY IF EXISTS "Anon can read audio files" ON public.scene_audio_files;
CREATE POLICY "Anon can read audio files"
  ON public.scene_audio_files
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================================
-- WELCOME CONFIGURATIONS - Allow anonymous read access
-- ============================================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'welcome_configurations') THEN
    DROP POLICY IF EXISTS "Anon can read active welcome configs" ON public.welcome_configurations;
    
    CREATE POLICY "Anon can read active welcome configs"
      ON public.welcome_configurations
      FOR SELECT
      TO anon
      USING (is_active = true);
      
    DROP POLICY IF EXISTS "Public can read active welcome configs" ON public.welcome_configurations;
    
    CREATE POLICY "Public can read active welcome configs"
      ON public.welcome_configurations
      FOR SELECT
      TO public
      USING (is_active = true);
  END IF;
END $$;

-- ============================================================================
-- SIMULATION INSTANCES - Allow anonymous read of active instances
-- ============================================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'simulation_instances') THEN
    DROP POLICY IF EXISTS "Anon can read active instances" ON public.simulation_instances;
    
    CREATE POLICY "Anon can read active instances"
      ON public.simulation_instances
      FOR SELECT
      TO anon
      USING (is_active = true);
      
    DROP POLICY IF EXISTS "Public can read active instances" ON public.simulation_instances;
    
    CREATE POLICY "Public can read active instances"
      ON public.simulation_instances
      FOR SELECT
      TO public
      USING (is_active = true);
  END IF;
END $$;

-- ============================================================================
-- INSTANCE SESSION DATA - Allow anonymous insert
-- ============================================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'instance_session_data') THEN
    DROP POLICY IF EXISTS "Anon can insert instance session data" ON public.instance_session_data;
    
    CREATE POLICY "Anon can insert instance session data"
      ON public.instance_session_data
      FOR INSERT
      TO anon
      WITH CHECK (true);
      
    DROP POLICY IF EXISTS "Public can insert instance session data" ON public.instance_session_data;
    
    CREATE POLICY "Public can insert instance session data"
      ON public.instance_session_data
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Anon can read simulation videos" ON public.simulation_videos IS 
  'Allows anonymous users to view simulation videos for the public simulation';

COMMENT ON POLICY "Anon can read active scene configurations" ON public.scene_configurations IS 
  'Allows anonymous users to read active scene configurations for the public simulation';





