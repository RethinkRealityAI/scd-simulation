-- Create welcome_configurations table for storing welcome screen settings
CREATE TABLE IF NOT EXISTS public.welcome_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Visual Styling
  background_image_url TEXT NOT NULL,
  background_blur INTEGER DEFAULT 0,
  background_overlay_opacity INTEGER DEFAULT 70,
  
  -- Typography
  main_title TEXT NOT NULL,
  main_title_size TEXT DEFAULT 'text-7xl',
  gradient_title TEXT NOT NULL,
  gradient_colors TEXT DEFAULT 'from-blue-400 via-purple-400 to-cyan-400',
  subtitle TEXT NOT NULL,
  subtitle_size TEXT DEFAULT 'text-xl',
  
  -- Form Styling
  form_title TEXT NOT NULL,
  form_subtitle TEXT NOT NULL,
  form_backdrop_blur TEXT DEFAULT 'backdrop-blur-xl',
  form_background_opacity INTEGER DEFAULT 10,
  form_border_opacity INTEGER DEFAULT 20,
  input_backdrop_blur TEXT DEFAULT 'backdrop-blur-sm',
  input_border_opacity INTEGER DEFAULT 30,
  button_gradient TEXT DEFAULT 'from-blue-500 to-purple-500',
  button_text TEXT DEFAULT 'Begin Simulation',
  
  -- Features Section (JSONB)
  features JSONB NOT NULL DEFAULT '[]',
  
  -- Form Fields Configuration (JSONB)
  form_fields JSONB NOT NULL DEFAULT '{}',
  
  -- Data Collection Notice
  data_collection_title TEXT NOT NULL,
  data_collection_text TEXT NOT NULL,
  data_collection_footer JSONB NOT NULL DEFAULT '[]',
  
  -- Modal Configuration
  modal_enabled BOOLEAN DEFAULT true,
  modal_steps JSONB NOT NULL DEFAULT '[]',
  
  -- Metadata
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_welcome_configurations_active 
  ON public.welcome_configurations(is_active, version DESC);

-- Enable Row Level Security
ALTER TABLE public.welcome_configurations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth needs)
CREATE POLICY "Allow all operations on welcome_configurations"
  ON public.welcome_configurations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.welcome_configurations IS 'Stores configuration for the welcome screen including styling, content, and form fields';

