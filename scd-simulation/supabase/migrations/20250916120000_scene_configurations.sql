/*
  # Scene Configuration Management

  1. New Tables
    - `scene_configurations`
      - `id` (uuid, primary key)
      - `scene_id` (integer, 1-10)
      - `title` (text)
      - `description` (text)
      - `quiz_questions` (jsonb)
      - `action_prompts` (jsonb)
      - `discussion_prompts` (jsonb)
      - `clinical_findings` (jsonb)
      - `scoring_categories` (jsonb)
      - `vitals_config` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `version` (integer)
      - `is_active` (boolean)

    - `user_analytics`
      - `id` (uuid, primary key)
      - `session_id` (text)
      - `user_demographics` (jsonb)
      - `responses` (jsonb)
      - `category_scores` (jsonb)
      - `final_score` (integer)
      - `completion_time` (integer)
      - `completed_scenes` (jsonb)
      - `submission_timestamp` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated admin access
    - Add policies for public read access where appropriate
*/

-- Create scene_configurations table
CREATE TABLE IF NOT EXISTS scene_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id integer UNIQUE NOT NULL CHECK (scene_id >= 1 AND scene_id <= 10),
  title text NOT NULL,
  description text NOT NULL,
  quiz_questions jsonb DEFAULT '[]'::jsonb,
  action_prompts jsonb DEFAULT '{}'::jsonb,
  discussion_prompts jsonb DEFAULT '[]'::jsonb,
  clinical_findings jsonb DEFAULT '[]'::jsonb,
  scoring_categories jsonb DEFAULT '[]'::jsonb,
  vitals_config jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  version integer DEFAULT 1,
  is_active boolean DEFAULT true
);

-- Create user_analytics table for storing user performance data
CREATE TABLE IF NOT EXISTS user_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  user_demographics jsonb NOT NULL,
  responses jsonb DEFAULT '[]'::jsonb,
  category_scores jsonb DEFAULT '{}'::jsonb,
  final_score integer DEFAULT 0,
  completion_time integer DEFAULT 0,
  completed_scenes jsonb DEFAULT '[]'::jsonb,
  submission_timestamp timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE scene_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for scene_configurations
DROP POLICY IF EXISTS "Public can read active scene configurations" ON scene_configurations;
CREATE POLICY "Public can read active scene configurations"
  ON scene_configurations
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage scene configurations" ON scene_configurations;
CREATE POLICY "Authenticated users can manage scene configurations"
  ON scene_configurations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for user_analytics
DROP POLICY IF EXISTS "Authenticated users can read analytics" ON user_analytics;
CREATE POLICY "Authenticated users can read analytics"
  ON user_analytics
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert analytics" ON user_analytics;
CREATE POLICY "Anyone can insert analytics"
  ON user_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create updated_at triggers
DROP TRIGGER IF EXISTS update_scene_configurations_updated_at ON scene_configurations;
CREATE TRIGGER update_scene_configurations_updated_at
  BEFORE UPDATE ON scene_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scene_configurations_scene_id ON scene_configurations(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_configurations_active ON scene_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_user_analytics_session ON user_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_timestamp ON user_analytics(submission_timestamp);

-- Insert default scene configurations (based on existing scenesData.ts)
INSERT INTO scene_configurations (scene_id, title, description, vitals_config, quiz_questions, action_prompts, discussion_prompts, scoring_categories) VALUES 
(1, 'Scene 1: EMS Handoff', 'Tobiloba "Tobi" Johnson, a 15-year-old with sickle cell disease, is being handed off from EMS to the emergency department team.', 
 '{"heartRate": 126, "systolic": 126, "diastolic": 79, "respiratoryRate": 24, "oxygenSaturation": 98, "temperature": 37.0, "isAlarmOn": true, "patientName": "Johnson, Tobiloba \"Tobi\"", "age": 15, "bedNumber": "008", "mrn": "14839412"}',
 '[]',
 '{"type": "action-selection", "title": "Select initial actions for Tobi''s care:", "content": "Choose the most appropriate initial interventions for a 15-year-old with sickle cell disease presenting with severe pain.", "options": ["A. Delay meds and observe", "B. Begin focused assessment, establish IV, draw labs", "C. Administer oral meds and discharge"], "correctAnswers": ["B. Begin focused assessment, establish IV, draw labs"], "explanation": "Early aggressive management of VOC is key. Delay can worsen outcomes and risk ACS."}',
 '["What might the consequences of selecting \"Delay meds and observe\" or \"Administer oral meds and discharge\" be?", "How can implicit bias affect provider responses to Black youth presenting with pain?"]',
 '["timelyPainManagement", "clinicalJudgment"]')
ON CONFLICT (scene_id) DO NOTHING;

-- Add comment
COMMENT ON TABLE scene_configurations IS 'Stores configurable scene content including quiz questions, action prompts, and discussion prompts';
COMMENT ON TABLE user_analytics IS 'Stores user performance data and analytics for reporting and research purposes';



