import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { SceneData, defaultVitalsDisplayConfig, defaultVitalsVisibility } from '../../data/scenesData';
import VideoEmbedInput, { VideoEmbedValue } from './VideoEmbedInput';
import { parseVideoUrl } from '../../utils/videoEmbedUtils';
import { useVideoData } from '../../hooks/useVideoData';

interface SceneEditorModalProps {
  scene: SceneData;
  onSave: (updatedScene: SceneData) => Promise<boolean>;
  onClose: () => void;
  instanceId?: string;
}

const VITAL_COLORS = ['cyan', 'green', 'yellow', 'red', 'purple', 'blue', 'orange', 'pink'];

const COLOR_SWATCHES: Record<string, string> = {
  cyan: 'bg-cyan-400',
  green: 'bg-green-400',
  yellow: 'bg-yellow-400',
  red: 'bg-red-400',
  purple: 'bg-purple-400',
  blue: 'bg-blue-400',
  orange: 'bg-orange-400',
  pink: 'bg-pink-400',
};

const SceneEditorModal: React.FC<SceneEditorModalProps> = ({ scene, onSave, onClose, instanceId }) => {
  const { uploadVideo, saveStreamVideo } = useVideoData();
  const [editedScene, setEditedScene] = useState<SceneData>(scene);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'vitals' | 'quiz' | 'prompts' | 'findings'>('basic');
  const [videoEmbed, setVideoEmbed] = useState<VideoEmbedValue>({
    sourceType: scene.videoSourceType === 'stream' ? 'stream' : 'upload',
    file: null,
    streamUrl: scene.streamUrl || '',
    parsed: scene.streamUrl ? parseVideoUrl(scene.streamUrl) : null,
    title: '',
    description: '',
  });

  // Initialize vitalsDisplayConfig if not present
  useEffect(() => {
    setEditedScene({
      ...scene,
      vitalsDisplayConfig: scene.vitalsDisplayConfig || { ...defaultVitalsDisplayConfig },
    });
  }, [scene]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Apply video embed state to scene
      const sceneToSave = { ...editedScene };

      if (videoEmbed.sourceType === 'stream' && videoEmbed.parsed) {
        // Save stream URL to simulation_videos table
        await saveStreamVideo(
          parseInt(scene.id),
          videoEmbed.parsed.embedUrl,
          sceneToSave.title,
          sceneToSave.description,
          instanceId
        );

        sceneToSave.videoUrl = videoEmbed.parsed.embedUrl;
        sceneToSave.videoSourceType = 'stream';
        sceneToSave.streamUrl = videoEmbed.streamUrl;
      } else if (videoEmbed.sourceType === 'upload') {
        // Upload video file if provided
        if (videoEmbed.file) {
          const insertData = await uploadVideo(
            videoEmbed.file,
            parseInt(scene.id),
            sceneToSave.title,
            sceneToSave.description,
            instanceId
          );
          if (insertData?.video_url) {
            sceneToSave.videoUrl = insertData.video_url;
          }
        }

        sceneToSave.videoSourceType = 'upload';
        sceneToSave.streamUrl = undefined;
      }

      const success = await onSave(sceneToSave);
      if (success) {
        onClose();
      } else {
        setError('Failed to save scene configuration');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save scene');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SceneData, value: any) => {
    setEditedScene(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVitalsChange = (field: string, value: any) => {
    setEditedScene(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [field]: value
      }
    }));
  };

  const handleVisibilityToggle = (field: keyof typeof defaultVitalsVisibility) => {
    setEditedScene(prev => {
      const currentConfig = prev.vitalsDisplayConfig || { ...defaultVitalsDisplayConfig };
      return {
        ...prev,
        vitalsDisplayConfig: {
          ...currentConfig,
          visibility: {
            ...currentConfig.visibility,
            [field]: !currentConfig.visibility[field],
          },
        },
      };
    });
  };

  const handleVitalColorChange = (field: string, color: string) => {
    setEditedScene(prev => {
      const currentConfig = prev.vitalsDisplayConfig || { ...defaultVitalsDisplayConfig };
      return {
        ...prev,
        vitalsDisplayConfig: {
          ...currentConfig,
          colors: {
            ...currentConfig.colors,
            [field]: color,
          },
        },
      };
    });
  };

  const addArrayItem = (field: 'clinicalFindings' | 'discussionPrompts' | 'scoringCategories') => {
    setEditedScene(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const removeArrayItem = (field: 'clinicalFindings' | 'discussionPrompts' | 'scoringCategories', index: number) => {
    setEditedScene(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'clinicalFindings' | 'discussionPrompts' | 'scoringCategories', index: number, value: string) => {
    setEditedScene(prev => ({
      ...prev,
      [field]: (prev[field] || []).map((item, i) => i === index ? value : item)
    }));
  };

  const displayConfig = editedScene.vitalsDisplayConfig || defaultVitalsDisplayConfig;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Edit Scene Configuration</h2>
              <p className="text-purple-100 mt-1">Scene {scene.id}: {scene.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-1 p-4">
            {[
              { id: 'basic', label: 'Basic Info', icon: '📝' },
              { id: 'vitals', label: 'Vitals', icon: '💓' },
              { id: 'quiz', label: 'Quiz', icon: '❓' },
              { id: 'prompts', label: 'Prompts', icon: '💬' },
              { id: 'findings', label: 'Findings', icon: '🔍' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editedScene.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editedScene.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Video</label>
                <VideoEmbedInput
                  value={videoEmbed}
                  onChange={setVideoEmbed}
                  existingVideoUrl={scene.videoUrl}
                  sceneId={scene.id}
                  compact
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Poster URL</label>
                <input
                  type="url"
                  value={editedScene.posterUrl || ''}
                  onChange={(e) => handleInputChange('posterUrl', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/poster.jpg"
                />
              </div>
            </div>
          )}

          {/* Vitals Tab — Enhanced with visibility and color controls */}
          {activeTab === 'vitals' && (
            <div className="space-y-8">
              {/* Visibility Controls Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Vital Signs Visibility</h3>
                <p className="text-sm text-gray-500 mb-4">Toggle which vital signs appear on the monitor for this scene.</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { key: 'heartRate' as const, label: 'Heart Rate', icon: '❤️' },
                    { key: 'bloodPressure' as const, label: 'Blood Pressure', icon: '🩸' },
                    { key: 'respiratoryRate' as const, label: 'Respiratory Rate', icon: '🫁' },
                    { key: 'oxygenSaturation' as const, label: 'SpO₂', icon: '💨' },
                    { key: 'temperature' as const, label: 'Temperature', icon: '🌡️' },
                    { key: 'painLevel' as const, label: 'Pain Level', icon: '😣' },
                    { key: 'patientInfo' as const, label: 'Patient Info', icon: '👤' },
                  ].map(({ key, label, icon }) => (
                    <button
                      key={key}
                      onClick={() => handleVisibilityToggle(key)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${displayConfig.visibility[key]
                        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-400'
                        }`}
                    >
                      <span className="text-xl">{icon}</span>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{label}</div>
                      </div>
                      {displayConfig.visibility[key] ? (
                        <Eye className="w-4 h-4 text-blue-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Configuration */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Accent Colors</h3>
                <p className="text-sm text-gray-500 mb-4">Choose the display color for each vital sign.</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'heartRate', label: 'Heart Rate' },
                    { key: 'bloodPressure', label: 'Blood Pressure' },
                    { key: 'respiratoryRate', label: 'Respiratory Rate' },
                    { key: 'oxygenSaturation', label: 'SpO₂' },
                    { key: 'temperature', label: 'Temperature' },
                    { key: 'painLevel', label: 'Pain Level' },
                  ].map(({ key, label }) => {
                    const currentColor = (displayConfig.colors as any)?.[key] || 'cyan';
                    return (
                      <div key={key} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                        <div className="flex flex-wrap gap-1.5">
                          {VITAL_COLORS.map(color => (
                            <button
                              key={color}
                              onClick={() => handleVitalColorChange(key, color)}
                              className={`w-7 h-7 rounded-full ${COLOR_SWATCHES[color]} transition-all duration-200 ${currentColor === color
                                ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                                : 'opacity-60 hover:opacity-100 hover:scale-105'
                                }`}
                              title={color.charAt(0).toUpperCase() + color.slice(1)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vital Values */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Vital Sign Values</h3>
                <p className="text-sm text-gray-500 mb-4">Set the displayed values for this scene.</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={editedScene.vitals.heartRate}
                      onChange={(e) => handleVitalsChange('heartRate', parseInt(e.target.value) || 0)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={editedScene.vitals.systolic}
                      onChange={(e) => handleVitalsChange('systolic', parseInt(e.target.value) || 0)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={editedScene.vitals.diastolic}
                      onChange={(e) => handleVitalsChange('diastolic', parseInt(e.target.value) || 0)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Respiratory Rate (rpm)</label>
                    <input
                      type="number"
                      value={editedScene.vitals.respiratoryRate}
                      onChange={(e) => handleVitalsChange('respiratoryRate', parseInt(e.target.value) || 0)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Oxygen Saturation (%)</label>
                    <input
                      type="number"
                      value={editedScene.vitals.oxygenSaturation}
                      onChange={(e) => handleVitalsChange('oxygenSaturation', parseInt(e.target.value) || 0)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editedScene.vitals.temperature}
                      onChange={(e) => handleVitalsChange('temperature', parseFloat(e.target.value) || 0)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pain Level (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={editedScene.vitals.painLevel ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleVitalsChange('painLevel', val === '' ? undefined : parseInt(val));
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Leave empty to hide"
                    />
                    <p className="text-xs text-gray-400 mt-1">Leave empty to not display pain for this scene</p>
                  </div>
                </div>
              </div>

              {/* Patient Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Patient Information</h3>
                <p className="text-sm text-gray-500 mb-4">Displayed in the vitals monitor header.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                    <input
                      type="text"
                      value={editedScene.vitals.patientName}
                      onChange={(e) => handleVitalsChange('patientName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      value={editedScene.vitals.age}
                      onChange={(e) => handleVitalsChange('age', parseInt(e.target.value) || 0)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bed Number</label>
                    <input
                      type="text"
                      value={editedScene.vitals.bedNumber}
                      onChange={(e) => handleVitalsChange('bedNumber', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">MRN</label>
                    <input
                      type="text"
                      value={editedScene.vitals.mrn}
                      onChange={(e) => handleVitalsChange('mrn', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Alarm Toggle */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedScene.vitals.isAlarmOn}
                    onChange={(e) => handleVitalsChange('isAlarmOn', e.target.checked)}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">🚨 Alarm Active</span>
                </label>
              </div>
            </div>
          )}

          {/* Clinical Findings Tab */}
          {activeTab === 'findings' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Findings</label>
                <div className="space-y-2">
                  {(editedScene.clinicalFindings || []).map((finding, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={finding}
                        onChange={(e) => updateArrayItem('clinicalFindings', index, e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter clinical finding"
                      />
                      <button
                        onClick={() => removeArrayItem('clinicalFindings', index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('clinicalFindings')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add Finding
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discussion Prompts</label>
                <div className="space-y-2">
                  {(editedScene.discussionPrompts || []).map((prompt, index) => (
                    <div key={index} className="flex gap-2">
                      <textarea
                        value={prompt}
                        onChange={(e) => updateArrayItem('discussionPrompts', index, e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={2}
                        placeholder="Enter discussion prompt"
                      />
                      <button
                        onClick={() => removeArrayItem('discussionPrompts', index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('discussionPrompts')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add Prompt
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scoring Categories</label>
                <div className="space-y-2">
                  {(editedScene.scoringCategories || []).map((category, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={category}
                        onChange={(e) => updateArrayItem('scoringCategories', index, e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="timelyPainManagement">Timely Pain Management</option>
                        <option value="clinicalJudgment">Clinical Judgment</option>
                        <option value="communication">Communication</option>
                        <option value="culturalSafety">Cultural Safety</option>
                        <option value="biasMitigation">Bias Mitigation</option>
                      </select>
                      <button
                        onClick={() => removeArrayItem('scoringCategories', index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('scoringCategories')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add Category
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Tab */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Quiz configuration is complex and requires JSON editing.
                  For now, this is handled by the static scene data. Advanced quiz editing will be added in a future update.
                </p>
              </div>

              {editedScene.quiz && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Quiz Configuration</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(editedScene.quiz, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prompts Tab */}
          {activeTab === 'prompts' && (
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Action prompts configuration is complex and requires JSON editing.
                  For now, this is handled by the static scene data. Advanced prompt editing will be added in a future update.
                </p>
              </div>

              {editedScene.actionPrompt && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Action Prompt Configuration</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(editedScene.actionPrompt, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
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