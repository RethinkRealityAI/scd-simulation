import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SceneOrderItem {
  id: string;
  scene_id: number;
  display_order: number;
  is_completion_scene: boolean;
  is_active: boolean;
}

export interface SceneManagementSettings {
  max_scenes: number;
  allow_custom_scenes: boolean;
  completion_scene_required: boolean;
}

export const useSceneOrdering = () => {
  const [sceneOrder, setSceneOrder] = useState<SceneOrderItem[]>([]);
  const [settings, setSettings] = useState<SceneManagementSettings>({
    max_scenes: 20,
    allow_custom_scenes: true,
    completion_scene_required: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch scene order from database
  const fetchSceneOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('scene_order')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setSceneOrder(data || []);
    } catch (err) {
      console.error('Error fetching scene order:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch scene order');
    } finally {
      setLoading(false);
    }
  };

  // Fetch management settings
  const fetchSettings = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('scene_management_settings')
        .select('setting_key, setting_value');

      if (fetchError) throw fetchError;

      if (data) {
        const settingsMap: Partial<SceneManagementSettings> = {};
        data.forEach(item => {
          switch (item.setting_key) {
            case 'max_scenes':
              settingsMap.max_scenes = parseInt(item.setting_value as string);
              break;
            case 'allow_custom_scenes':
              settingsMap.allow_custom_scenes = item.setting_value as boolean;
              break;
            case 'completion_scene_required':
              settingsMap.completion_scene_required = item.setting_value as boolean;
              break;
          }
        });
        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  // Update scene order
  const updateSceneOrder = async (newOrder: SceneOrderItem[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Update each scene order item
      for (const item of newOrder) {
        const { error: updateError } = await supabase
          .from('scene_order')
          .update({
            display_order: item.display_order,
            is_completion_scene: item.is_completion_scene,
            updated_at: new Date().toISOString()
          })
          .eq('scene_id', item.scene_id);

        if (updateError) throw updateError;
      }

      await fetchSceneOrder();
      return true;
    } catch (err) {
      console.error('Error updating scene order:', err);
      setError(err instanceof Error ? err.message : 'Failed to update scene order');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Set completion scene
  const setCompletionScene = async (sceneId: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // First, unset all completion scenes
      const { error: unsetError } = await supabase
        .from('scene_order')
        .update({ is_completion_scene: false })
        .eq('is_active', true);

      if (unsetError) throw unsetError;

      // Then set the new completion scene
      const { error: setCompletionError } = await supabase
        .from('scene_order')
        .update({ is_completion_scene: true })
        .eq('scene_id', sceneId);

      if (setCompletionError) throw setCompletionError;

      await fetchSceneOrder();
      return true;
    } catch (err) {
      console.error('Error setting completion scene:', err);
      setError(err instanceof Error ? err.message : 'Failed to set completion scene');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Add new scene to order
  const addSceneToOrder = async (sceneId: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Get the next display order
      const maxOrder = Math.max(...sceneOrder.map(s => s.display_order), 0);
      const nextOrder = maxOrder + 1;

      const { error: insertError } = await supabase
        .from('scene_order')
        .insert({
          scene_id: sceneId,
          display_order: nextOrder,
          is_completion_scene: false,
          is_active: true
        });

      if (insertError) throw insertError;

      await fetchSceneOrder();
      return true;
    } catch (err) {
      console.error('Error adding scene to order:', err);
      setError(err instanceof Error ? err.message : 'Failed to add scene to order');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove scene from order
  const removeSceneFromOrder = async (sceneId: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('scene_order')
        .update({ is_active: false })
        .eq('scene_id', sceneId);

      if (deleteError) throw deleteError;

      await fetchSceneOrder();
      return true;
    } catch (err) {
      console.error('Error removing scene from order:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove scene from order');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reorder scenes
  const reorderScenes = async (reorderedItems: SceneOrderItem[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Update each item with new order
      for (let i = 0; i < reorderedItems.length; i++) {
        const item = reorderedItems[i];
        const { error: updateError } = await supabase
          .from('scene_order')
          .update({
            display_order: i + 1,
            updated_at: new Date().toISOString()
          })
          .eq('scene_id', item.scene_id);

        if (updateError) throw updateError;
      }

      await fetchSceneOrder();
      return true;
    } catch (err) {
      console.error('Error reordering scenes:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder scenes');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get completion scene
  const getCompletionScene = (): SceneOrderItem | null => {
    return sceneOrder.find(scene => scene.is_completion_scene) || null;
  };

  // Get ordered scenes
  const getOrderedScenes = (): SceneOrderItem[] => {
    return [...sceneOrder].sort((a, b) => a.display_order - b.display_order);
  };

  // Check if can add more scenes
  const canAddMoreScenes = (): boolean => {
    return sceneOrder.length < settings.max_scenes && settings.allow_custom_scenes;
  };

  useEffect(() => {
    fetchSceneOrder();
    fetchSettings();
  }, []);

  return {
    sceneOrder,
    settings,
    loading,
    error,
    updateSceneOrder,
    setCompletionScene,
    addSceneToOrder,
    removeSceneFromOrder,
    reorderScenes,
    getCompletionScene,
    getOrderedScenes,
    canAddMoreScenes,
    refetch: fetchSceneOrder
  };
};
