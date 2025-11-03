import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SceneOrderItem {
  id: string;
  scene_id: number;
  display_order: number;
  is_completion_scene: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSceneOrdering = () => {
  const [sceneOrder, setSceneOrder] = useState<SceneOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSceneOrder();
  }, []);

  const fetchSceneOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('scene_order')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      
      setSceneOrder(data || []);
    } catch (err) {
      console.error('Error fetching scene order:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch scene order');
    } finally {
      setLoading(false);
    }
  };

  const updateSceneOrder = async (newOrder: SceneOrderItem[]): Promise<boolean> => {
    try {
      setError(null);
      
      // Update each scene order item
      const updatePromises = newOrder.map((item, index) => 
        supabase
          .from('scene_order')
          .update({
            display_order: index + 1,
            updated_at: new Date().toISOString()
          })
          .eq('scene_id', item.scene_id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const hasError = results.some(result => result.error);
      if (hasError) {
        throw new Error('Failed to update some scene orders');
      }
      
      // Update local state
      setSceneOrder(newOrder);
      
      return true;
    } catch (err) {
      console.error('Error updating scene order:', err);
      setError(err instanceof Error ? err.message : 'Failed to update scene order');
      return false;
    }
  };

  const setCompletionScene = async (sceneId: number): Promise<boolean> => {
    try {
      setError(null);
      
      // First, remove completion status from all scenes
      const { error: clearError } = await supabase
        .from('scene_order')
        .update({
          is_completion_scene: false,
          updated_at: new Date().toISOString()
        })
        .eq('is_completion_scene', true);

      if (clearError) throw clearError;

      // Then set the new completion scene
      const { error: setError } = await supabase
        .from('scene_order')
        .update({
          is_completion_scene: true,
          updated_at: new Date().toISOString()
        })
        .eq('scene_id', sceneId);

      if (setError) throw setError;
      
      // Update local state
      setSceneOrder(prev => 
        prev.map(item => ({
          ...item,
          is_completion_scene: item.scene_id === sceneId
        }))
      );
      
      return true;
    } catch (err) {
      console.error('Error setting completion scene:', err);
      setError(err instanceof Error ? err.message : 'Failed to set completion scene');
      return false;
    }
  };

  const addSceneToOrder = async (sceneId: number): Promise<boolean> => {
    try {
      setError(null);
      
      // Get the next display order
      const maxOrder = Math.max(...sceneOrder.map(item => item.display_order), 0);
      const newOrder = maxOrder + 1;
      
      const { data, error } = await supabase
        .from('scene_order')
        .insert({
          scene_id: sceneId,
          display_order: newOrder,
          is_completion_scene: false,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setSceneOrder(prev => [...prev, data]);
      
      return true;
    } catch (err) {
      console.error('Error adding scene to order:', err);
      setError(err instanceof Error ? err.message : 'Failed to add scene to order');
      return false;
    }
  };

  const removeSceneFromOrder = async (sceneId: number): Promise<boolean> => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('scene_order')
        .delete()
        .eq('scene_id', sceneId);

      if (error) throw error;
      
      // Update local state
      setSceneOrder(prev => prev.filter(item => item.scene_id !== sceneId));
      
      return true;
    } catch (err) {
      console.error('Error removing scene from order:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove scene from order');
      return false;
    }
  };

  const reorderScenes = async (reorderedItems: SceneOrderItem[]): Promise<boolean> => {
    try {
      setError(null);
      
      // Update each item with new display order
      const updatePromises = reorderedItems.map((item, index) => 
        supabase
          .from('scene_order')
          .update({
            display_order: index + 1,
            updated_at: new Date().toISOString()
          })
          .eq('scene_id', item.scene_id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const hasError = results.some(result => result.error);
      if (hasError) {
        throw new Error('Failed to reorder scenes');
      }
      
      // Update local state
      setSceneOrder(reorderedItems);
      
      return true;
    } catch (err) {
      console.error('Error reordering scenes:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder scenes');
      return false;
    }
  };

  const getOrderedScenes = (): SceneOrderItem[] => {
    return [...sceneOrder].sort((a, b) => a.display_order - b.display_order);
  };

  const canAddMoreScenes = (): boolean => {
    return sceneOrder.length < 20; // Maximum 20 scenes
  };

  const getCompletionScene = (): SceneOrderItem | undefined => {
    return sceneOrder.find(item => item.is_completion_scene);
  };

  const getSceneById = (sceneId: number): SceneOrderItem | undefined => {
    return sceneOrder.find(item => item.scene_id === sceneId);
  };

  const isSceneEnabled = (sceneId: number): boolean => {
    const scene = getSceneById(sceneId);
    return scene ? scene.is_active : false;
  };

  const toggleSceneEnabled = async (sceneId: number): Promise<boolean> => {
    try {
      setError(null);
      
      const scene = getSceneById(sceneId);
      if (!scene) return false;
      
      const { error } = await supabase
        .from('scene_order')
        .update({
          is_active: !scene.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('scene_id', sceneId);

      if (error) throw error;
      
      // Update local state
      setSceneOrder(prev => 
        prev.map(item => 
          item.scene_id === sceneId 
            ? { ...item, is_active: !item.is_active }
            : item
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error toggling scene enabled status:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle scene enabled status');
      return false;
    }
  };

  return {
    sceneOrder,
    loading,
    error,
    fetchSceneOrder,
    updateSceneOrder,
    setCompletionScene,
    addSceneToOrder,
    removeSceneFromOrder,
    reorderScenes,
    getOrderedScenes,
    canAddMoreScenes,
    getCompletionScene,
    getSceneById,
    isSceneEnabled,
    toggleSceneEnabled
  };
};