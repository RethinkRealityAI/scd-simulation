import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { scenes, SceneData } from '../data/scenesData';

/**
 * Hook to load scene configurations from database and merge with static defaults
 * This ensures that admin-configured scenes are used in the main app
 */
export const useSceneConfig = (sceneId: number, instanceId?: string) => {
  const [sceneData, setSceneData] = useState<SceneData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSceneConfig = async () => {
      try {
        setLoading(true);

        // Get static scene as fallback
        const staticScene = scenes[sceneId - 1];

        if (!staticScene) {
          console.error(`Scene ${sceneId} not found in static data`);
          setSceneData(null);
          setLoading(false);
          return;
        }

        // Try to load configuration from database
        let query = supabase
          .from('scene_configurations')
          .select('*')
          .eq('scene_id', sceneId)
          .eq('is_active', true);

        if (instanceId) {
          query = query.eq('instance_id', instanceId);
        } else {
          query = query.is('instance_id', null);
        }

        const { data: dbConfig, error } = await query.maybeSingle();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading scene configuration:', error);
        }

        if (dbConfig) {
          console.log(`✓ Loaded scene ${sceneId} configuration from database (Instance: ${instanceId || 'Global'})`);
          // Merge database config with static scene (database takes precedence)
          const mergedScene: SceneData = {
            ...staticScene,
            id: sceneId.toString(),
            title: dbConfig.title || staticScene.title,
            description: dbConfig.description || staticScene.description,
            vitals: dbConfig.vitals_config || staticScene.vitals,
            quiz: dbConfig.quiz_questions || staticScene.quiz,
            actionPrompt: dbConfig.action_prompts || staticScene.actionPrompt,
            discussionPrompts: dbConfig.discussion_prompts || staticScene.discussionPrompts,
            clinicalFindings: dbConfig.clinical_findings || staticScene.clinicalFindings,
            scoringCategories: dbConfig.scoring_categories || staticScene.scoringCategories,
          };
          setSceneData(mergedScene);
        } else {
          console.log(`Using static configuration for scene ${sceneId} (no database config found)`);
          setSceneData(staticScene);
        }
      } catch (err) {
        console.error('Error in loadSceneConfig:', err);
        // Fallback to static scene on error
        const staticScene = scenes[sceneId - 1];
        setSceneData(staticScene);
      } finally {
        setLoading(false);
      }
    };

    loadSceneConfig();
  }, [sceneId, instanceId]);

  return { sceneData, loading };
};

/**
 * Hook to load all scene configurations at once
 * Useful for lists or when you need all scenes
 */
export const useAllSceneConfigs = (instanceId?: string) => {
  const [allScenes, setAllScenes] = useState<SceneData[]>(scenes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllConfigs = async () => {
      try {
        setLoading(true);

        // Load all database configurations
        let query = supabase
          .from('scene_configurations')
          .select('*')
          .eq('is_active', true)
          .order('scene_id');

        if (instanceId) {
          query = query.eq('instance_id', instanceId);
        } else {
          query = query.is('instance_id', null);
        }

        const { data: dbConfigs, error } = await query;

        if (error) {
          console.error('Error loading scene configurations:', error);
          setAllScenes(scenes);
          setLoading(false);
          return;
        }

        if (dbConfigs && dbConfigs.length > 0) {
          console.log(`✓ Loaded ${dbConfigs.length} scene configurations from database (Instance: ${instanceId || 'Global'})`);

          // Merge each database config with its static counterpart
          const mergedScenes = scenes.map(staticScene => {
            const dbConfig = dbConfigs.find(config => config.scene_id === parseInt(staticScene.id));

            if (dbConfig) {
              return {
                ...staticScene,
                title: dbConfig.title || staticScene.title,
                description: dbConfig.description || staticScene.description,
                vitals: dbConfig.vitals_config || staticScene.vitals,
                quiz: dbConfig.quiz_questions || staticScene.quiz,
                actionPrompt: dbConfig.action_prompts || staticScene.actionPrompt,
                discussionPrompts: dbConfig.discussion_prompts || staticScene.discussionPrompts,
                clinicalFindings: dbConfig.clinical_findings || staticScene.clinicalFindings,
                scoringCategories: dbConfig.scoring_categories || staticScene.scoringCategories,
              } as SceneData;
            }

            return staticScene;
          });

          setAllScenes(mergedScenes);
        } else {
          console.log('No database configurations found, using static scenes');
          setAllScenes(scenes);
        }
      } catch (err) {
        console.error('Error in loadAllConfigs:', err);
        setAllScenes(scenes);
      } finally {
        setLoading(false);
      }
    };

    loadAllConfigs();
  }, [instanceId]);

  return { allScenes, loading };
};

