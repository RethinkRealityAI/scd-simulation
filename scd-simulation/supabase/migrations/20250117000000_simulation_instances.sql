/*
  # Simulation Instances Migration
  
  This migration creates the core tables for multi-institutional simulation management.
  It extends the existing system to support multiple simulation instances while
  maintaining data isolation and leveraging existing functionality.
  
  ## Key Features:
  - Instance-based data isolation
  - Custom branding and configuration per instance
  - Webhook management per instance
  - Access token system for secure sharing
  - Integration with existing admin functionality
*/

-- ============================================================================
-- CORE INSTANCE MANAGEMENT
-- ============================================================================

-- Create simulation_instances table
CREATE TABLE IF NOT EXISTS public.simulation_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  institution_name VARCHAR(255) NOT NULL,
  institution_id VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Webhook configuration
  webhook_url TEXT,
  webhook_secret VARCHAR(255),
  webhook_retry_count INTEGER DEFAULT 3,
  webhook_timeout_seconds INTEGER DEFAULT 30,
  
  -- Branding configuration
  branding_config JSONB DEFAULT '{
    "logo_url": null,
    "primary_color": "#3B82F6",
    "secondary_color": "#1E40AF", 
    "accent_color": "#F59E0B",
    "background_color": "#FFFFFF",
    "text_color": "#1F2937",
    "font_family": "Inter, sans-serif",
    "custom_css": null
  }',
  
  -- Content configuration (references existing content)
  content_config JSONB DEFAULT '{
    "welcome_config": null,
    "scene_order": [],
    "custom_scenes": [],
    "disabled_features": []
  }',
  
  -- Access control
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  max_sessions_per_day INTEGER,
  session_timeout_minutes INTEGER DEFAULT 120,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create instance access tokens table
