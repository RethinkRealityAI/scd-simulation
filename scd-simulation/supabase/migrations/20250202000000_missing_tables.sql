/*
  # Missing Tables Migration
  
  This migration creates the missing tables that are referenced in the codebase
  but don't exist in the database yet.
  
  ## Tables Created:
  1. scene_configurations - Store admin-configured scene data
  2. welcome_configurations - Store welcome screen configurations
  3. scene_ordering - Store scene order and completion settings
  4. scene_data - Store scene-specific data and content
*/

-- ============================================================================
-- SCENE CONFIGURATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.scene_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id INTEGER NOT NULL CHECK (scene_id >= 1 AND scene_id <= 20),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  vitals_config JSONB,
  quiz_questions JSONB,
  action_prompts JSONB,
  discussion_prompts TEXT[],
  clinical_findings TEXT[],
  scoring_categories TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scene_id)
);

-- ============================================================================
-- WELCOME CONFIGURATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.welcome_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  background_image_url TEXT,
  background_blur INTEGER DEFAULT 0,
  background_overlay_opacity INTEGER DEFAULT 70,
  main_title TEXT NOT NULL,
  main_title_size TEXT DEFAULT 'text-7xl',
  gradient_title TEXT,
  gradient_colors TEXT DEFAULT 'from-blue-400 via-purple-400 to-cyan-400',
  subtitle TEXT,
  subtitle_size TEXT DEFAULT 'text-xl',
  form_title TEXT DEFAULT 'User Details',
  form_subtitle TEXT DEFAULT 'Please provide your information to begin',
  form_backdrop_blur TEXT DEFAULT 'backdrop-blur-xl',
  form_background_opacity INTEGER DEFAULT 10,
  form_border_opacity INTEGER DEFAULT 20,
  input_backdrop_blur TEXT DEFAULT 'backdrop-blur-sm',
  input_border_opacity INTEGER DEFAULT 30,
  button_gradient TEXT DEFAULT 'from-blue-500 to-purple-500',
  button_text TEXT DEFAULT 'Begin Simulation',
  features JSONB DEFAULT '[]',
  form_fields JSONB NOT NULL,
  data_collection_title TEXT DEFAULT 'Data Collection',
  data_collection_text TEXT,
  data_collection_footer TEXT[] DEFAULT '{}',
  modal_enabled BOOLEAN DEFAULT true,
  modal_steps JSONB DEFAULT '[]',
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SCENE ORDERING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.scene_ordering (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id INTEGER NOT NULL CHECK (scene_id >= 1 AND scene_id <= 20),
  display_order INTEGER NOT NULL,
  is_completion_scene BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scene_id),
  UNIQUE(display_order)
);

