-- Allow public (anonymous) users to manage simulation instances
DROP POLICY IF EXISTS "Authenticated users can manage simulation instances" ON simulation_instances;

CREATE POLICY "Public can manage simulation instances"
  ON simulation_instances
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow public (anonymous) users to manage access tokens
DROP POLICY IF EXISTS "Authenticated users can manage access tokens" ON instance_access_tokens;

CREATE POLICY "Public can manage access tokens"
  ON instance_access_tokens
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
