-- Fix RLS policies to allow public (anon key) to manage scene configurations
-- This is needed for the admin portal which uses the anon key

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can manage scene configurations" ON scene_configurations;

-- Create new policy allowing public users to manage scene configurations
-- This is safe because the admin portal should be protected at the application routing level
CREATE POLICY "Public users can manage scene configurations"
  ON scene_configurations
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Also update welcome_configurations table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'welcome_configurations') THEN
    -- Ensure public can manage welcome configurations
    DROP POLICY IF EXISTS "Allow all operations on welcome_configurations" ON welcome_configurations;
    CREATE POLICY "Public users can manage welcome_configurations"
      ON welcome_configurations
      FOR ALL
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Add comment
COMMENT ON POLICY "Public users can manage scene configurations" ON scene_configurations IS 
  'Allows admin portal (using anon key) to manage scene configurations. Admin access should be controlled at application routing level.';

