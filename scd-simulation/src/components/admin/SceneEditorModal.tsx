import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { SceneData } from '../../data/scenesData';
import { useSceneData } from '../../hooks/useSceneData';

interface SceneEditorModalProps {
  scene: SceneData;
  onSave: (updatedScene: SceneData) => Promise<boolean>;
  onClose: () => void;
}

const SceneEditorModal: React.FC<SceneEditorModalProps> = ({ scene, onSave, onClose }) => {
  const [editedScene, setEditedScene] = useState<SceneData>(scene);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'vitals' | 'quiz' | 'prompts' | 'findings'>('basic');

  useEffect(() => {
    setEditedScene(scene);
  }, [scene]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const success = await onSave(editedScene);
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

  const handleArrayChange = (field: 'clinicalFindings' | 'discussionPrompts' | 'scoringCategories', value: string[]) => {
    setEditedScene(prev => ({
      ...prev,
      [field]: value
    }));
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
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
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                <input
                  type="url"
                  value={editedScene.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/video.mp4"
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

          {/* Vitals Tab */}
          {activeTab === 'vitals' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate</label>
                  <input
                    type="number"
                    value={editedScene.vitals.heartRate}
                    onChange={(e) => handleVitalsChange('heartRate', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Systolic BP</label>
                  <input
                    type="number"
                    value={editedScene.vitals.systolic}
                    onChange={(e) => handleVitalsChange('systolic', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diastolic BP</label>
                  <input
                    type="number"
                    value={editedScene.vitals.diastolic}
                    onChange={(e) => handleVitalsChange('diastolic', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Respiratory Rate</label>
                  <input
                    type="number"
                    value={editedScene.vitals.respiratoryRate}
                    onChange={(e) => handleVitalsChange('respiratoryRate', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Oxygen Saturation</label>
                  <input
                    type="number"
                    value={editedScene.vitals.oxygenSaturation}
                    onChange={(e) => handleVitalsChange('oxygenSaturation', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editedScene.vitals.temperature}
                    onChange={(e) => handleVitalsChange('temperature', parseFloat(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

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
                    onChange={(e) => handleVitalsChange('age', parseInt(e.target.value))}
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

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editedScene.vitals.isAlarmOn}
                    onChange={(e) => handleVitalsChange('isAlarmOn', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Alarm On</span>
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