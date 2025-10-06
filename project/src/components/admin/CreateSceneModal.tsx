import React, { useState } from 'react';
import { X, Save, Plus, AlertCircle, Video, FileText, Eye, Download, CheckCircle, Settings, Layers, Target, Heart, MessageSquare, Activity, Clipboard } from 'lucide-react';
import { SceneData } from '../../data/scenesData';
import { useSceneData } from '../../hooks/useSceneData';
import { useVideoData } from '../../hooks/useVideoData';
import PatientVitalsEditor from './PatientVitalsEditor';
import QuizQuestionsEditor from './QuizQuestionsEditor';
import ActionPromptsEditor from './ActionPromptsEditor';
import DiscussionPromptsEditor from './DiscussionPromptsEditor';
import ClinicalFindingsEditor from './ClinicalFindingsEditor';
import ScoringCategoriesEditor from './ScoringCategoriesEditor';
import ScenePreview from '../ScenePreview';

interface CreateSceneModalProps {
  onClose: () => void;
  onSceneCreated: (scene: SceneData) => void;
}

// Scene type definitions
const SCENE_TYPES = [
  {
    id: 'clinical-assessment',
    name: 'Clinical Assessment',
    description: 'Patient assessment and vital signs monitoring',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    requiredFields: ['vitals', 'clinicalFindings']
  },
  {
    id: 'quiz-interaction',
    name: 'Quiz Interaction',
    description: 'Knowledge testing with multiple choice questions',
    icon: Target,
    color: 'from-blue-500 to-indigo-500',
    requiredFields: ['quiz']
  },
  {
    id: 'action-selection',
    name: 'Action Selection',
    description: 'Decision-making scenarios with action prompts',
    icon: Activity,
    color: 'from-green-500 to-emerald-500',
    requiredFields: ['actionPrompt']
  },
  {
    id: 'discussion-based',
    name: 'Discussion Based',
    description: 'Team communication and reflection scenarios',
    icon: MessageSquare,
    color: 'from-purple-500 to-violet-500',
    requiredFields: ['discussionPrompts']
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive',
    description: 'Full-featured scene with all components',
    icon: Layers,
    color: 'from-orange-500 to-yellow-500',
    requiredFields: ['vitals', 'quiz', 'actionPrompt', 'discussionPrompts', 'clinicalFindings', 'scoringCategories']
  }
];

