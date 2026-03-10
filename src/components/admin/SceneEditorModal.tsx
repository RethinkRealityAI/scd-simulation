import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  FileText,
  Activity,
  HelpCircle,
  MessageSquare,
  Stethoscope,
  Play,
  ChevronRight,
  Trash2,
  Plus,
} from 'lucide-react';
import { SceneData, defaultVitalsDisplayConfig, defaultVitalsVisibility } from '../../data/scenesData';
import VideoEmbedInput, { VideoEmbedValue } from './VideoEmbedInput';
import { parseVideoUrl } from '../../utils/videoEmbedUtils';
import { useVideoData } from '../../hooks/useVideoData';
import QuizQuestionsEditor from './QuizQuestionsEditor';
import ActionPromptsEditor from './ActionPromptsEditor';
import ScenePreview from '../ScenePreview';

interface SceneEditorModalProps {
  scene: SceneData;
  onSave: (updatedScene: SceneData) => Promise<boolean>;
  onClose: () => void;
  instanceId?: string;
}

type TabId = 'basic' | 'vitals' | 'quiz' | 'prompts' | 'findings';

// Tailwind class string for text inputs — avoids a <style> tag while keeping consistent styling
const INPUT_CLS = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400 text-gray-900';

const VITAL_COLORS = ['cyan', 'green', 'yellow', 'red', 'purple', 'blue', 'orange', 'pink'];
const COLOR_HEX: Record<string, string> = {
  cyan: '#22d3ee', green: '#4ade80', yellow: '#facc15', red: '#f87171',
  purple: '#c084fc', blue: '#60a5fa', orange: '#fb923c', pink: '#f472b6',
};
const COLOR_SWATCHES: Record<string, string> = {
  cyan: 'bg-cyan-400', green: 'bg-green-400', yellow: 'bg-yellow-400', red: 'bg-red-400',
  purple: 'bg-purple-400', blue: 'bg-blue-400', orange: 'bg-orange-400', pink: 'bg-pink-400',
};

const SCORING_CATEGORIES = [
  { value: 'timelyPainManagement', label: 'Timely Pain Management' },
  { value: 'clinicalJudgment', label: 'Clinical Judgment' },
  { value: 'communication', label: 'Communication' },
  { value: 'culturalSafety', label: 'Cultural Safety' },
  { value: 'biasMitigation', label: 'Bias Mitigation' },
];

