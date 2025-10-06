import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  GripVertical, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Star,
  ArrowUp,
  ArrowDown,
  Settings,
  Play,
  Save,
  RefreshCw
} from 'lucide-react';
import { SceneData } from '../../data/scenesData';
import { useSceneData } from '../../hooks/useSceneData';
import { useAllSceneConfigs } from '../../hooks/useSceneConfig';
import { useSceneOrdering } from '../../hooks/useSceneOrdering';
import SceneEditorModal from './SceneEditorModal';
import CreateSceneModal from './CreateSceneModal';
import ScenePreview from '../ScenePreview';

interface SceneManagementDashboardProps {
  onClose?: () => void;
}

const SceneManagementDashboard: React.FC<SceneManagementDashboardProps> = ({ onClose }) => {
  const { allScenes, loading: scenesLoading } = useAllSceneConfigs();
  const { saveSceneConfiguration, deleteSceneConfiguration } = useSceneData();
  const { 
    sceneOrder, 
    loading: orderLoading, 
    updateSceneOrder, 
    setCompletionScene, 
    addSceneToOrder, 
    removeSceneFromOrder,
    reorderScenes,
    getOrderedScenes,
    canAddMoreScenes
  } = useSceneOrdering();
  
  const [scenes, setScenes] = useState<SceneData[]>([]);
  const [selectedScene, setSelectedScene] = useState<SceneData | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCreateScene, setShowCreateScene] = useState(false);
  const [draggedScene, setDraggedScene] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Load scenes
  useEffect(() => {
    if (allScenes.length > 0) {
      setScenes(allScenes);
    }
  }, [allScenes]);

  const handleCreateNewScene = () => {
    if (!canAddMoreScenes()) {
      alert('Maximum number of scenes reached. Cannot create more scenes.');
      return;
    }
    setShowCreateScene(true);
  };

  const handleSceneCreated = (newScene: SceneData) => {
    setScenes(prev => [...prev, newScene]);
    addSceneToOrder(parseInt(newScene.id));
  };

  const handleEditScene = (scene: SceneData) => {
    setSelectedScene(scene);
    setShowEditor(true);
  };

  const handlePreviewScene = (scene: SceneData) => {
    setSelectedScene(scene);
    setShowPreview(true);
  };

  const handleDeleteScene = async (sceneId: number) => {
    if (window.confirm('Are you sure you want to delete this scene? This action cannot be undone.')) {
      const success = await deleteSceneConfiguration(sceneId);
      if (success) {
        setScenes(prev => prev.filter(s => parseInt(s.id) !== sceneId));
        removeSceneFromOrder(sceneId);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, sceneId: number) => {
    setDraggedScene(sceneId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetSceneId: number) => {
    e.preventDefault();
    
    if (!draggedScene || draggedScene === targetSceneId) return;

    const orderedScenes = getOrderedScenes();
    const draggedIndex = orderedScenes.findIndex(s => s.scene_id === draggedScene);
    const targetIndex = orderedScenes.findIndex(s => s.scene_id === targetSceneId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new order array
    const newOrder = [...orderedScenes];
    const draggedItem = newOrder[draggedIndex];
    
    // Remove dragged item
    newOrder.splice(draggedIndex, 1);
    
    // Insert at new position
    const newTargetIndex = targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
    newOrder.splice(newTargetIndex, 0, draggedItem);
    
    // Update display orders
    const reorderedItems = newOrder.map((item, index) => ({
      ...item,
      display_order: index + 1
    }));
    
    await reorderScenes(reorderedItems);
    setDraggedScene(null);
  };

  const handleSetCompletionScene = async (sceneId: number) => {
    await setCompletionScene(sceneId);
  };

  const handleMoveScene = async (sceneId: number, direction: 'up' | 'down') => {
    const orderedScenes = getOrderedScenes();
    const currentIndex = orderedScenes.findIndex(s => s.scene_id === sceneId);
    
    if (
      (direction === 'up' && currentIndex > 0) ||
      (direction === 'down' && currentIndex < orderedScenes.length - 1)
    ) {
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      // Create new order array
      const newOrder = [...orderedScenes];
      const currentItem = newOrder[currentIndex];
      const targetItem = newOrder[targetIndex];
      
      // Swap items
      newOrder[currentIndex] = targetItem;
      newOrder[targetIndex] = currentItem;
      
      // Update display orders
      const reorderedItems = newOrder.map((item, index) => ({
        ...item,
        display_order: index + 1
      }));
      
      await reorderScenes(reorderedItems);
    }
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      // Order is automatically saved when changes are made
      alert('Scene order saved successfully!');
    } catch (error) {
      console.error('Error saving scene order:', error);
      alert('Failed to save scene order. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const sortedScenes = getOrderedScenes()
    .map(orderItem => scenes.find(s => parseInt(s.id) === orderItem.scene_id))
    .filter(Boolean) as SceneData[];

  if (scenesLoading || orderLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Scene Management</h2>
            <p className="text-purple-100 mt-1">Manage scenes, ordering, and completion settings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Order
            </button>
            <button
              onClick={handleCreateNewScene}
              disabled={!canAddMoreScenes()}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Scene
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <div className="space-y-4">
        {sortedScenes.map((scene, index) => {
          const orderItem = sceneOrder.find(s => s.scene_id === parseInt(scene.id));
          const isCompletionScene = orderItem?.is_completion_scene || false;
            
            return (
              <div
                key={scene.id}
                draggable
                onDragStart={(e) => handleDragStart(e, parseInt(scene.id))}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, parseInt(scene.id))}
                className={`bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4 transition-all hover:shadow-lg ${
                  draggedScene === parseInt(scene.id) ? 'opacity-50' : ''
                } ${isCompletionScene ? 'ring-2 ring-green-400 bg-green-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Drag Handle */}
                    <div className="cursor-move text-gray-400 hover:text-gray-600">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    
                    {/* Scene Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          Scene {scene.id}
                        </span>
                        {isCompletionScene && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Completion Scene
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{scene.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{scene.description}</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Move Up/Down */}
                    <button
                      onClick={() => handleMoveScene(parseInt(scene.id), 'up')}
                      disabled={index === 0}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveScene(parseInt(scene.id), 'down')}
                      disabled={index === sortedScenes.length - 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    
                    {/* Set as Completion Scene */}
                    <button
                      onClick={() => handleSetCompletionScene(parseInt(scene.id))}
                      className={`p-2 rounded-lg transition-colors ${
                        isCompletionScene 
                          ? 'bg-green-100 text-green-600' 
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title="Set as completion scene"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    
                    {/* Preview */}
                    <button
                      onClick={() => handlePreviewScene(scene)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Preview scene"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {/* Edit */}
                    <button
                      onClick={() => handleEditScene(scene)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit scene"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteScene(parseInt(scene.id))}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete scene"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Empty State */}
        {sortedScenes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Settings className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scenes Found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first scene.</p>
            <button
              onClick={handleCreateNewScene}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create First Scene
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateScene && (
        <CreateSceneModal
          onClose={() => setShowCreateScene(false)}
          onSceneCreated={handleSceneCreated}
        />
      )}
      
      {showEditor && selectedScene && (
        <SceneEditorModal
          scene={selectedScene}
          onSave={async (updatedScene) => {
            const success = await saveSceneConfiguration(updatedScene);
            if (success) {
              setScenes(prev => prev.map(s => s.id === updatedScene.id ? updatedScene : s));
            }
            return success;
          }}
          onClose={() => {
            setShowEditor(false);
            setSelectedScene(null);
          }}
        />
      )}
      
      {showPreview && selectedScene && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Scene Preview</h3>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedScene(null);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="h-[600px] bg-gray-900">
              <ScenePreview
                sceneData={selectedScene}
                onClose={() => {
                  setShowPreview(false);
                  setSelectedScene(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneManagementDashboard;
