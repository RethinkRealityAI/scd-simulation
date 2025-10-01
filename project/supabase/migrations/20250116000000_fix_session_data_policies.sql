/*
  # Fix Session Data RLS Policies

  1. Enable RLS on session_data table
  2. Create policies for public insert and authenticated read access
*/

-- Enable RLS on session_data table
ALTER TABLE session_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert session data" ON session_data;
DROP POLICY IF EXISTS "Authenticated users can read session data" ON session_data;

-- Create policy to allow anyone to insert session data (for user submissions)
CREATE POLICY "Anyone can insert session data"
  ON session_data
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy to allow authenticated users to read all session data (for admin analytics)
CREATE POLICY "Authenticated users can read session data"
  ON session_data
  FOR SELECT
  TO authenticated
  USING (true);

-- Optional: Allow public read access if you want anonymous analytics viewing
-- Uncomment the lines below if needed:
-- CREATE POLICY "Public can read session data"
--   ON session_data
--   FOR SELECT
--   TO public
--   USING (true);



