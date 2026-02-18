/*
  # Fix Welcome Configurations Schema
  
  This migration fixes the schema mismatch between the database and the application code.
  The database has old column names that don't match what useWelcomeConfig expects.
  
  ## Changes:
  1. Add missing columns that the code expects
  2. Migrate data from old columns to new columns
  3. Keep old columns for backward compatibility (don't drop them)
  4. Add instance_id column if not exists (from 20250223000001_welcome_isolation.sql)
  5. Add age_groups column
  6. Ensure all expected columns exist
*/

-- Step 1: Add instance_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'welcome_configurations' 
    AND column_name = 'instance_id'
  ) THEN
    ALTER TABLE public.welcome_configurations 
    ADD COLUMN instance_id UUID REFERENCES public.simulation_instances(id) ON DELETE CASCADE;
    
    CREATE INDEX IF NOT EXISTS idx_welcome_configurations_instance_id 
      ON public.welcome_configurations(instance_id);
  END IF;
END $$;

-- Step 2: Add age_groups column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'welcome_configurations' 
    AND column_name = 'age_groups'
  ) THEN
    ALTER TABLE public.welcome_configurations 
    ADD COLUMN age_groups JSONB DEFAULT '[
      {"value": "18-24", "label": "18-24"},
      {"value": "25-34", "label": "25-34"},
      {"value": "35-44", "label": "35-44"},
      {"value": "45-54", "label": "45-54"},
      {"value": "55+", "label": "55+"}
    ]'::jsonb;
  END IF;
END $$;

-- Step 3: Add instructions column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'welcome_configurations' 
    AND column_name = 'instructions'
  ) THEN
    ALTER TABLE public.welcome_configurations 
    ADD COLUMN instructions TEXT[] DEFAULT ARRAY[
      'Complete demographic information',
      'Navigate through realistic clinical scenarios',
      'Answer questions and make clinical decisions',
      'Reflect on bias and cultural considerations'
    ];
  END IF;
END $$;

-- Step 4: Add title column if it doesn't exist (maps from main_title)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'welcome_configurations' 
    AND column_name = 'title'
  ) THEN
    ALTER TABLE public.welcome_configurations 
    ADD COLUMN title TEXT DEFAULT 'Sickle Cell Disease Simulation';
    
    -- Migrate data from main_title to title
    UPDATE public.welcome_configurations 
    SET title = main_title 
    WHERE main_title IS NOT NULL;
  END IF;
END $$;

-- Step 5: Add subtitle column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'welcome_configurations' 
    AND column_name = 'subtitle'
  ) THEN
    ALTER TABLE public.welcome_configurations 
    ADD COLUMN subtitle TEXT DEFAULT 'A case-based learning experience focused on bias mitigation and cultural safety';
    
    -- Migrate data from existing subtitle if it exists
    UPDATE public.welcome_configurations 
    SET subtitle = COALESCE(subtitle, 'A case-based learning experience focused on bias mitigation and cultural safety')
    WHERE subtitle IS NULL OR subtitle = '';
  END IF;
END $$;

-- Step 6: Add branding column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'welcome_configurations' 
    AND column_name = 'branding'
  ) THEN
    ALTER TABLE public.welcome_configurations 
    ADD COLUMN branding JSONB DEFAULT '{
      "primary_color": "blue",
      "secondary_color": "indigo",
      "accent_color": "cyan",
      "text_color": "white",
      "font_family": "Inter, sans-serif"
    }'::jsonb;
    
    -- Migrate background_image_url to branding.background_image
    UPDATE public.welcome_configurations 
    SET branding = jsonb_set(
      COALESCE(branding, '{}'::jsonb),
      '{background_image}',
      to_jsonb(background_image_url)
    )
    WHERE background_image_url IS NOT NULL;
  END IF;
END $$;

-- Step 7: Ensure form_backdrop_blur has proper default
UPDATE public.welcome_configurations 
SET form_backdrop_blur = 'backdrop-blur-md'
WHERE form_backdrop_blur IS NULL OR form_backdrop_blur = '';

-- Step 8: Ensure form_background_opacity has proper default
UPDATE public.welcome_configurations 
SET form_background_opacity = 10
WHERE form_background_opacity IS NULL;

-- Step 9: Ensure form_border_opacity has proper default
UPDATE public.welcome_configurations 
SET form_border_opacity = 20
WHERE form_border_opacity IS NULL;

-- Step 10: Update RLS policies to allow public users to manage configs (for admin panel)
DROP POLICY IF EXISTS "Public can read active welcome configs" ON public.welcome_configurations;
DROP POLICY IF EXISTS "Authenticated users can manage welcome configurations" ON public.welcome_configurations;
DROP POLICY IF EXISTS "Public can read welcome configurations" ON public.welcome_configurations;

-- Policy: Public can read active configs
CREATE POLICY "Public can read active welcome configs"
  ON public.welcome_configurations
  FOR SELECT
  TO public
  USING (is_active = true);

-- Policy: Public can manage all configs (for admin panel without auth)
CREATE POLICY "Public can manage welcome configurations"
  ON public.welcome_configurations
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add helpful comments
COMMENT ON COLUMN public.welcome_configurations.instance_id IS 'Reference to simulation_instances for instance-specific configurations. NULL for global config.';
COMMENT ON COLUMN public.welcome_configurations.age_groups IS 'JSON array of age group options for the welcome form';
COMMENT ON COLUMN public.welcome_configurations.instructions IS 'Array of instruction text to display on the welcome screen';
COMMENT ON COLUMN public.welcome_configurations.title IS 'Main title for the welcome screen';
COMMENT ON COLUMN public.welcome_configurations.branding IS 'JSON object containing branding colors and styling';
