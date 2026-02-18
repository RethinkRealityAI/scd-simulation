-- Allow anon to manage simulation instances for development
-- This is necessary for the admin panel to function in a development environment without auth
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'simulation_instances') THEN
    DROP POLICY IF EXISTS "Anon can manage simulation instances" ON public.simulation_instances;
    
    CREATE POLICY "Anon can manage simulation instances"
      ON public.simulation_instances
      FOR ALL
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
