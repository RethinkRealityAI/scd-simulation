import React, { useState } from 'react';
import { X, Save, Edit, Eye, FileText, Download, Video } from 'lucide-react';
import { SceneData } from '../../data/scenesData';
import { useVideoData } from '../../hooks/useVideoData';
import PatientVitalsEditor from './PatientVitalsEditor';
import QuizQuestionsEditor from './QuizQuestionsEditor';
import ActionPromptsEditor from './ActionPromptsEditor';
import DiscussionPromptsEditor from './DiscussionPromptsEditor';
import ClinicalFindingsEditor from './ClinicalFindingsEditor';
import ScoringCategoriesEditor from './ScoringCategoriesEditor';
import ScenePreview from '../ScenePreview';

interface SceneEditorModalProps {
  scene: SceneData;
  onSave: (scene: SceneData) => Promise<void> | void;
  onClose: () => void;
  onExport?: (sceneId: number) => void;
}

const SceneEditorModal: React.FC<SceneEditorModalProps> = ({ scene, onSave, onClose, onExport }) => {
  const { videos } = useVideoData();
  
  // Initialize scene with quiz if it doesn't exist
  const initialScene = {
    ...scene,
    quiz: scene.quiz || { questions: [] },
    discussionPrompts: scene.discussionPrompts || [],
    clinicalFindings: scene.clinicalFindings || [],
    scoringCategories: scene.scoringCategories || []
  };
  const [editedScene, setEditedScene] = useState<SceneData>(initialScene);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  
  // Get video for this scene
  const sceneVideo = videos.find(v => v.scene_id === parseInt(scene.id));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedScene);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(parseInt(editedScene.id));
    }
  };

  const updateField = <K extends keyof SceneData>(field: K, value: SceneData[K]) => {
    setEditedScene({ ...editedScene, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Edit Scene {scene.id}</h2>
              <p className="text-purple-100 text-sm mt-1">{scene.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'edit'
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Edit className="w-4 h-4" />
              Edit Configuration
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'preview'
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Eye className="w-4 h-4" />
              Live Preview & Test
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'edit' ? (
            <div className="space-y-6">
              {/* Basic Info Section */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scene Title</label>
                    <input
                      type="text"
                      value={editedScene.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Scene 1: EMS Handoff"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={editedScene.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Provide a detailed description of the scene..."
                    />
                  </div>
                </div>
              </div>
              
              {/* Video Selection */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-green-600" />
                  Scene Video
                </h3>
                {sceneVideo ? (
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-green-700">✓ Video Uploaded</span>
                      <span className="text-xs text-gray-500">{sceneVideo.title}</span>
                    </div>
                    <p className="text-xs text-gray-600">{sceneVideo.description}</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      ⚠️ No video uploaded for this scene yet. Go to the Videos tab to upload one.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Patient Vitals */}
              <PatientVitalsEditor
                vitals={editedScene.vitals}
                onChange={(vitals) => updateField('vitals', vitals)}
              />
              
              {/* Quiz Questions */}
              <QuizQuestionsEditor
                questions={editedScene.quiz?.questions || []}
                onChange={(questions) => updateField('quiz', { questions })}
              />
              
              {/* Action Prompts */}
              <ActionPromptsEditor
                actionPrompt={editedScene.actionPrompt}
                onChange={(actionPrompt) => updateField('actionPrompt', actionPrompt)}
              />
              
              {/* Discussion Prompts */}
              <DiscussionPromptsEditor
                prompts={editedScene.discussionPrompts || []}
                onChange={(prompts) => updateField('discussionPrompts', prompts)}
              />
              
              {/* Clinical Findings */}
              <ClinicalFindingsEditor
                findings={editedScene.clinicalFindings || []}
                onChange={(findings) => updateField('clinicalFindings', findings)}
              />
              
              {/* Scoring Categories */}
              <ScoringCategoriesEditor
                categories={editedScene.scoringCategories || []}
                onChange={(categories) => updateField('scoringCategories', categories)}
              />
            </div>
          ) : (
            <div className="h-[600px] bg-gray-900 rounded-lg overflow-hidden">
              <ScenePreview
                sceneData={editedScene}
                onClose={() => setActiveTab('edit')}
              />
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={handleExport}
            disabled={!onExport}
            className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export Config
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save to Database
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneEditorModal;

