-- Scene Builder bootstrap migration
-- 1) Adds layout_config storage for dynamic canvas layouts
-- 2) Ensures vitals_display_config exists for monitor visibility/colors
-- 3) Expands scene_id check constraints to support custom scenes beyond 10

BEGIN;

-- ---------------------------------------------------------------------------
-- scene_configurations: new JSON columns used by Scene Builder
-- ---------------------------------------------------------------------------
ALTER TABLE public.scene_configurations
  ADD COLUMN IF NOT EXISTS layout_config JSONB;

ALTER TABLE public.scene_configurations
  ADD COLUMN IF NOT EXISTS vitals_display_config JSONB;

COMMENT ON COLUMN public.scene_configurations.layout_config IS
  'Dynamic scene builder layout (component positions, sizes, visibility).';

COMMENT ON COLUMN public.scene_configurations.vitals_display_config IS
  'Vitals monitor display settings (visibility, colors, thresholds).';

-- ---------------------------------------------------------------------------
-- Expand scene_id range checks to allow custom scene IDs up to 100
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  constraint_row RECORD;
BEGIN
  -- scene_configurations scene_id check constraints
  FOR constraint_row IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.scene_configurations'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%scene_id%'
  LOOP
    EXECUTE format('ALTER TABLE public.scene_configurations DROP CONSTRAINT %I', constraint_row.conname);
  END LOOP;

  -- simulation_videos scene_id check constraints
  FOR constraint_row IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.simulation_videos'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%scene_id%'
  LOOP
    EXECUTE format('ALTER TABLE public.simulation_videos DROP CONSTRAINT %I', constraint_row.conname);
  END LOOP;
END
$$;

ALTER TABLE public.scene_configurations
  ADD CONSTRAINT scene_configurations_scene_id_check
  CHECK (scene_id >= 1 AND scene_id <= 100);

ALTER TABLE public.simulation_videos
  ADD CONSTRAINT simulation_videos_scene_id_check
  CHECK (scene_id >= 1 AND scene_id <= 100);

COMMIT;
