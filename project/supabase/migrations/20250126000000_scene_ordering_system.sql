/*
  # Scene Ordering System
  
  Creates tables and policies for managing scene order and display settings.
  
  ## Tables:
  1. scene_order - Manages the order and visibility of scenes
  2. scene_management_settings - Global scene management settings
  
  ## Features:
  - Drag-and-drop scene ordering
  - Completion scene designation
  - Active/inactive scene control
  - Maximum scene limits
  - Custom scene allowance
*/

-- ============================================================================
-- TABLES
-- ============================================================================

-- Create scene_order table
CREATE TABLE IF NOT EXISTS public.scene_order (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id INTEGER UNIQUE NOT NULL CHECK (scene_id >= 1 AND scene_id <= 100),
  display_order INTEGER NOT NULL CHECK (display_order > 0),
  is_completion_scene BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scene_management_settings table
CREATE TABLE IF NOT EXISTS public.scene_management_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_scene_order_scene_id ON public.scene_order(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_order_display_order ON public.scene_order(display_order);
CREATE INDEX IF NOT EXISTS idx_scene_order_active ON public.scene_order(is_active);
CREATE INDEX IF NOT EXISTS idx_scene_management_settings_key ON public.scene_management_settings(setting_key);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_scene_order_updated_at ON public.scene_order;
CREATE TRIGGER update_scene_order_updated_at
  BEFORE UPDATE ON public.scene_order
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_scene_management_settings_updated_at ON public.scene_management_settings;
CREATE TRIGGER update_scene_management_settings_updated_at
  BEFORE UPDATE ON public.scene_management_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.scene_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scene_management_settings ENABLE ROW LEVEL SECURITY;

-- scene_order policies
DROP POLICY IF EXISTS "Public can read active scene order" ON public.scene_order;
CREATE POLICY "Public can read active scene order"
  ON public.scene_order
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Anon can read active scene order" ON public.scene_order;
CREATE POLICY "Anon can read active scene order"
  ON public.scene_order
  FOR SELECT
  TO anon
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage scene order" ON public.scene_order;
CREATE POLICY "Authenticated users can manage scene order"
  ON public.scene_order
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- scene_management_settings policies
DROP POLICY IF EXISTS "Public can read settings" ON public.scene_management_settings;
CREATE POLICY "Public can read settings"
  ON public.scene_management_settings
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Anon can read settings" ON public.scene_management_settings;
CREATE POLICY "Anon can read settings"
  ON public.scene_management_settings
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage settings" ON public.scene_management_settings;
CREATE POLICY "Authenticated users can manage settings"
  ON public.scene_management_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default scene order for scenes 1-10
INSERT INTO public.scene_order (scene_id, display_order, is_completion_scene, is_active)
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
  (10, 10, true, true)  -- Scene 10 is typically the completion scene
ON CONFLICT (scene_id) DO NOTHING;

-- Insert default management settings
INSERT INTO public.scene_management_settings (setting_key, setting_value, description)
VALUES 
  ('max_scenes', '20', 'Maximum number of scenes allowed'),
  ('allow_custom_scenes', 'true', 'Whether custom scenes can be added'),
  ('completion_scene_required', 'true', 'Whether a completion scene is required')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.scene_order IS 'Manages the order and visibility of simulation scenes';
COMMENT ON TABLE public.scene_management_settings IS 'Global settings for scene management system';

COMMENT ON COLUMN public.scene_order.display_order IS 'Order in which scenes appear (1-based)';
COMMENT ON COLUMN public.scene_order.is_completion_scene IS 'Whether this is the final/completion scene';
COMMENT ON COLUMN public.scene_order.is_active IS 'Whether this scene is active and should be displayed';





