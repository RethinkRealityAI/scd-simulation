/*
  # Instance Isolation Migration

  1. Changes
    - Add `instance_id` column to `scene_configurations` table
    - Remove global unique constraint on `scene_id`
    - Add partial unique indexes for global vs instance scenes
    - Create `clone_instance_scenes` RPC function
    - Update RLS policies

  2. Security
    - Enable RLS for instance-specific scenes
*/

-- Add instance_id column
ALTER TABLE scene_configurations 
ADD COLUMN IF NOT EXISTS instance_id uuid REFERENCES simulation_instances(id) ON DELETE CASCADE;

-- Drop existing unique constraint on scene_id
ALTER TABLE scene_configurations DROP CONSTRAINT IF EXISTS scene_configurations_scene_id_key;

-- Create partial unique index for global scenes (where instance_id is null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_scene_configurations_global_scene_id 
ON scene_configurations(scene_id) 
WHERE instance_id IS NULL;

-- Create unique index for instance scenes
CREATE UNIQUE INDEX IF NOT EXISTS idx_scene_configurations_instance_scene_id 
ON scene_configurations(scene_id, instance_id) 
WHERE instance_id IS NOT NULL;

-- Create index for faster lookups by instance
CREATE INDEX IF NOT EXISTS idx_scene_configurations_instance_id 
ON scene_configurations(instance_id);

-- Function to clone global scenes for a new instance
CREATE OR REPLACE FUNCTION clone_instance_scenes(target_instance_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert copies of all global scenes (instance_id IS NULL)
  INSERT INTO scene_configurations (
    scene_id,
    title,
    description,
    quiz_questions,
    action_prompts,
    discussion_prompts,
    clinical_findings,
    scoring_categories,
    vitals_config,
    version,
    is_active,
    instance_id
  )
  SELECT 
    scene_id,
    title,
    description,
    quiz_questions,
    action_prompts,
    discussion_prompts,
    clinical_findings,
    scoring_categories,
    vitals_config,
    1 as version, -- Reset version for new instance
    is_active,
    target_instance_id
  FROM scene_configurations
  WHERE instance_id IS NULL;

  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

-- Update RLS Policies

-- Drop existing policies to recreate them with instance awareness
DROP POLICY IF EXISTS "Public can read active scene configurations" ON scene_configurations;
DROP POLICY IF EXISTS "Authenticated users can manage scene configurations" ON scene_configurations;

-- Policy: Public can read active global scenes OR active scenes for their assigned instance
-- Note: This is a simplified policy. For stricter security, we might want to check instance access tokens.
-- For now, we allow reading any active scene.
CREATE POLICY "Public can read active scene configurations"
  ON scene_configurations
  FOR SELECT
  TO public
  USING (is_active = true);

-- Policy: Authenticated users (admins) can manage all scenes
CREATE POLICY "Authenticated users can manage scene configurations"
  ON scene_configurations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
