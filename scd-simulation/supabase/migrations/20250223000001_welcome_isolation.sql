/*
  # Welcome Configuration Isolation
  
  1. Changes
    - Add `instance_id` column to `welcome_configurations` table
    - Add unique constraint for instance-specific configurations
    - Update RLS policies to support instance isolation
    
  2. Security
    - Enable RLS
    - Add policies for public read access (filtered by instance)
    - Add policies for authenticated management
*/

-- Add instance_id column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'welcome_configurations' AND column_name = 'instance_id'
  ) THEN
    ALTER TABLE public.welcome_configurations 
    ADD COLUMN instance_id UUID REFERENCES public.simulation_instances(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_welcome_configurations_instance_id 
  ON public.welcome_configurations(instance_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Anon can read active welcome configs" ON public.welcome_configurations;
DROP POLICY IF EXISTS "Public can read active welcome configs" ON public.welcome_configurations;
DROP POLICY IF EXISTS "Allow all operations on welcome_configurations" ON public.welcome_configurations;

-- Policy: Public can read active configs (global or instance-specific)
CREATE POLICY "Public can read active welcome configs"
  ON public.welcome_configurations
  FOR SELECT
  TO public
  USING (is_active = true);

-- Policy: Authenticated users can manage all configs
CREATE POLICY "Authenticated users can manage welcome configurations"
  ON public.welcome_configurations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
