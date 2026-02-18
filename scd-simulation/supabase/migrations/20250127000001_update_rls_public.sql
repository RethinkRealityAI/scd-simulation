-- Allow public (anonymous) users to manage scenes
DROP POLICY IF EXISTS "Authenticated users can manage scene configurations" ON scene_configurations;

CREATE POLICY "Public can manage scene configurations"
  ON scene_configurations
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
