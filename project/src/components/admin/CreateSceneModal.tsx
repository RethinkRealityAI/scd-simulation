import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { SceneData } from '../../data/scenesData';

interface CreateSceneModalProps {
  onClose: () => void;
  onSceneCreated: (scene: SceneData) => void;
}

const CreateSceneModal: React.FC<CreateSceneModalProps> = ({ onClose, onSceneCreated }) => {
  // Individual state for each field to ensure proper updates
  const [sceneId, setSceneId] = useState('');
  const [sceneTitle, setSceneTitle] = useState('');
  const [sceneDescription, setSceneDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [patientName, setPatientName] = useState('Patient Name');
  const [heartRate, setHeartRate] = useState(80);
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [respiratoryRate, setRespiratoryRate] = useState(16);
  const [oxygenSaturation, setOxygenSaturation] = useState(98);
  const [temperature, setTemperature] = useState(36.5);
  const [age, setAge] = useState(25);
  const [bedNumber, setBedNumber] = useState('001');
  const [mrn, setMrn] = useState('00000000');
  const [isAlarmOn, setIsAlarmOn] = useState(false);
  const [clinicalFindings, setClinicalFindings] = useState<string[]>([]);
  const [discussionPrompts, setDiscussionPrompts] = useState<string[]>([]);
  const [scoringCategories, setScoringCategories] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Array management functions
  const addArrayItem = (field: 'clinicalFindings' | 'discussionPrompts' | 'scoringCategories') => {
    if (field === 'clinicalFindings') {
      setClinicalFindings(prev => [...prev, '']);
    } else if (field === 'discussionPrompts') {
      setDiscussionPrompts(prev => [...prev, '']);
    } else if (field === 'scoringCategories') {
      setScoringCategories(prev => [...prev, 'timelyPainManagement']);
    }
  };

  const removeArrayItem = (field: 'clinicalFindings' | 'discussionPrompts' | 'scoringCategories', index: number) => {
    if (field === 'clinicalFindings') {
      setClinicalFindings(prev => prev.filter((_, i) => i !== index));
    } else if (field === 'discussionPrompts') {
      setDiscussionPrompts(prev => prev.filter((_, i) => i !== index));
    } else if (field === 'scoringCategories') {
      setScoringCategories(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateArrayItem = (field: 'clinicalFindings' | 'discussionPrompts' | 'scoringCategories', index: number, value: string) => {
    if (field === 'clinicalFindings') {
      setClinicalFindings(prev => prev.map((item, i) => i === index ? value : item));
    } else if (field === 'discussionPrompts') {
      setDiscussionPrompts(prev => prev.map((item, i) => i === index ? value : item));
    } else if (field === 'scoringCategories') {
      setScoringCategories(prev => prev.map((item, i) => i === index ? value : item));
    }
  };

  const handleCreate = async () => {
    setError(null);
    setCreating(true);

    try {
      // Validate required fields
      if (!sceneId || !sceneTitle || !sceneDescription) {
        setError('Please fill in all required fields (ID, Title, Description)');
        return;
      }

      // Validate scene ID is a number
      const sceneIdNum = parseInt(sceneId);
      if (isNaN(sceneIdNum) || sceneIdNum < 1 || sceneIdNum > 20) {
        setError('Scene ID must be a number between 1 and 20');
        return;
      }

      // Validate vitals data
      if (!patientName.trim()) {
        setError('Please fill in the patient name');
        return;
      }

      // Create the complete scene object
      const completeScene: SceneData = {
        id: sceneId,
        title: sceneTitle,
        description: sceneDescription,
        videoUrl: videoUrl || '',
        posterUrl: posterUrl || '',
        vitals: {
          heartRate,
          systolic,
          diastolic,
          respiratoryRate,
          oxygenSaturation,
          temperature,
          isAlarmOn,
          patientName,
          age,
          bedNumber,
          mrn,
          procedureTime: ''
        },
        clinicalFindings,
        discussionPrompts,
        scoringCategories: scoringCategories as any[],
        quiz: undefined,
        actionPrompt: undefined
      };

      await onSceneCreated(completeScene);
      onClose();
    } catch (error) {
      console.error('❌ Error creating scene:', error);
      setError(`Failed to create scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Create New Scene</h2>
              <p className="text-green-100 mt-1">Add a new scene to the simulation</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
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

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scene ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={sceneId}
                    onChange={(e) => setSceneId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="1-20"
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={sceneTitle}
                    onChange={(e) => setSceneTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Scene Title"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={sceneDescription}
                  onChange={(e) => setSceneDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Scene description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poster URL</label>
                  <input
                    type="url"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Patient Vitals */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Vitals</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Systolic BP</label>
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diastolic BP</label>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Respiratory Rate</label>
                  <input
                    type="number"
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Oxygen Saturation</label>
                  <input
                    type="number"
                    value={oxygenSaturation}
                    onChange={(e) => setOxygenSaturation(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Patient Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bed Number</label>
                  <input
                    type="text"
                    value={bedNumber}
                    onChange={(e) => setBedNumber(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MRN</label>
                  <input
                    type="text"
                    value={mrn}
                    onChange={(e) => setMrn(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="00000000"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isAlarmOn}
                    onChange={(e) => setIsAlarmOn(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Alarm On</span>
                </label>
              </div>
            </div>

            {/* Clinical Findings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Findings</h3>
              <div className="space-y-2">
                {clinicalFindings.map((finding, index) => (
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
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Finding
                </button>
              </div>
            </div>

            {/* Discussion Prompts */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Discussion Prompts</h3>
              <div className="space-y-2">
                {discussionPrompts.map((prompt, index) => (
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
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Prompt
                </button>
              </div>
            </div>

            {/* Scoring Categories */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Scoring Categories</h3>
              <div className="space-y-2">
                {scoringCategories.map((category, index) => (
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
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>
            </div>
          </div>
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
              onClick={handleCreate}
              disabled={creating}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
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