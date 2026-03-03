import React, { useState, useEffect } from 'react';
import {
  Plus,
  GripVertical,
  Eye,
  Edit,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  Settings,
  Save,
  RefreshCw,
  Copy,
  HelpCircle,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { SceneData, defaultSceneLayoutConfig, defaultVitalsDisplayConfig } from '../../data/scenesData';
import { useSceneData } from '../../hooks/useSceneData';
import { useAllSceneConfigs } from '../../hooks/useSceneConfig';
import { useSceneOrdering } from '../../hooks/useSceneOrdering';
import SceneBuilder from './sceneBuilder/SceneBuilder';
import ScenePreview from '../ScenePreview';
import ConfirmDialog from './ConfirmDialog';

const ACTION_PROMPT_TYPE_LABELS: Record<string, string> = {
  'action-selection': 'Action Select',
  'multi-select': 'Multi-Select',
  'reflection': 'Reflection',
  'sbar': 'SBAR',
};

const ACTION_PROMPT_TYPE_COLORS: Record<string, string> = {
  'action-selection': 'bg-purple-100 text-purple-800 border-purple-200',
  'multi-select': 'bg-blue-100 text-blue-800 border-blue-200',
  'reflection': 'bg-teal-100 text-teal-800 border-teal-200',
  'sbar': 'bg-orange-100 text-orange-800 border-orange-200',
};

interface SceneManagementDashboardProps {
  onClose?: () => void;
  instanceId?: string;
}

const SceneManagementDashboard: React.FC<SceneManagementDashboardProps> = ({ onClose, instanceId }) => {
  const { allScenes, loading: scenesLoading } = useAllSceneConfigs(instanceId);
  const { saveSceneConfiguration, deleteSceneConfiguration } = useSceneData();
  const {
    sceneOrder,
    loading: orderLoading,
    setCompletionScene,
    addSceneToOrder,
    removeSceneFromOrder,
    reorderScenes,
    getOrderedScenes,
    canAddMoreScenes
  } = useSceneOrdering(instanceId);

  const [scenes, setScenes] = useState<SceneData[]>([]);
  const [selectedScene, setSelectedScene] = useState<SceneData | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [initialBuilderMode, setInitialBuilderMode] = useState<'builder' | 'canvas'>('canvas');
  const [showPreview, setShowPreview] = useState(false);
  const [draggedScene, setDraggedScene] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  const getNextAvailableSceneId = (): number => {
    const existingIds = scenes.map(s => parseInt(s.id, 10));
    let newId = 1;
    while (existingIds.includes(newId)) {
      newId++;
    }
    return newId;
  };

  const createDraftScene = (sceneId: number): SceneData => ({
    id: sceneId.toString(),
    title: `Scene ${sceneId}: Untitled`,
    description: '',
    videoUrl: '',
    posterUrl: '',
    videoSourceType: 'upload',
    vitals: {
      heartRate: 80,
      systolic: 120,
      diastolic: 80,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      temperature: 36.8,
      painLevel: 0,
      isAlarmOn: false,
      patientName: 'Patient Name',
      age: 30,
      bedNumber: '001',
      mrn: '00000000',
      procedureTime: '',
    },
    vitalsDisplayConfig: { ...defaultVitalsDisplayConfig },
    clinicalFindings: [],
    discussionPrompts: [],
    scoringCategories: [],
    // Start with only header enabled; users compose the scene in builder.
    layoutConfig: {
      components: defaultSceneLayoutConfig.components.map(component => ({
        ...component,
        enabled: component.type === 'scene-header',
      })),
    },
  });

  // Load scenes
  useEffect(() => {
    setScenes(allScenes);
  }, [allScenes]);

  const handleCreateNewScene = () => {
    if (!canAddMoreScenes()) {
      alert('Maximum number of scenes reached. Cannot create more scenes.');
      return;
    }
    const newId = getNextAvailableSceneId();
    if (newId > 20) {
      alert('No available scene IDs. Maximum of 20 scenes allowed.');
      return;
    }
    setInitialBuilderMode('builder');
    setSelectedScene(createDraftScene(newId));
    setShowEditor(true);
  };

  const handleEditScene = (scene: SceneData) => {
    setInitialBuilderMode('canvas');
    setSelectedScene(scene);
    setShowEditor(true);
  };

  const handlePreviewScene = (scene: SceneData) => {
    setSelectedScene(scene);
    setShowPreview(true);
  };

  const handleDeleteScene = (sceneId: number, sceneTitle: string) => {
    setConfirmDialog({
      title: 'Delete Scene',
      message: `Are you sure you want to delete "${sceneTitle}"? This action cannot be undone.`,
      confirmLabel: 'Delete Scene',
      onConfirm: async () => {
        setConfirmDialog(null);
        const success = await deleteSceneConfiguration(sceneId, instanceId);
        if (success) {
          setScenes(prev => prev.filter(s => parseInt(s.id) !== sceneId));
          removeSceneFromOrder(sceneId, instanceId);
        }
      },
    });
  };

  const handleDuplicateScene = async (scene: SceneData) => {
    if (!canAddMoreScenes()) {
      alert('Maximum number of scenes reached. Cannot duplicate scene.');
      return;
    }

    setDuplicating(parseInt(scene.id));

    try {
      // Find the next available scene ID
      const existingIds = scenes.map(s => parseInt(s.id));
      let newId = 1;
      while (existingIds.includes(newId)) {
        newId++;
      }

      if (newId > 20) {
        alert('No available scene IDs. Maximum of 20 scenes allowed.');
        return;
      }

      // Create a duplicate scene with new ID
      const duplicatedScene: SceneData = {
        ...scene,
        id: newId.toString(),
        title: `${scene.title} (Copy)`,
        description: `${scene.description} - Duplicated from Scene ${scene.id}`
      };

      // Save the duplicated scene
      const success = await saveSceneConfiguration(duplicatedScene, instanceId);
      if (success) {
        setScenes(prev => [...prev, duplicatedScene]);
        await addSceneToOrder(newId, instanceId);
        alert(`Scene duplicated successfully as Scene ${newId}!`);
      } else {
        alert('Failed to duplicate scene. Please try again.');
      }
    } catch (error) {
      console.error('Error duplicating scene:', error);
      alert('Failed to duplicate scene. Please try again.');
    } finally {
      setDuplicating(null);
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

    await reorderScenes(reorderedItems, instanceId);
    setDraggedScene(null);
  };

  const handleSetCompletionScene = async (sceneId: number) => {
    await setCompletionScene(sceneId, instanceId);
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

      await reorderScenes(reorderedItems, instanceId);
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
    <div className="bg-white rounded-xl shadow-sm w-full max-h-[90vh] overflow-hidden border border-gray-200">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Scene Management</h2>
            <p className="text-[10px] text-gray-500">Manage scenes, ordering, and completion</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveOrder}
            disabled={saving}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Order
          </button>
          <button
            onClick={handleCreateNewScene}
            disabled={!canAddMoreScenes()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Scene
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Compact stats strip */}
      <div className="flex items-center gap-5 px-4 py-2 border-b border-gray-100 bg-gray-50/50 text-[10px] text-gray-500 flex-wrap">
        <span className="flex items-center gap-1"><span className="text-sm font-bold text-blue-600">{scenes.length}</span> Scenes</span>
        <span className="flex items-center gap-1"><span className="text-sm font-bold text-emerald-600">{sceneOrder.filter(s => s.is_active).length}</span> Active</span>
        <span className="flex items-center gap-1"><span className="text-sm font-bold text-purple-600">{sceneOrder.find(s => s.is_completion_scene)?.scene_id || '—'}</span> Completion</span>
        <span className="flex items-center gap-1"><span className="text-sm font-bold text-amber-600">{20 - scenes.length}</span> Slots left</span>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">

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
                className={`bg-gray-50 border-2 border-gray-200 rounded-xl p-4 transition-all hover:shadow-lg ${draggedScene === parseInt(scene.id) ? 'opacity-50' : ''
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
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          Scene {scene.id}
                        </span>
                        {isCompletionScene && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Completion
                          </span>
                        )}
                        {/* Interaction status badges */}
                        {scene.quiz?.questions && scene.quiz.questions.length > 0 && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                            <HelpCircle className="w-3 h-3" />
                            Quiz: {scene.quiz.questions.length} {scene.quiz.questions.length === 1 ? 'question' : 'questions'}
                          </span>
                        )}
                        {scene.actionPrompt && (
                          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${ACTION_PROMPT_TYPE_COLORS[scene.actionPrompt.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            <MessageSquare className="w-3 h-3" />
                            {ACTION_PROMPT_TYPE_LABELS[scene.actionPrompt.type] || scene.actionPrompt.type}
                          </span>
                        )}
                        {!scene.quiz?.questions?.length && !scene.actionPrompt && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                            <FileText className="w-3 h-3" />
                            No interaction
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{scene.title}</h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-1">{scene.description}</p>
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
                      className={`p-2 rounded-lg transition-colors ${isCompletionScene
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

                    {/* Duplicate */}
                    <button
                      onClick={() => handleDuplicateScene(scene)}
                      disabled={duplicating === parseInt(scene.id) || !canAddMoreScenes()}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Duplicate scene"
                    >
                      {duplicating === parseInt(scene.id) ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteScene(parseInt(scene.id), scene.title)}
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

      {showEditor && selectedScene && (
        <SceneBuilder
          scene={selectedScene}
          instanceId={instanceId}
          initialMode={initialBuilderMode}
          onSave={async (updatedScene) => {
            const success = await saveSceneConfiguration(updatedScene, instanceId);
            if (success) {
              const updatedSceneId = parseInt(updatedScene.id, 10);
              const alreadyInScenes = scenes.some(scene => parseInt(scene.id, 10) === updatedSceneId);

              setScenes(prev => {
                if (prev.some(s => s.id === updatedScene.id)) {
                  return prev.map(s => s.id === updatedScene.id ? updatedScene : s);
                }
                return [...prev, updatedScene];
              });

              const inOrder = sceneOrder.some(item => item.scene_id === updatedSceneId);
              if (!inOrder && !alreadyInScenes) {
                await addSceneToOrder(updatedSceneId, instanceId);
              }
            }
            return success;
          }}
          onClose={() => {
            setShowEditor(false);
            setSelectedScene(null);
          }}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          variant="danger"
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {showPreview && selectedScene && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
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