const CreateSceneModal: React.FC<CreateSceneModalProps> = ({ onClose, onSceneCreated }) => {
  const { saveSceneConfiguration } = useSceneData();
  const { videos } = useVideoData();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'preview'>('create');
  
  const [newScene, setNewScene] = useState<Partial<SceneData>>({
    id: '',
    title: '',
    description: '',
    videoUrl: '',
    vitals: {
      heartRate: 80,
      systolic: 120,
      diastolic: 80,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      temperature: 37.0,
      isAlarmOn: false,
      patientName: 'Patient Name',
      age: 25,
      bedNumber: '001',
      mrn: '00000000',
      procedureTime: ''
    },
    quiz: { questions: [] },
    discussionPrompts: [],
    clinicalFindings: [],
    scoringCategories: []
  });

  const [selectedSceneType, setSelectedSceneType] = useState<string>('comprehensive');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [useVideoUrl, setUseVideoUrl] = useState(false);

  const handleSave = async () => {
    if (!newScene.title || !newScene.description) {
      setError('Title and description are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Generate next available scene ID
      const nextId = Date.now().toString();
      
      // Get video URL from selected video or manual input
      let finalVideoUrl = newScene.videoUrl || '';
      if (!useVideoUrl && selectedVideoId) {
        const selectedVideo = videos.find(v => v.id === selectedVideoId);
        if (selectedVideo) {
          finalVideoUrl = selectedVideo.video_url;
        }
      }
      
      const sceneData: SceneData = {
        id: nextId,
        title: newScene.title,
        description: newScene.description,
        videoUrl: finalVideoUrl,
        vitals: newScene.vitals!,
        quiz: newScene.quiz || { questions: [] },
        actionPrompt: newScene.actionPrompt,
        discussionPrompts: newScene.discussionPrompts || [],
        clinicalFindings: newScene.clinicalFindings || [],
        scoringCategories: newScene.scoringCategories || []
      };

      const success = await saveSceneConfiguration(sceneData);
      
      if (success) {
        onSceneCreated(sceneData);
        onClose();
      } else {
        setError('Failed to create scene. Please try again.');
      }
    } catch (err) {
      console.error('Error creating scene:', err);
      setError('An error occurred while creating the scene.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof SceneData>(field: K, value: SceneData[K]) => {
    setNewScene(prev => ({ ...prev, [field]: value }));
  };

  const selectedSceneTypeConfig = SCENE_TYPES.find(type => type.id === selectedSceneType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Create New Scene</h2>
              <p className="text-green-100 text-sm mt-1">Build a powerful simulation scene with all the tools you need</p>
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
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'create'
                  ? 'bg-white text-green-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Plus className="w-4 h-4" />
              Scene Builder
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'preview'
                  ? 'bg-white text-green-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Eye className="w-4 h-4" />
              Live Preview
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'create' ? (
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {/* Scene Type Selection */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  Scene Type & Template
                </h3>
                <p className="text-sm text-gray-600 mb-4">Choose a scene type to get started with the right components for your scenario.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SCENE_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedSceneType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedSceneType(type.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? `border-indigo-500 bg-indigo-50 shadow-lg`
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${type.color} text-white`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{type.name}</h4>
                            <p className="text-xs text-gray-600">{type.description}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Includes: {type.requiredFields.map(field => field.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scene Title *
                    </label>
                    <input
                      type="text"
                      value={newScene.title || ''}
                      onChange={(e) => updateField('title', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Scene 11: New Scenario"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newScene.description || ''}
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
                <div className="space-y-4">
                  {/* Video Source Selection */}
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="videoSource"
                        checked={!useVideoUrl}
                        onChange={() => setUseVideoUrl(false)}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Select from uploaded videos</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="videoSource"
                        checked={useVideoUrl}
                        onChange={() => setUseVideoUrl(true)}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Enter video URL</span>
                    </label>
                  </div>

                  {/* Video Selection */}
                  {!useVideoUrl ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Video
                      </label>
                      <select
                        value={selectedVideoId}
                        onChange={(e) => setSelectedVideoId(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Choose a video...</option>
                        {videos.map((video) => (
                          <option key={video.id} value={video.id}>
                            Scene {video.scene_id}: {video.title}
                          </option>
                        ))}
                      </select>
                      {selectedVideoId && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Video selected</span>
                          </div>
                          <p className="text-xs text-green-700 mt-1">
                            {videos.find(v => v.id === selectedVideoId)?.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video URL
                      </label>
                      <input
                        type="url"
                        value={newScene.videoUrl || ''}
                        onChange={(e) => updateField('videoUrl', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Components Based on Scene Type */}
              {selectedSceneTypeConfig?.requiredFields.includes('vitals') && (
                <PatientVitalsEditor
                  vitals={newScene.vitals!}
                  onChange={(vitals) => updateField('vitals', vitals)}
                />
              )}

              {selectedSceneTypeConfig?.requiredFields.includes('quiz') && (
                <QuizQuestionsEditor
                  questions={newScene.quiz?.questions || []}
                  onChange={(questions) => updateField('quiz', { questions })}
                />
              )}

              {selectedSceneTypeConfig?.requiredFields.includes('actionPrompt') && (
                <ActionPromptsEditor
                  actionPrompt={newScene.actionPrompt}
                  onChange={(actionPrompt) => updateField('actionPrompt', actionPrompt)}
                />
              )}

              {selectedSceneTypeConfig?.requiredFields.includes('discussionPrompts') && (
                <DiscussionPromptsEditor
                  prompts={newScene.discussionPrompts || []}
                  onChange={(prompts) => updateField('discussionPrompts', prompts)}
                />
              )}

              {selectedSceneTypeConfig?.requiredFields.includes('clinicalFindings') && (
                <ClinicalFindingsEditor
                  findings={newScene.clinicalFindings || []}
                  onChange={(findings) => updateField('clinicalFindings', findings)}
                />
              )}

              {selectedSceneTypeConfig?.requiredFields.includes('scoringCategories') && (
                <ScoringCategoriesEditor
                  categories={newScene.scoringCategories || []}
                  onChange={(categories) => updateField('scoringCategories', categories)}
                />
              )}
            </div>
          ) : (
            <div className="h-[600px] bg-gray-900 rounded-lg overflow-hidden">
              <ScenePreview
                sceneData={newScene as SceneData}
                onClose={() => setActiveTab('create')}
              />
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Settings className="w-4 h-4" />
            <span>Scene Type: {selectedSceneTypeConfig?.name}</span>
          </div>
          
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
              disabled={saving || !newScene.title || !newScene.description}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Scene
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSceneModal;