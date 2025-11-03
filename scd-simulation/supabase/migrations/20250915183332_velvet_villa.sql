/*
  # Add auto-play functionality to audio files

  1. Changes
    - Add `auto_play` boolean column to `scene_audio_files` table
    - Set default value to false
    - Update existing records to have auto_play = false

  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scene_audio_files' AND column_name = 'auto_play'
  ) THEN
    ALTER TABLE scene_audio_files ADD COLUMN auto_play boolean DEFAULT false;
  END IF;
END $$;