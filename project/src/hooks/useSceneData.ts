import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { SceneData } from '../data/scenesData';

export interface SceneConfiguration {
  id: string;
  scene_id: number;
  title: string;
  description: string;
  vitals_config?: any;
  quiz_questions?: any;
  action_prompts?: any;
  discussion_prompts?: string[];
  clinical_findings?: string[];
  scoring_categories?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSceneData = () => {
  const [sceneConfigurations, setSceneConfigurations] = useState<SceneConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSceneConfigurations = async (instanceId?: string) => {
    try {
      setLoading(true);
      setError(null);

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

      const { data, error } = await query;

      if (error) throw error;

      setSceneConfigurations(data || []);
    } catch (err) {
      console.error('Error fetching scene configurations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch scene configurations');
    } finally {
      setLoading(false);
    }
  };

  const saveSceneConfiguration = async (sceneData: SceneData, instanceId?: string): Promise<boolean> => {
    try {
      setError(null);

      const configurationData = {
        instance_id: instanceId || null,
        scene_id: parseInt(sceneData.id),
        title: sceneData.title,
        description: sceneData.description,
        vitals_config: sceneData.vitals,
        vitals_display_config: sceneData.vitalsDisplayConfig || null,
        quiz_questions: sceneData.quiz,
        action_prompts: sceneData.actionPrompt,
        discussion_prompts: sceneData.discussionPrompts,
        clinical_findings: sceneData.clinicalFindings,
        scoring_categories: sceneData.scoringCategories,
        layout_config: sceneData.layoutConfig || null,
        is_active: true
      };

      // Try to insert first
      const { data: insertData, error: insertError } = await supabase
        .from('scene_configurations')
        .insert([configurationData])
        .select()
        .single();

      if (insertError) {
        // If insert fails due to unique constraint, try update
        if (insertError.code === '23505') {
          let updateQuery = supabase
            .from('scene_configurations')
            .update({
              title: configurationData.title,
              description: configurationData.description,
              vitals_config: configurationData.vitals_config,
              vitals_display_config: configurationData.vitals_display_config,
              quiz_questions: configurationData.quiz_questions,
              action_prompts: configurationData.action_prompts,
              discussion_prompts: configurationData.discussion_prompts,
              clinical_findings: configurationData.clinical_findings,
              scoring_categories: configurationData.scoring_categories,
              layout_config: configurationData.layout_config,
              updated_at: new Date().toISOString()
            })
            .eq('scene_id', configurationData.scene_id);

          if (instanceId) {
            updateQuery = updateQuery.eq('instance_id', instanceId);
          } else {
            updateQuery = updateQuery.is('instance_id', null);
          }

          const { data: updateData, error: updateError } = await updateQuery.select().single();

          if (updateError) throw updateError;

          // Update local state
          setSceneConfigurations(prev =>
            prev.map(config =>
              config.scene_id === configurationData.scene_id
                ? { ...config, ...updateData }
                : config
            )
          );
        } else {
          throw insertError;
        }
      } else {
        // Insert successful, add to local state
        setSceneConfigurations(prev => [...prev, insertData]);
      }

      return true;
    } catch (err) {
      console.error('Error saving scene configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to save scene configuration');
      return false;
    }
  };

  const deleteSceneConfiguration = async (sceneId: number, instanceId?: string): Promise<boolean> => {
    try {
      setError(null);

      let query = supabase
        .from('scene_configurations')
        .delete()
        .eq('scene_id', sceneId);

      if (instanceId) {
        query = query.eq('instance_id', instanceId);
      } else {
        query = query.is('instance_id', null);
      }

      const { error } = await query;

      if (error) throw error;

      // Update local state
      setSceneConfigurations(prev => prev.filter(config => config.scene_id !== sceneId));

      return true;
    } catch (err) {
      console.error('Error deleting scene configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete scene configuration');
      return false;
    }
  };

  const updateSceneConfiguration = async (sceneId: number, updates: Partial<SceneConfiguration>, instanceId?: string): Promise<boolean> => {
    try {
      setError(null);

      let query = supabase
        .from('scene_configurations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('scene_id', sceneId);

      if (instanceId) {
        query = query.eq('instance_id', instanceId);
      } else {
        query = query.is('instance_id', null);
      }

      const { data, error } = await query.select().single();

      if (error) throw error;

      // Update local state
      setSceneConfigurations(prev =>
        prev.map(config =>
          config.scene_id === sceneId
            ? { ...config, ...data }
            : config
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating scene configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to update scene configuration');
      return false;
    }
  };

  const getSceneConfiguration = (sceneId: number): SceneConfiguration | undefined => {
    return sceneConfigurations.find(config => config.scene_id === sceneId);
  };

  const exportSceneConfiguration = (sceneId: number): string => {
    const config = getSceneConfiguration(sceneId);
    if (!config) return '';

    return JSON.stringify(config, null, 2);
  };

  const importSceneConfiguration = async (configData: string, instanceId?: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(configData);

      if (!parsed.scene_id || !parsed.title || !parsed.description) {
        throw new Error('Invalid configuration data');
      }

      return await saveSceneConfiguration(parsed as SceneData, instanceId);
    } catch (err) {
      console.error('Error importing scene configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to import scene configuration');
      return false;
    }
  };

  return {
    sceneConfigurations,
    loading,
    error,
    fetchSceneConfigurations,
    saveSceneConfiguration,
    deleteSceneConfiguration,
    updateSceneConfiguration,
    getSceneConfiguration,
    exportSceneConfiguration,
    importSceneConfiguration
  };
};