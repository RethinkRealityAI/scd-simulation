import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchSceneConfigurations();
  }, []);

  const fetchSceneConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('scene_configurations')
        .select('*')
        .eq('is_active', true)
        .order('scene_id');

      if (error) throw error;
      
      setSceneConfigurations(data || []);
    } catch (err) {
      console.error('Error fetching scene configurations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch scene configurations');
    } finally {
      setLoading(false);
    }
  };

  const saveSceneConfiguration = async (sceneData: SceneData): Promise<boolean> => {
    try {
      setError(null);
      
      const configurationData = {
        scene_id: parseInt(sceneData.id),
        title: sceneData.title,
        description: sceneData.description,
        vitals_config: sceneData.vitals,
        quiz_questions: sceneData.quiz,
        action_prompts: sceneData.actionPrompt,
        discussion_prompts: sceneData.discussionPrompts,
        clinical_findings: sceneData.clinicalFindings,
        scoring_categories: sceneData.scoringCategories,
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
          const { data: updateData, error: updateError } = await supabase
            .from('scene_configurations')
            .update({
              title: configurationData.title,
              description: configurationData.description,
              vitals_config: configurationData.vitals_config,
              quiz_questions: configurationData.quiz_questions,
              action_prompts: configurationData.action_prompts,
              discussion_prompts: configurationData.discussion_prompts,
              clinical_findings: configurationData.clinical_findings,
              scoring_categories: configurationData.scoring_categories,
              updated_at: new Date().toISOString()
            })
            .eq('scene_id', configurationData.scene_id)
            .select()
            .single();

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

  const deleteSceneConfiguration = async (sceneId: number): Promise<boolean> => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('scene_configurations')
        .delete()
        .eq('scene_id', sceneId);

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

  const updateSceneConfiguration = async (sceneId: number, updates: Partial<SceneConfiguration>): Promise<boolean> => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('scene_configurations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('scene_id', sceneId)
        .select()
        .single();

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

  const importSceneConfiguration = async (configData: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(configData);
      
      if (!parsed.scene_id || !parsed.title || !parsed.description) {
        throw new Error('Invalid configuration data');
      }
      
      return await saveSceneConfiguration(parsed as SceneData);
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