-- Add layout_config column to scene_configurations table
-- Stores the per-scene component layout (positions, visibility) set by the SceneBuilder

ALTER TABLE scene_configurations
  ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT NULL;

COMMENT ON COLUMN scene_configurations.layout_config IS
  'JSON layout configuration for the dynamic scene builder. Stores component positions, sizes, and visibility settings.';
