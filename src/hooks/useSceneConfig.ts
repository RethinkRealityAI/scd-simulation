import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  scenes,
  SceneData,
  normalizeActionPromptConfig,
  normalizeSceneLayoutConfig,
} from '../data/scenesData';

/**
 * Returns true only when `val` carries meaningful content.
 * Empty arrays `[]` and empty quiz objects `{ questions: [] }` are treated as
 * absent so that the static fallback is used instead of an empty DB record
 * silently overriding hardcoded scene data.
 */
function hasValue(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === 'object') {
    const asQuiz = val as { questions?: unknown[] };
    if ('questions' in asQuiz) return Array.isArray(asQuiz.questions) && asQuiz.questions.length > 0;
    const asAction = val as { type?: string };
    if ('type' in asAction) return typeof asAction.type === 'string' && asAction.type.length > 0;
    return Object.keys(val as object).length > 0;
  }
  return Boolean(val);
}

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
        const staticScene = scenes.find(scene => parseInt(scene.id, 10) === sceneId);
        const templateScene = staticScene ?? {
          ...scenes[0],
          id: sceneId.toString(),
          title: `Scene ${sceneId}`,
          description: '',
          videoUrl: '',
          clinicalFindings: [],
          discussionPrompts: [],
          scoringCategories: [],
          quiz: undefined,
          actionPrompt: undefined,
        };

        let dbConfig: any = null;

        if (instanceId) {
          const { data: instanceConfig, error: instanceError } = await supabase
            .from('scene_configurations')
            .select('*')
            .eq('scene_id', sceneId)
            .eq('is_active', true)
            .eq('instance_id', instanceId)
            .maybeSingle();

          if (instanceError && instanceError.code !== 'PGRST116') {
            console.error('Error loading instance scene configuration:', instanceError);
          }

          dbConfig = instanceConfig;

          // Safe fallback: if the instance does not override this scene,
          // fall back to the base/global scene configuration.
          if (!dbConfig) {
            const { data: globalConfig, error: globalError } = await supabase
              .from('scene_configurations')
              .select('*')
              .eq('scene_id', sceneId)
              .eq('is_active', true)
              .is('instance_id', null)
              .maybeSingle();

            if (globalError && globalError.code !== 'PGRST116') {
              console.error('Error loading global fallback scene configuration:', globalError);
            }

            dbConfig = globalConfig;
          }
        } else {
          const { data, error } = await supabase
            .from('scene_configurations')
            .select('*')
            .eq('scene_id', sceneId)
            .eq('is_active', true)
            .is('instance_id', null)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error loading scene configuration:', error);
          }

          dbConfig = data;
        }

        if (dbConfig) {
          // Merge database config with static scene (database takes precedence only when non-empty)
          const mergedScene: SceneData = {
            ...templateScene,
            id: sceneId.toString(),
            title: dbConfig.title || templateScene.title,
            description: dbConfig.description || templateScene.description,
            vitals: hasValue(dbConfig.vitals_config) ? dbConfig.vitals_config : templateScene.vitals,
            vitalsDisplayConfig: hasValue(dbConfig.vitals_display_config) ? dbConfig.vitals_display_config : templateScene.vitalsDisplayConfig,
            quiz: hasValue(dbConfig.quiz_questions) ? dbConfig.quiz_questions : templateScene.quiz,
            actionPrompt: normalizeActionPromptConfig(
              hasValue(dbConfig.action_prompts) ? dbConfig.action_prompts : templateScene.actionPrompt,
              templateScene.actionPrompt,
            ),
            discussionPrompts: hasValue(dbConfig.discussion_prompts) ? dbConfig.discussion_prompts : templateScene.discussionPrompts,
            clinicalFindings: hasValue(dbConfig.clinical_findings) ? dbConfig.clinical_findings : templateScene.clinicalFindings,
            scoringCategories: hasValue(dbConfig.scoring_categories) ? dbConfig.scoring_categories : templateScene.scoringCategories,
            layoutConfig: normalizeSceneLayoutConfig(
              hasValue(dbConfig.layout_config) ? dbConfig.layout_config : templateScene.layoutConfig,
            ),
          };
          setSceneData(mergedScene);
        } else {
          setSceneData(staticScene || null);
        }
      } catch (err) {
        console.error('Error in loadSceneConfig:', err);
        const staticScene = scenes.find(scene => parseInt(scene.id, 10) === sceneId);
        setSceneData(staticScene || null);
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
  const [allScenes, setAllScenes] = useState<SceneData[]>(instanceId ? [] : scenes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllConfigs = async () => {
      try {
        setLoading(true);

        if (instanceId) {
          const [
            { data: instanceConfigs, error: instanceError },
            { data: globalConfigs, error: globalError },
          ] = await Promise.all([
            supabase
              .from('scene_configurations')
              .select('*')
              .eq('is_active', true)
              .eq('instance_id', instanceId)
              .order('scene_id'),
            supabase
              .from('scene_configurations')
              .select('*')
              .eq('is_active', true)
              .is('instance_id', null)
              .order('scene_id'),
          ]);

          if (instanceError || globalError) {
            console.error('Error loading scene configurations:', instanceError || globalError);
            setAllScenes(scenes);
            setLoading(false);
            return;
          }

          const instanceById = new Map((instanceConfigs || []).map(config => [config.scene_id, config]));
          const globalById = new Map((globalConfigs || []).map(config => [config.scene_id, config]));

          const mergedStaticScenes = scenes.map(staticScene => {
            const sceneId = parseInt(staticScene.id, 10);
            const dbConfig = instanceById.get(sceneId) || globalById.get(sceneId);
            if (!dbConfig) return staticScene;

            return {
              ...staticScene,
              title: dbConfig.title || staticScene.title,
              description: dbConfig.description || staticScene.description,
              vitals: hasValue(dbConfig.vitals_config) ? dbConfig.vitals_config : staticScene.vitals,
              vitalsDisplayConfig: hasValue(dbConfig.vitals_display_config) ? dbConfig.vitals_display_config : staticScene.vitalsDisplayConfig,
              quiz: hasValue(dbConfig.quiz_questions) ? dbConfig.quiz_questions : staticScene.quiz,
              actionPrompt: normalizeActionPromptConfig(
                hasValue(dbConfig.action_prompts) ? dbConfig.action_prompts : staticScene.actionPrompt,
                staticScene.actionPrompt,
              ),
              discussionPrompts: hasValue(dbConfig.discussion_prompts) ? dbConfig.discussion_prompts : staticScene.discussionPrompts,
              clinicalFindings: hasValue(dbConfig.clinical_findings) ? dbConfig.clinical_findings : staticScene.clinicalFindings,
              scoringCategories: hasValue(dbConfig.scoring_categories) ? dbConfig.scoring_categories : staticScene.scoringCategories,
              layoutConfig: normalizeSceneLayoutConfig(
                hasValue(dbConfig.layout_config) ? dbConfig.layout_config : staticScene.layoutConfig,
              ),
            } as SceneData;
          });

          const extraInstanceScenes = (instanceConfigs || [])
            .filter(dbConfig => !scenes.some(staticScene => parseInt(staticScene.id, 10) === dbConfig.scene_id))
            .map(dbConfig => {
              const templateScene = {
                ...scenes[0],
                id: dbConfig.scene_id.toString(),
                title: `Scene ${dbConfig.scene_id}`,
                description: '',
                videoUrl: '',
                clinicalFindings: [],
                discussionPrompts: [],
                scoringCategories: [],
                quiz: undefined,
                actionPrompt: undefined,
              };

              return {
                ...templateScene,
                id: dbConfig.scene_id.toString(),
                title: dbConfig.title || templateScene.title,
                description: dbConfig.description || templateScene.description,
                vitals: hasValue(dbConfig.vitals_config) ? dbConfig.vitals_config : templateScene.vitals,
                vitalsDisplayConfig: hasValue(dbConfig.vitals_display_config) ? dbConfig.vitals_display_config : templateScene.vitalsDisplayConfig,
                quiz: hasValue(dbConfig.quiz_questions) ? dbConfig.quiz_questions : templateScene.quiz,
                actionPrompt: normalizeActionPromptConfig(
                  hasValue(dbConfig.action_prompts) ? dbConfig.action_prompts : templateScene.actionPrompt,
                  templateScene.actionPrompt,
                ),
                discussionPrompts: hasValue(dbConfig.discussion_prompts) ? dbConfig.discussion_prompts : templateScene.discussionPrompts,
                clinicalFindings: hasValue(dbConfig.clinical_findings) ? dbConfig.clinical_findings : templateScene.clinicalFindings,
                scoringCategories: hasValue(dbConfig.scoring_categories) ? dbConfig.scoring_categories : templateScene.scoringCategories,
                layoutConfig: normalizeSceneLayoutConfig(
                  hasValue(dbConfig.layout_config) ? dbConfig.layout_config : templateScene.layoutConfig,
                ),
              } as SceneData;
            });

          setAllScenes(
            [...mergedStaticScenes, ...extraInstanceScenes]
              .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10)),
          );
        } else {
          // Load all database configurations
          const { data: dbConfigs, error } = await supabase
            .from('scene_configurations')
            .select('*')
            .eq('is_active', true)
            .is('instance_id', null)
            .order('scene_id');

          if (error) {
            console.error('Error loading scene configurations:', error);
            setAllScenes(scenes);
            setLoading(false);
            return;
          }

          if (dbConfigs && dbConfigs.length > 0) {
            // Global scope: preserve static scenes and overlay db config.
            const mergedStaticScenes = scenes.map(staticScene => {
              const dbConfig = dbConfigs.find(config => config.scene_id === parseInt(staticScene.id, 10));
              if (!dbConfig) return staticScene;

              return {
                ...staticScene,
                title: dbConfig.title || staticScene.title,
                description: dbConfig.description || staticScene.description,
                vitals: hasValue(dbConfig.vitals_config) ? dbConfig.vitals_config : staticScene.vitals,
                vitalsDisplayConfig: hasValue(dbConfig.vitals_display_config) ? dbConfig.vitals_display_config : staticScene.vitalsDisplayConfig,
                quiz: hasValue(dbConfig.quiz_questions) ? dbConfig.quiz_questions : staticScene.quiz,
                actionPrompt: normalizeActionPromptConfig(
                  hasValue(dbConfig.action_prompts) ? dbConfig.action_prompts : staticScene.actionPrompt,
                  staticScene.actionPrompt,
                ),
                discussionPrompts: hasValue(dbConfig.discussion_prompts) ? dbConfig.discussion_prompts : staticScene.discussionPrompts,
                clinicalFindings: hasValue(dbConfig.clinical_findings) ? dbConfig.clinical_findings : staticScene.clinicalFindings,
                scoringCategories: hasValue(dbConfig.scoring_categories) ? dbConfig.scoring_categories : staticScene.scoringCategories,
                layoutConfig: normalizeSceneLayoutConfig(
                  hasValue(dbConfig.layout_config) ? dbConfig.layout_config : staticScene.layoutConfig,
                ),
              } as SceneData;
            });

            setAllScenes(mergedStaticScenes);
          } else {
            setAllScenes(scenes);
          }
        }
      } catch (err) {
        console.error('Error in loadAllConfigs:', err);
        setAllScenes(instanceId ? [] : scenes);
      } finally {
        setLoading(false);
      }
    };

    loadAllConfigs();
  }, [instanceId]);

  return { allScenes, loading };
};

