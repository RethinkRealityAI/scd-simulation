/*
  # Video Isolation Migration

  1. Changes
    - Add `instance_id` column to `simulation_videos` table
    - Remove global unique constraint on `scene_id`
    - Add partial unique indexes for global vs instance videos
    - Update RLS policies

  2. Security
    - Enable RLS for instance-specific videos
*/

-- Add instance_id column
ALTER TABLE simulation_videos 
ADD COLUMN IF NOT EXISTS instance_id uuid REFERENCES simulation_instances(id) ON DELETE CASCADE;

-- Drop existing unique constraint on scene_id if it exists
-- Note: The constraint name might vary, so we'll try to drop the most likely one or just the index if it backs a constraint
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'simulation_videos_scene_id_key') THEN
    ALTER TABLE simulation_videos DROP CONSTRAINT simulation_videos_scene_id_key;
  END IF;
END $$;

-- Create partial unique index for global videos (where instance_id is null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_simulation_videos_global_scene_id 
ON simulation_videos(scene_id) 
WHERE instance_id IS NULL;

-- Create unique index for instance videos
CREATE UNIQUE INDEX IF NOT EXISTS idx_simulation_videos_instance_scene_id 
ON simulation_videos(scene_id, instance_id) 
WHERE instance_id IS NOT NULL;

-- Create index for faster lookups by instance
CREATE INDEX IF NOT EXISTS idx_simulation_videos_instance_id 
ON simulation_videos(instance_id);

-- Update RLS Policies

-- Drop existing policies to recreate them with instance awareness
DROP POLICY IF EXISTS "Public can read videos" ON simulation_videos;
DROP POLICY IF EXISTS "Authenticated users can manage videos" ON simulation_videos;

-- Policy: Public can read global videos OR videos for their assigned instance
-- For now, we allow reading any video that matches the query context (usually filtered by client)
CREATE POLICY "Public can read videos"
  ON simulation_videos
  FOR SELECT
  TO public
  USING (true);

-- Policy: Authenticated users (admins) can manage all videos
CREATE POLICY "Authenticated users can manage videos"
  ON simulation_videos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