const SceneEditorModal: React.FC<SceneEditorModalProps> = ({ scene, onSave, onClose, instanceId }) => {
  const { uploadVideo, saveStreamVideo } = useVideoData();
  const [editedScene, setEditedScene] = useState<SceneData>(scene);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [showPreview, setShowPreview] = useState(false);
  const [videoEmbed, setVideoEmbed] = useState<VideoEmbedValue>({
    sourceType: scene.videoSourceType === 'stream' ? 'stream' : 'upload',
    file: null,
    streamUrl: scene.streamUrl || '',
    parsed: scene.streamUrl ? parseVideoUrl(scene.streamUrl) : null,
    title: '',
    description: '',
  });
  const [uploadedPreviewVideoUrl, setUploadedPreviewVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    setEditedScene({
      ...scene,
      vitalsDisplayConfig: scene.vitalsDisplayConfig || { ...defaultVitalsDisplayConfig },
    });
  }, [scene]);

  useEffect(() => {
    if (!videoEmbed.file) {
      setUploadedPreviewVideoUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(videoEmbed.file);
    setUploadedPreviewVideoUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [videoEmbed.file]);

  const effectivePreviewVideoUrl =
    videoEmbed.sourceType === 'stream' && videoEmbed.parsed?.embedUrl
      ? videoEmbed.parsed.embedUrl
      : videoEmbed.sourceType === 'upload'
        ? uploadedPreviewVideoUrl || editedScene.videoUrl || undefined
        : editedScene.videoUrl || undefined;
  const existingSavedVideoUrl = editedScene.videoUrl || scene.videoUrl || undefined;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const sceneToSave = { ...editedScene };

      if (videoEmbed.sourceType === 'stream' && videoEmbed.parsed) {
        await saveStreamVideo(parseInt(scene.id), videoEmbed.parsed.embedUrl, sceneToSave.title, sceneToSave.description, instanceId);
        sceneToSave.videoUrl = videoEmbed.parsed.embedUrl;
        sceneToSave.videoSourceType = 'stream';
        sceneToSave.streamUrl = videoEmbed.streamUrl;
      } else if (videoEmbed.sourceType === 'upload') {
        if (videoEmbed.file) {
          const insertData = await uploadVideo(videoEmbed.file, parseInt(scene.id), sceneToSave.title, sceneToSave.description, instanceId);
          if (insertData?.video_url) sceneToSave.videoUrl = insertData.video_url;
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
    setEditedScene(prev => ({ ...prev, [field]: value }));
  };

  const handleVitalsChange = (field: string, value: any) => {
    setEditedScene(prev => ({ ...prev, vitals: { ...prev.vitals, [field]: value } }));
  };

  const handleVisibilityToggle = (field: keyof typeof defaultVitalsVisibility) => {
    setEditedScene(prev => {
      const currentConfig = prev.vitalsDisplayConfig || { ...defaultVitalsDisplayConfig };
      return {
        ...prev,
        vitalsDisplayConfig: { ...currentConfig, visibility: { ...currentConfig.visibility, [field]: !currentConfig.visibility[field] } },
      };
    });
  };

  const handleVitalColorChange = (field: string, color: string) => {
    setEditedScene(prev => {
      const currentConfig = prev.vitalsDisplayConfig || { ...defaultVitalsDisplayConfig };
      return {
        ...prev,
        vitalsDisplayConfig: { ...currentConfig, colors: { ...currentConfig.colors, [field]: color } },
      };
    });
  };

  const addArrayItem = (field: 'clinicalFindings' | 'discussionPrompts') => {
    setEditedScene(prev => ({ ...prev, [field]: [...(prev[field] || []), ''] }));
  };

  const removeArrayItem = (field: 'clinicalFindings' | 'discussionPrompts', index: number) => {
    setEditedScene(prev => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== index) }));
  };

  const updateArrayItem = (field: 'clinicalFindings' | 'discussionPrompts', index: number, value: string) => {
    setEditedScene(prev => ({ ...prev, [field]: (prev[field] || []).map((item, i) => i === index ? value : item) }));
  };

  const toggleScoringCategory = (cat: string) => {
    const current = editedScene.scoringCategories || [];
    const updated = current.includes(cat as any)
      ? current.filter(c => c !== cat)
      : [...current, cat as any];
    handleInputChange('scoringCategories', updated);
  };

  const displayConfig = editedScene.vitalsDisplayConfig || defaultVitalsDisplayConfig;

  const quizCount = editedScene.quiz?.questions?.length ?? 0;
  const hasPrompt = !!editedScene.actionPrompt;

  // Sidebar tab definitions
  const TABS: { id: TabId; label: string; icon: React.FC<any>; badge?: string | null; description: string }[] = [
    { id: 'basic', label: 'Scene Info', icon: FileText, description: 'Title, description, video' },
    { id: 'vitals', label: 'Vital Signs', icon: Activity, description: 'Monitor values & display' },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle, badge: quizCount > 0 ? String(quizCount) : null, description: 'Knowledge check questions' },
    { id: 'prompts', label: 'Action Prompt', icon: MessageSquare, badge: hasPrompt ? '●' : null, description: 'Clinical decision activity' },
    { id: 'findings', label: 'Clinical Content', icon: Stethoscope, description: 'Findings, prompts & scoring' },
  ];

  if (showPreview) {
    return (
      <ScenePreview
        sceneData={editedScene}
        previewVideoUrl={effectivePreviewVideoUrl}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {scene.id}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-900 leading-tight truncate">
                {editedScene.title || 'Untitled Scene'}
              </h2>
              <p className="text-xs text-gray-400">Scene {scene.id} · Edit Configuration</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-xs font-medium"
            >
              <Play className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors text-xs font-semibold"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Body: sidebar + content ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left sidebar navigation */}
          <nav className="w-52 flex-shrink-0 border-r border-gray-100 bg-gray-50 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
            {TABS.map(({ id, label, icon: Icon, badge, description }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all group ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <div className={`mt-0.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold leading-tight">{label}</span>
                      {badge && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold leading-none ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 leading-tight block mt-0.5">{description}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />}
                </button>
              );
            })}

            {/* Separator + preview button */}
            <div className="mt-auto pt-3 border-t border-gray-200 px-1">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors text-xs font-medium"
              >
                <Play className="w-3.5 h-3.5" />
                Test in Preview
              </button>
            </div>
          </nav>

          {/* Main content area */}
          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}

            {/* ── Basic Info ── */}
            {activeTab === 'basic' && (
              <div className="p-6 space-y-6 max-w-3xl">
                <SectionHeader
                  title="Scene Information"
                  description="The title and description appear in the scene header that learners see during the simulation."
                />

                <FormField label="Scene Title" required>
                  <input
                    type="text"
                    value={editedScene.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    className={INPUT_CLS}
                    placeholder="e.g., Initial Assessment"
                  />
                </FormField>

                <FormField label="Description" hint="Shown as the scene context under the title">
                  <textarea
                    value={editedScene.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={`${INPUT_CLS} resize-none`}
                    placeholder="Brief description of this clinical scenario scene…"
                  />
                </FormField>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Video Content</p>
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <VideoEmbedInput
                      value={videoEmbed}
                      onChange={setVideoEmbed}
                      existingVideoUrl={existingSavedVideoUrl}
                      sceneId={scene.id}
                      compact
                    />
                  </div>
                </div>

                <FormField label="Poster / Thumbnail URL" hint="Shown while video loads">
                  <input
                    type="url"
                    value={editedScene.posterUrl || ''}
                    onChange={e => handleInputChange('posterUrl', e.target.value)}
                    className={INPUT_CLS}
                    placeholder="https://example.com/poster.jpg"
                  />
                </FormField>
              </div>
            )}

            {/* ── Vitals ── */}
            {activeTab === 'vitals' && (
              <div className="p-6 space-y-8 max-w-3xl">
                {/* Patient info strip */}
                <div>
                  <SectionHeader
                    title="Patient Identity"
                    description="Displayed in the vitals monitor header panel."
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {[
                      { key: 'patientName', label: 'Patient Name', type: 'text', placeholder: 'Tobi James' },
                      { key: 'age', label: 'Age', type: 'number', placeholder: '14' },
                      { key: 'bedNumber', label: 'Bed #', type: 'text', placeholder: '4B' },
                      { key: 'mrn', label: 'MRN', type: 'text', placeholder: 'MRN-00142' },
                    ].map(({ key, label, type, placeholder }) => (
                      <FormField key={key} label={label}>
                        <input
                          type={type}
                          value={(editedScene.vitals as any)[key] ?? ''}
                          onChange={e => handleVitalsChange(key, type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
                          className={INPUT_CLS}
                          placeholder={placeholder}
                        />
                      </FormField>
                    ))}
                  </div>
                </div>

                {/* Alarm toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleVitalsChange('isAlarmOn', !editedScene.vitals.isAlarmOn)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all w-full sm:w-auto ${
                      editedScene.vitals.isAlarmOn
                        ? 'border-red-400 bg-red-50 text-red-800'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${editedScene.vitals.isAlarmOn ? 'bg-red-200' : 'bg-gray-200'}`}>
                      🚨
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold">Monitor Alarm</div>
                      <div className="text-xs opacity-75">{editedScene.vitals.isAlarmOn ? 'Active — alarm flashing' : 'Off — normal display'}</div>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${editedScene.vitals.isAlarmOn ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>
                      {editedScene.vitals.isAlarmOn && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </button>
                </div>

                {/* Vitals visibility + values */}
                <div>
                  <SectionHeader title="Vital Signs" description="Toggle visibility and set values for this scene." />
                  <div className="mt-4 space-y-3">
                    {[
                      { key: 'heartRate' as const, visKey: 'heartRate' as const, label: 'Heart Rate', unit: 'bpm', type: 'number', step: '1' },
                      { key: 'systolic' as const, visKey: 'bloodPressure' as const, label: 'Systolic BP', unit: 'mmHg', type: 'number', step: '1' },
                      { key: 'diastolic' as const, visKey: 'bloodPressure' as const, label: 'Diastolic BP', unit: 'mmHg', type: 'number', step: '1' },
                      { key: 'respiratoryRate' as const, visKey: 'respiratoryRate' as const, label: 'Respiratory Rate', unit: 'rpm', type: 'number', step: '1' },
                      { key: 'oxygenSaturation' as const, visKey: 'oxygenSaturation' as const, label: 'SpO₂', unit: '%', type: 'number', step: '1' },
                      { key: 'temperature' as const, visKey: 'temperature' as const, label: 'Temperature', unit: '°C', type: 'number', step: '0.1' },
                      { key: 'painLevel' as const, visKey: 'painLevel' as const, label: 'Pain Level', unit: '/10', type: 'number', step: '1', optional: true },
                    ].map(({ key, visKey, label, unit, type, step, optional }) => {
                      const colorKey = visKey === 'bloodPressure' ? 'bloodPressure' : visKey;
                      const currentColor = (displayConfig.colors as any)?.[colorKey] || 'cyan';
                      const isVisible = displayConfig.visibility[visKey];
                      return (
                        <div key={key} className={`rounded-xl border-2 p-3 transition-all ${isVisible ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                          <div className="flex items-center gap-3">
                            {/* Visibility toggle */}
                            <button
                              type="button"
                              onClick={() => handleVisibilityToggle(visKey)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isVisible ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                            >
                              {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            {/* Label */}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-700">{label}</div>
                            </div>
                            {/* Color dot */}
                            <div
                              className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: COLOR_HEX[currentColor] }}
                              title={`Color: ${currentColor}`}
                            />
                            {/* Value input */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <input
                                type={type}
                                step={step}
                                min={optional ? '' : '0'}
                                max={visKey === 'painLevel' ? '10' : undefined}
                                value={(editedScene.vitals as any)[key] ?? ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  handleVitalsChange(key, val === '' ? undefined : (step === '0.1' ? parseFloat(val) : parseInt(val)) || 0);
                                }}
                                className="w-20 p-1.5 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={optional ? 'Hide' : '0'}
                              />
                              <span className="text-xs text-gray-400 w-8">{unit}</span>
                            </div>
                          </div>

                          {/* Color picker — show for all visible vitals except diastolic (it shares BP color with systolic) */}
                          {isVisible && key !== 'diastolic' && (
                            <div className="mt-2 ml-11 flex flex-wrap gap-1 items-center">
                              {VITAL_COLORS.map(color => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => handleVitalColorChange(colorKey, color)}
                                  className={`w-5 h-5 rounded-full ${COLOR_SWATCHES[color]} transition-all ${
                                    currentColor === color ? 'ring-2 ring-offset-1 ring-blue-500 scale-110' : 'opacity-50 hover:opacity-100'
                                  }`}
                                  title={color}
                                />
                              ))}
                              {key === 'systolic' && (
                                <span className="text-xs text-gray-400 ml-1">applies to both BP values</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Patient Info visibility toggle */}
                    <div className={`rounded-xl border-2 p-3 transition-all ${displayConfig.visibility.patientInfo ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleVisibilityToggle('patientInfo')}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${displayConfig.visibility.patientInfo ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {displayConfig.visibility.patientInfo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <div className="flex-1 text-sm font-medium text-gray-700">Patient Info Header</div>
                        <span className="text-xs text-gray-400">Name, age, MRN, bed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Quiz ── */}
            {activeTab === 'quiz' && (
              <div className="p-6 space-y-4 max-w-3xl">
                <SectionHeader
                  title="Quiz Questions"
                  description="Add knowledge-check questions. Learners see one question at a time and get immediate feedback with your explanation after answering."
                />
                <QuizQuestionsEditor
                  questions={editedScene.quiz?.questions || []}
                  onChange={questions => handleInputChange('quiz', questions.length > 0 ? { questions } : undefined)}
                />
              </div>
            )}

            {/* ── Prompts ── */}
            {activeTab === 'prompts' && (
              <div className="p-6 space-y-4 max-w-3xl">
                <SectionHeader
                  title="Action Prompt"
                  description="An interactive clinical decision activity shown in the right panel. Choose from single-choice, multi-select, SBAR communication, or open reflection. Only one per scene."
                />
                <ActionPromptsEditor
                  actionPrompt={editedScene.actionPrompt}
                  onChange={actionPrompt => handleInputChange('actionPrompt', actionPrompt)}
                />
              </div>
            )}

            {/* ── Findings / Clinical Content ── */}
            {activeTab === 'findings' && (
              <div className="p-6 space-y-8 max-w-3xl">
                {/* Clinical Findings */}
                <div>
                  <SectionHeader
                    title="Clinical Findings"
                    description="Bullet points shown in the left panel alongside the video. Use concise clinical observations."
                  />
                  <div className="mt-4 space-y-2">
                    {(editedScene.clinicalFindings || []).map((finding, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </div>
                        <input
                          type="text"
                          value={finding}
                          onChange={e => updateArrayItem('clinicalFindings', i, e.target.value)}
                          className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white"
                          placeholder="e.g., HR 124 bpm, elevated and irregular"
                        />
                        <button
                          onClick={() => removeArrayItem('clinicalFindings', i)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem('clinicalFindings')}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium py-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add clinical finding
                    </button>
                  </div>
                </div>

                {/* Discussion Prompts */}
                <div>
                  <SectionHeader
                    title="Discussion Prompts"
                    description="Debrief questions shown after the scene is completed. Encourage reflection and group discussion."
                  />
                  <div className="mt-4 space-y-2">
                    {(editedScene.discussionPrompts || []).map((prompt, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-2.5">
                          {i + 1}
                        </div>
                        <textarea
                          value={prompt}
                          onChange={e => updateArrayItem('discussionPrompts', i, e.target.value)}
                          className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 focus:bg-white"
                          rows={2}
                          placeholder="e.g., What biases might influence how clinicians respond to Tobi's pain?"
                        />
                        <button
                          onClick={() => removeArrayItem('discussionPrompts', i)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 mt-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem('discussionPrompts')}
                      className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium py-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add discussion prompt
                    </button>
                  </div>
                </div>

                {/* Scoring Categories */}
                <div>
                  <SectionHeader
                    title="Scoring Categories"
                    description="Tag this scene's interactions against learning domains. Used in the results breakdown."
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {SCORING_CATEGORIES.map(({ value, label }) => {
                      const active = (editedScene.scoringCategories || []).includes(value as any);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggleScoringCategory(value)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-sm font-medium transition-all ${
                            active
                              ? 'border-blue-500 bg-blue-50 text-blue-800'
                              : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 text-xs ${active ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                            {active && <span className="text-white font-bold">✓</span>}
                          </div>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

// ── Helper sub-components ──────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div>
    <h3 className="text-sm font-bold text-gray-900">{title}</h3>
    {description && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>}
  </div>
);

const FormField: React.FC<{
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, hint, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
      {hint && <span className="text-gray-400 font-normal ml-1.5 text-xs">{hint}</span>}
    </label>
    {children}
  </div>
);

export default SceneEditorModal;
