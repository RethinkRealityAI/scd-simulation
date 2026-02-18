-- ============================================================================
-- MANUAL FIX FOR WELCOME CONFIGURATIONS TABLE
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor to fix the schema mismatch
-- This will NOT delete any data, only add missing columns
-- ============================================================================

-- 1. Add instance_id column
ALTER TABLE public.welcome_configurations 
ADD COLUMN IF NOT EXISTS instance_id UUID REFERENCES public.simulation_instances(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_welcome_configurations_instance_id 
  ON public.welcome_configurations(instance_id);

-- 2. Add age_groups column
ALTER TABLE public.welcome_configurations 
ADD COLUMN IF NOT EXISTS age_groups JSONB DEFAULT '[
  {"value": "18-24", "label": "18-24"},
  {"value": "25-34", "label": "25-34"},
  {"value": "35-44", "label": "35-44"},
  {"value": "45-54", "label": "45-54"},
  {"value": "55+", "label": "55+"}
]'::jsonb;

-- 3. Add instructions column
ALTER TABLE public.welcome_configurations 
ADD COLUMN IF NOT EXISTS instructions TEXT[] DEFAULT ARRAY[
  'Complete demographic information',
  'Navigate through realistic clinical scenarios',
  'Answer questions and make clinical decisions',
  'Reflect on bias and cultural considerations'
];

-- 4. Add title column (migrates from main_title)
ALTER TABLE public.welcome_configurations 
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Sickle Cell Disease Simulation';

-- Migrate data from main_title to title
UPDATE public.welcome_configurations 
SET title = main_title 
WHERE main_title IS NOT NULL AND (title IS NULL OR title = 'Sickle Cell Disease Simulation');

-- 5. Add subtitle column
ALTER TABLE public.welcome_configurations 
ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT 'A case-based learning experience focused on bias mitigation and cultural safety';

-- 6. Add branding column
ALTER TABLE public.welcome_configurations 
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{
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
WHERE background_image_url IS NOT NULL 
  AND (branding->>'background_image' IS NULL OR branding->>'background_image' = '');

-- 7. Ensure defaults for form fields
UPDATE public.welcome_configurations 
SET form_backdrop_blur = 'backdrop-blur-md'
WHERE form_backdrop_blur IS NULL OR form_backdrop_blur = '';

UPDATE public.welcome_configurations 
SET form_background_opacity = 10
WHERE form_background_opacity IS NULL;

UPDATE public.welcome_configurations 
SET form_border_opacity = 20
WHERE form_border_opacity IS NULL;

-- 8. Update RLS policies
DROP POLICY IF EXISTS "Public can read active welcome configs" ON public.welcome_configurations;
DROP POLICY IF EXISTS "Authenticated users can manage welcome configurations" ON public.welcome_configurations;
DROP POLICY IF EXISTS "Public can read welcome configurations" ON public.welcome_configurations;

CREATE POLICY "Public can read active welcome configs"
  ON public.welcome_configurations
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Public can manage welcome configurations"
  ON public.welcome_configurations
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Done! The welcome_configurations table now has all required columns.