-- ============================================================================
-- SCENE DATA TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.scene_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id INTEGER NOT NULL CHECK (scene_id >= 1 AND scene_id <= 20),
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'audio', 'image', 'text', 'interactive')),
  content_data JSONB NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_scene_configurations_scene_id ON public.scene_configurations(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_configurations_active ON public.scene_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_welcome_configurations_active ON public.welcome_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_scene_ordering_display_order ON public.scene_ordering(display_order);
CREATE INDEX IF NOT EXISTS idx_scene_ordering_scene_id ON public.scene_ordering(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_data_scene_id ON public.scene_data(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_data_content_type ON public.scene_data(content_type);

-- ============================================================================
-- TRIGGERS (Updated At)
-- ============================================================================

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_scene_configurations_updated_at ON public.scene_configurations;
CREATE TRIGGER update_scene_configurations_updated_at
  BEFORE UPDATE ON public.scene_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_welcome_configurations_updated_at ON public.welcome_configurations;
CREATE TRIGGER update_welcome_configurations_updated_at
  BEFORE UPDATE ON public.welcome_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_scene_ordering_updated_at ON public.scene_ordering;
CREATE TRIGGER update_scene_ordering_updated_at
  BEFORE UPDATE ON public.scene_ordering
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_scene_data_updated_at ON public.scene_data;
CREATE TRIGGER update_scene_data_updated_at
  BEFORE UPDATE ON public.scene_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.scene_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welcome_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_ordering ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_data ENABLE ROW LEVEL SECURITY;

-- scene_configurations policies
DROP POLICY IF EXISTS "Public can read scene configurations" ON public.scene_configurations;
CREATE POLICY "Public can read scene configurations"
  ON public.scene_configurations
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage scene configurations" ON public.scene_configurations;
CREATE POLICY "Authenticated users can manage scene configurations"
  ON public.scene_configurations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- welcome_configurations policies
DROP POLICY IF EXISTS "Public can read welcome configurations" ON public.welcome_configurations;
CREATE POLICY "Public can read welcome configurations"
  ON public.welcome_configurations
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage welcome configurations" ON public.welcome_configurations;
CREATE POLICY "Authenticated users can manage welcome configurations"
  ON public.welcome_configurations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- scene_ordering policies
DROP POLICY IF EXISTS "Public can read scene ordering" ON public.scene_ordering;
CREATE POLICY "Public can read scene ordering"
  ON public.scene_ordering
  FOR SELECT
  TO public
  USING (is_enabled = true);

DROP POLICY IF EXISTS "Authenticated users can manage scene ordering" ON public.scene_ordering;
CREATE POLICY "Authenticated users can manage scene ordering"
  ON public.scene_ordering
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- scene_data policies
DROP POLICY IF EXISTS "Public can read scene data" ON public.scene_data;
CREATE POLICY "Public can read scene data"
  ON public.scene_data
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage scene data" ON public.scene_data;
CREATE POLICY "Authenticated users can manage scene data"
  ON public.scene_data
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default scene ordering (scenes 1-10)
INSERT INTO public.scene_ordering (scene_id, display_order, is_completion_scene, is_enabled)
VALUES 
  (1, 1, false, true),
  (2, 2, false, true),
  (3, 3, false, true),
  (4, 4, false, true),
  (5, 5, false, true),
  (6, 6, false, true),
  (7, 7, false, true),
  (8, 8, false, true),
  (9, 9, false, true),
  (10, 10, true, true)
ON CONFLICT (scene_id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.scene_configurations IS 'Stores admin-configured scene data that overrides static defaults';
COMMENT ON TABLE public.welcome_configurations IS 'Stores welcome screen configurations and branding';
COMMENT ON TABLE public.scene_ordering IS 'Stores scene order and completion settings';
COMMENT ON TABLE public.scene_data IS 'Stores additional scene content and media';

COMMENT ON COLUMN public.scene_configurations.scene_id IS 'Scene identifier (1-20)';
COMMENT ON COLUMN public.scene_configurations.vitals_config IS 'JSON configuration for patient vitals display';
COMMENT ON COLUMN public.scene_configurations.quiz_questions IS 'JSON array of quiz questions for the scene';
COMMENT ON COLUMN public.scene_configurations.action_prompts IS 'JSON configuration for action prompts';
COMMENT ON COLUMN public.scene_configurations.discussion_prompts IS 'Array of discussion prompts for the scene';
COMMENT ON COLUMN public.scene_configurations.clinical_findings IS 'Array of clinical findings to display';
COMMENT ON COLUMN public.scene_configurations.scoring_categories IS 'Array of scoring categories this scene contributes to';

COMMENT ON COLUMN public.welcome_configurations.features IS 'JSON array of feature highlights for the welcome screen';
COMMENT ON COLUMN public.welcome_configurations.form_fields IS 'JSON configuration for user registration form fields';
COMMENT ON COLUMN public.welcome_configurations.modal_steps IS 'JSON array of modal steps for the welcome flow';

COMMENT ON COLUMN public.scene_ordering.display_order IS 'Order in which scenes appear in the simulation';
COMMENT ON COLUMN public.scene_ordering.is_completion_scene IS 'Whether this scene marks the end of the simulation';

COMMENT ON COLUMN public.scene_data.content_type IS 'Type of content (video, audio, image, text, interactive)';
COMMENT ON COLUMN public.scene_data.content_data IS 'JSON data containing the actual content and metadata';

