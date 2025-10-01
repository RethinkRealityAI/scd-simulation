import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SceneData } from '../data/scenesData';

export interface SceneConfiguration {
  id: string;
  scene_id: number;
  title: string;
  description: string;
  quiz_questions: any;
  action_prompts: any;
  discussion_prompts: string[];
  clinical_findings: string[];
  scoring_categories: string[];
  vitals_config: any;
  created_at: string;
  updated_at: string;
  version: number;
  is_active: boolean;
}

export const useSceneData = () => {
  const [sceneConfigs, setSceneConfigs] = useState<SceneConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSceneConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('scene_configurations')
        .select('*')
        .eq('is_active', true)
        .order('scene_id', { ascending: true });

      if (fetchError) throw fetchError;

      setSceneConfigs(data || []);
    } catch (err) {
      console.error('Error fetching scene configurations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch scene configurations');
    } finally {
      setLoading(false);
    }
  };

  const saveSceneConfiguration = async (sceneData: SceneData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Check if configuration exists for this scene
      const { data: existing } = await supabase
        .from('scene_configurations')
        .select('id, version')
        .eq('scene_id', parseInt(sceneData.id))
        .eq('is_active', true)
        .single();

      const configData = {
        scene_id: parseInt(sceneData.id),
        title: sceneData.title,
        description: sceneData.description,
        quiz_questions: sceneData.quiz || { questions: [] },
        action_prompts: sceneData.actionPrompt || {},
        discussion_prompts: sceneData.discussionPrompts || [],
        clinical_findings: sceneData.clinicalFindings || [],
        scoring_categories: sceneData.scoringCategories || [],
        vitals_config: sceneData.vitals,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        // Update existing configuration
        const { error: updateError } = await supabase
          .from('scene_configurations')
          .update({
            ...configData,
            version: existing.version + 1,
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Insert new configuration
        const { error: insertError } = await supabase
          .from('scene_configurations')
          .insert([{
            ...configData,
            version: 1,
            is_active: true,
          }]);

        if (insertError) throw insertError;
      }

      // Refresh configurations
      await fetchSceneConfigurations();
      return true;
    } catch (err) {
      console.error('Error saving scene configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to save scene configuration');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getSceneConfiguration = async (sceneId: number): Promise<SceneConfiguration | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('scene_configurations')
        .select('*')
        .eq('scene_id', sceneId)
        .eq('is_active', true)
        .single();

      if (fetchError) {
        console.log('No custom configuration found, using defaults');
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error fetching scene configuration:', err);
      return null;
    }
  };

  const deleteSceneConfiguration = async (sceneId: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('scene_configurations')
        .update({ is_active: false })
        .eq('scene_id', sceneId);

      if (deleteError) throw deleteError;

      await fetchSceneConfigurations();
      return true;
    } catch (err) {
      console.error('Error deleting scene configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete scene configuration');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const exportSceneConfiguration = async (sceneId: number): Promise<string | null> => {
    try {
      const config = await getSceneConfiguration(sceneId);
      if (!config) return null;

      return JSON.stringify(config, null, 2);
    } catch (err) {
      console.error('Error exporting scene configuration:', err);
      return null;
    }
  };

  const importSceneConfiguration = async (jsonData: string): Promise<boolean> => {
    try {
      const config = JSON.parse(jsonData);
      
      const sceneData: SceneData = {
        id: config.scene_id.toString(),
        title: config.title,
        description: config.description,
        videoUrl: '',
        vitals: config.vitals_config,
        quiz: config.quiz_questions,
        actionPrompt: config.action_prompts,
        discussionPrompts: config.discussion_prompts,
        clinicalFindings: config.clinical_findings,
        scoringCategories: config.scoring_categories,
      };

      return await saveSceneConfiguration(sceneData);
    } catch (err) {
      console.error('Error importing scene configuration:', err);
      setError('Invalid configuration file format');
      return false;
    }
  };

  useEffect(() => {
    fetchSceneConfigurations();
  }, []);

  return {
    sceneConfigs,
    loading,
    error,
    saveSceneConfiguration,
    getSceneConfiguration,
    deleteSceneConfiguration,
    exportSceneConfiguration,
    importSceneConfiguration,
    refetch: fetchSceneConfigurations,
  };
};