CREATE TABLE IF NOT EXISTS public.instance_access_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.simulation_instances(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Access control
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Usage tracking
  last_used_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create instance-specific session data table
CREATE TABLE IF NOT EXISTS public.instance_session_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.simulation_instances(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  
  -- User demographics
  user_demographics JSONB,
  
  -- Session data
  responses JSONB,
  category_scores JSONB,
  final_score INTEGER,
  completion_time INTEGER,
  completed_scenes INTEGER[],
  
  -- Timestamps
  start_time TIMESTAMPTZ,
  completion_time TIMESTAMPTZ,
  submission_timestamp TIMESTAMPTZ,
  
  -- Webhook status
  webhook_sent BOOLEAN DEFAULT false,
  webhook_attempts INTEGER DEFAULT 0,
  webhook_last_attempt TIMESTAMPTZ,
  webhook_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INSTANCE-SPECIFIC CONTENT OVERRIDES
-- ============================================================================

-- Create instance video overrides table
CREATE TABLE IF NOT EXISTS public.instance_video_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.simulation_instances(id) ON DELETE CASCADE,
  scene_id INTEGER NOT NULL,
  
  -- Override fields (null means use default)
  title TEXT,
  description TEXT,
  video_url TEXT,
  poster_url TEXT,
  audio_narration_url TEXT,
  duration_seconds INTEGER,
  
  -- Override metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(instance_id, scene_id)
);

-- Create instance character overrides table
CREATE TABLE IF NOT EXISTS public.instance_character_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.simulation_instances(id) ON DELETE CASCADE,
  scene_id INTEGER NOT NULL,
  character_name TEXT NOT NULL,
  
  -- Override fields
  character_role TEXT,
  avatar_url TEXT,
  display_order INTEGER DEFAULT 0,
  
  -- Override metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create instance audio overrides table
CREATE TABLE IF NOT EXISTS public.instance_audio_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.simulation_instances(id) ON DELETE CASCADE,
  scene_id INTEGER NOT NULL,
  character_id UUID REFERENCES public.instance_character_overrides(id) ON DELETE CASCADE,
  
  -- Override fields
  audio_title TEXT,
  audio_description TEXT,
  audio_url TEXT,
  duration_seconds INTEGER,
  display_order INTEGER DEFAULT 0,
  auto_play BOOLEAN DEFAULT false,
  hide_player BOOLEAN DEFAULT false,
  
  -- Override metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Instance lookups
CREATE INDEX IF NOT EXISTS idx_simulation_instances_institution_id ON public.simulation_instances(institution_id);
CREATE INDEX IF NOT EXISTS idx_simulation_instances_active ON public.simulation_instances(is_active) WHERE is_active = true;

-- Access token lookups
CREATE INDEX IF NOT EXISTS idx_instance_access_tokens_token ON public.instance_access_tokens(token) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_instance_access_tokens_instance ON public.instance_access_tokens(instance_id);

-- Session data lookups
CREATE INDEX IF NOT EXISTS idx_instance_session_data_instance ON public.instance_session_data(instance_id);
CREATE INDEX IF NOT EXISTS idx_instance_session_data_session ON public.instance_session_data(session_id);
CREATE INDEX IF NOT EXISTS idx_instance_session_data_created ON public.instance_session_data(created_at);

-- Content override lookups
CREATE INDEX IF NOT EXISTS idx_instance_video_overrides_instance_scene ON public.instance_video_overrides(instance_id, scene_id);
CREATE INDEX IF NOT EXISTS idx_instance_character_overrides_instance_scene ON public.instance_character_overrides(instance_id, scene_id);
CREATE INDEX IF NOT EXISTS idx_instance_audio_overrides_instance_scene ON public.instance_audio_overrides(instance_id, scene_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Add updated_at triggers for all new tables
CREATE TRIGGER update_simulation_instances_updated_at
  BEFORE UPDATE ON public.simulation_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instance_access_tokens_updated_at
  BEFORE UPDATE ON public.instance_access_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instance_session_data_updated_at
  BEFORE UPDATE ON public.instance_session_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instance_video_overrides_updated_at
  BEFORE UPDATE ON public.instance_video_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instance_character_overrides_updated_at
  BEFORE UPDATE ON public.instance_character_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instance_audio_overrides_updated_at
  BEFORE UPDATE ON public.instance_audio_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.simulation_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instance_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instance_session_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instance_video_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instance_character_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instance_audio_overrides ENABLE ROW LEVEL SECURITY;

-- Simulation instances policies
CREATE POLICY "Public can read active simulation instances"
  ON public.simulation_instances
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage simulation instances"
  ON public.simulation_instances
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Access tokens policies
CREATE POLICY "Public can read active access tokens"
  ON public.instance_access_tokens
  FOR SELECT
  TO public
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Authenticated users can manage access tokens"
  ON public.instance_access_tokens
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Session data policies
CREATE POLICY "Public can insert session data"
  ON public.instance_session_data
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read session data"
  ON public.instance_session_data
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update session data"
  ON public.instance_session_data
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Content override policies
CREATE POLICY "Public can read content overrides"
  ON public.instance_video_overrides
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Public can read character overrides"
  ON public.instance_character_overrides
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Public can read audio overrides"
  ON public.instance_audio_overrides
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage content overrides"
  ON public.instance_video_overrides
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage character overrides"
  ON public.instance_character_overrides
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage audio overrides"
  ON public.instance_audio_overrides
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate unique institution ID
CREATE OR REPLACE FUNCTION generate_institution_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generate a random 8-character alphanumeric ID
    new_id := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if it already exists
    SELECT COUNT(*) INTO exists_count 
    FROM public.simulation_instances 
    WHERE institution_id = new_id;
    
    -- If it doesn't exist, we're good
    IF exists_count = 0 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate access token
CREATE OR REPLACE FUNCTION generate_access_token()
RETURNS TEXT AS $$
DECLARE
  new_token TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generate a random 32-character token
    new_token := encode(gen_random_bytes(24), 'base64');
    
    -- Check if it already exists
    SELECT COUNT(*) INTO exists_count 
    FROM public.instance_access_tokens 
    WHERE token = new_token;
    
    -- If it doesn't exist, we're good
    IF exists_count = 0 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_token;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and use access token
CREATE OR REPLACE FUNCTION use_access_token(token_value TEXT)
RETURNS TABLE(
  instance_id UUID,
  institution_name TEXT,
  branding_config JSONB,
  content_config JSONB
) AS $$
BEGIN
  -- Update usage count and last used timestamp
  UPDATE public.instance_access_tokens 
  SET 
    current_uses = current_uses + 1,
    last_used_at = NOW()
  WHERE 
    token = token_value 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR current_uses < max_uses);
  
  -- Return instance data if token is valid
  RETURN QUERY
  SELECT 
    si.id,
    si.institution_name,
    si.branding_config,
    si.content_config
  FROM public.simulation_instances si
  JOIN public.instance_access_tokens iat ON si.id = iat.instance_id
  WHERE 
    iat.token = token_value 
    AND iat.is_active = true 
    AND si.is_active = true
    AND (iat.expires_at IS NULL OR iat.expires_at > NOW())
    AND (iat.max_uses IS NULL OR iat.current_uses < iat.max_uses);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.simulation_instances IS 'Core table for managing multiple simulation instances per institution';
COMMENT ON TABLE public.instance_access_tokens IS 'Access tokens for secure sharing of simulation instances';
COMMENT ON TABLE public.instance_session_data IS 'Session data isolated per simulation instance';
COMMENT ON TABLE public.instance_video_overrides IS 'Instance-specific video content overrides';
COMMENT ON TABLE public.instance_character_overrides IS 'Instance-specific character content overrides';
COMMENT ON TABLE public.instance_audio_overrides IS 'Instance-specific audio content overrides';

COMMENT ON COLUMN public.simulation_instances.institution_id IS 'Unique identifier for the institution (used in URLs)';
COMMENT ON COLUMN public.simulation_instances.branding_config IS 'JSON configuration for custom branding (colors, logo, CSS)';
COMMENT ON COLUMN public.simulation_instances.content_config IS 'JSON configuration for content customization';
COMMENT ON COLUMN public.instance_access_tokens.token IS 'Secure token for accessing simulation instances';
COMMENT ON COLUMN public.instance_session_data.webhook_sent IS 'Whether completion data was successfully sent to webhook';
