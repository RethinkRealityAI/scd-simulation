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

interface SimulationVideoRecord {
  scene_id: number;
  video_url: string | null;
  poster_url?: string | null;
}

function applySceneVideo(
  scene: SceneData,
  videoRecord?: SimulationVideoRecord | null,
): SceneData {
  if (!videoRecord) return scene;

  return {
    ...scene,
    videoUrl: videoRecord.video_url || scene.videoUrl,
    posterUrl: videoRecord.poster_url || scene.posterUrl,
  };
}

function buildMergedScene(
  templateScene: SceneData,
  sceneId: number,
  dbConfig: any,
  videoRecord?: SimulationVideoRecord | null,
): SceneData {
  return applySceneVideo(
    {
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
    },
    videoRecord,
  );
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
        let resolvedVideo: SimulationVideoRecord | null = null;

        if (instanceId) {
          const [
            { data: instanceConfig, error: instanceError },
            { data: globalConfig, error: globalError },
            { data: instanceVideo, error: instanceVideoError },
            { data: globalVideo, error: globalVideoError },
          ] = await Promise.all([
            supabase
              .from('scene_configurations')
              .select('*')
              .eq('scene_id', sceneId)
              .eq('is_active', true)
              .eq('instance_id', instanceId)
              .maybeSingle(),
            supabase
              .from('scene_configurations')
              .select('*')
              .eq('scene_id', sceneId)
              .eq('is_active', true)
              .is('instance_id', null)
              .maybeSingle(),
            supabase
              .from('simulation_videos')
              .select('scene_id, video_url, poster_url')
              .eq('scene_id', sceneId)
              .eq('instance_id', instanceId)
              .maybeSingle(),
            supabase
              .from('simulation_videos')
              .select('scene_id, video_url, poster_url')
              .eq('scene_id', sceneId)
              .is('instance_id', null)
              .maybeSingle(),
          ]);

          if (instanceError && instanceError.code !== 'PGRST116') {
            console.error('Error loading instance scene configuration:', instanceError);
          }
          if (globalError && globalError.code !== 'PGRST116') {
            console.error('Error loading global fallback scene configuration:', globalError);
          }
          if (instanceVideoError && instanceVideoError.code !== 'PGRST116') {
            console.error('Error loading instance scene video:', instanceVideoError);
          }
          if (globalVideoError && globalVideoError.code !== 'PGRST116') {
            console.error('Error loading global fallback scene video:', globalVideoError);
          }

          dbConfig = instanceConfig || globalConfig;
          resolvedVideo = instanceVideo || globalVideo;
        } else {
          const [
            { data, error },
            { data: videoData, error: videoError },
          ] = await Promise.all([
            supabase
              .from('scene_configurations')
              .select('*')
              .eq('scene_id', sceneId)
              .eq('is_active', true)
              .is('instance_id', null)
              .maybeSingle(),
            supabase
              .from('simulation_videos')
              .select('scene_id, video_url, poster_url')
              .eq('scene_id', sceneId)
              .is('instance_id', null)
              .maybeSingle(),
          ]);

          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error loading scene configuration:', error);
          }
          if (videoError && videoError.code !== 'PGRST116') {
            console.error('Error loading scene video:', videoError);
          }

          dbConfig = data;
          resolvedVideo = videoData;
        }

        if (dbConfig) {
          setSceneData(buildMergedScene(templateScene, sceneId, dbConfig, resolvedVideo));
        } else {
          setSceneData(applySceneVideo(staticScene || templateScene, resolvedVideo));
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
            { data: instanceVideos, error: instanceVideosError },
            { data: globalVideos, error: globalVideosError },
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
            supabase
              .from('simulation_videos')
              .select('scene_id, video_url, poster_url')
              .eq('instance_id', instanceId)
              .order('scene_id'),
            supabase
              .from('simulation_videos')
              .select('scene_id, video_url, poster_url')
              .is('instance_id', null)
              .order('scene_id'),
          ]);

          if (instanceError || globalError) {
            console.error('Error loading scene configurations:', instanceError || globalError);
            setAllScenes(scenes);
            setLoading(false);
            return;
          }
          if (instanceVideosError || globalVideosError) {
            console.error('Error loading scene videos:', instanceVideosError || globalVideosError);
          }

          const instanceById = new Map((instanceConfigs || []).map(config => [config.scene_id, config]));
          const globalById = new Map((globalConfigs || []).map(config => [config.scene_id, config]));
          const instanceVideosById = new Map((instanceVideos || []).map(video => [video.scene_id, video]));
          const globalVideosById = new Map((globalVideos || []).map(video => [video.scene_id, video]));

          const mergedStaticScenes = scenes.map(staticScene => {
            const sceneId = parseInt(staticScene.id, 10);
            const dbConfig = instanceById.get(sceneId) || globalById.get(sceneId);
            const videoRecord = instanceVideosById.get(sceneId) || globalVideosById.get(sceneId);

            if (!dbConfig) return applySceneVideo(staticScene, videoRecord);

            return buildMergedScene(staticScene, sceneId, dbConfig, videoRecord);
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

              const videoRecord = instanceVideosById.get(dbConfig.scene_id) || globalVideosById.get(dbConfig.scene_id);

              return buildMergedScene(templateScene, dbConfig.scene_id, dbConfig, videoRecord);
            });

          setAllScenes(
            [...mergedStaticScenes, ...extraInstanceScenes]
              .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10)),
          );
        } else {
          // Load all database configurations
          const [
            { data: dbConfigs, error },
            { data: globalVideos, error: globalVideosError },
          ] = await Promise.all([
            supabase
              .from('scene_configurations')
              .select('*')
              .eq('is_active', true)
              .is('instance_id', null)
              .order('scene_id'),
            supabase
              .from('simulation_videos')
              .select('scene_id, video_url, poster_url')
              .is('instance_id', null)
              .order('scene_id'),
          ]);

          if (error) {
            console.error('Error loading scene configurations:', error);
            setAllScenes(scenes);
            setLoading(false);
            return;
          }
          if (globalVideosError) {
            console.error('Error loading scene videos:', globalVideosError);
          }

          const globalVideosById = new Map((globalVideos || []).map(video => [video.scene_id, video]));

          const configsById = new Map((dbConfigs || []).map(config => [config.scene_id, config]));
          const mergedStaticScenes = scenes.map(staticScene => {
            const sceneId = parseInt(staticScene.id, 10);
            const dbConfig = configsById.get(sceneId);
            const videoRecord = globalVideosById.get(sceneId);

            if (!dbConfig) return applySceneVideo(staticScene, videoRecord);

            return buildMergedScene(staticScene, sceneId, dbConfig, videoRecord);
          });

          setAllScenes(mergedStaticScenes);
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

