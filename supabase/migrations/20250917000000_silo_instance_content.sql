-- Migration to silo scene content by instance
-- This adds instance_id to scene_configurations, simulation_videos, and scene_order

-- ============================================================================
-- 1. scene_configurations
-- ============================================================================

ALTER TABLE public.scene_configurations 
ADD COLUMN instance_id UUID REFERENCES public.simulation_instances(id) ON DELETE CASCADE;

-- Drop the old unique constraint on just scene_id
ALTER TABLE public.scene_configurations 
DROP CONSTRAINT IF EXISTS scene_configurations_scene_id_key;

-- Add a new unique constraint on (instance_id, scene_id)
-- Note: instance_id can be NULL for default global templates
ALTER TABLE public.scene_configurations 
ADD CONSTRAINT scene_configurations_instance_scene_key UNIQUE NULLS NOT DISTINCT (instance_id, scene_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Public can read active scene configurations" ON public.scene_configurations;
CREATE POLICY "Public can read active scene configurations"
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


-- ============================================================================
-- 2. simulation_videos
-- ============================================================================

ALTER TABLE public.simulation_videos 
ADD COLUMN instance_id UUID REFERENCES public.simulation_instances(id) ON DELETE CASCADE;

-- Drop the old unique constraint on just scene_id
ALTER TABLE public.simulation_videos 
DROP CONSTRAINT IF EXISTS simulation_videos_scene_id_key;

-- Add a new unique constraint on (instance_id, scene_id)
ALTER TABLE public.simulation_videos 
ADD CONSTRAINT simulation_videos_instance_scene_key UNIQUE NULLS NOT DISTINCT (instance_id, scene_id);

-- Update RLS policies
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


-- ============================================================================
-- 3. scene_order
-- ============================================================================

ALTER TABLE public.scene_order 
ADD COLUMN instance_id UUID REFERENCES public.simulation_instances(id) ON DELETE CASCADE;

-- Drop the old unique constraint on just scene_id
ALTER TABLE public.scene_order 
DROP CONSTRAINT IF EXISTS scene_order_scene_id_key;

-- Add a new unique constraint on (instance_id, scene_id)
ALTER TABLE public.scene_order 
ADD CONSTRAINT scene_order_instance_scene_key UNIQUE NULLS NOT DISTINCT (instance_id, scene_id);

-- Update RLS policies
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
