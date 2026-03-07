import React from 'react';
import {
  Activity,
  Play,
  HelpCircle,
  MessageSquare,
  Stethoscope,
  Volume2,
  FileText,
  Eye,
  EyeOff,
  Settings2,
} from 'lucide-react';
import { SceneData, SceneComponentType, VitalsDisplayConfig, defaultVitalsDisplayConfig, defaultVitalsVisibility } from '../../../data/scenesData';
import { COMPONENT_REGISTRY } from './componentRegistry';
import QuizQuestionsEditor from '../QuizQuestionsEditor';
import ActionPromptsEditor from '../ActionPromptsEditor';
import VideoEmbedInput, { VideoEmbedValue } from '../VideoEmbedInput';

interface ComponentConfiguratorProps {
  selectedType: SceneComponentType | null;
  sceneData: SceneData;
  videoEmbed: VideoEmbedValue;
  onSceneDataChange: (field: keyof SceneData, value: SceneData[keyof SceneData]) => void;
  onVitalsChange: (field: keyof SceneData['vitals'], value: SceneData['vitals'][keyof SceneData['vitals']]) => void;
  onVisibilityToggle: (field: keyof typeof defaultVitalsVisibility) => void;
  onVitalColorChange: (field: string, color: string) => void;
  onVideoEmbedChange: (value: VideoEmbedValue) => void;
  onArrayItemAdd: (field: 'clinicalFindings' | 'discussionPrompts') => void;
  onArrayItemRemove: (field: 'clinicalFindings' | 'discussionPrompts', index: number) => void;
  onArrayItemUpdate: (field: 'clinicalFindings' | 'discussionPrompts', index: number, value: string) => void;
}

const INPUT_CLS = 'w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors';

const VITAL_COLORS = ['cyan', 'green', 'yellow', 'red', 'purple', 'blue', 'orange', 'pink'];
type VitalColorName = (typeof VITAL_COLORS)[number];
type VitalColorKey = keyof NonNullable<VitalsDisplayConfig['colors']>;
const COLOR_HEX: Record<string, string> = {
  cyan: '#22d3ee', green: '#4ade80', yellow: '#facc15', red: '#f87171',
  purple: '#c084fc', blue: '#60a5fa', orange: '#fb923c', pink: '#f472b6',
};
const COLOR_SWATCHES: Record<string, string> = {
  cyan: 'bg-cyan-400', green: 'bg-green-400', yellow: 'bg-yellow-400', red: 'bg-red-400',
  purple: 'bg-purple-400', blue: 'bg-blue-400', orange: 'bg-orange-400', pink: 'bg-pink-400',
};

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Activity, Play, HelpCircle, MessageSquare, Stethoscope, Volume2, FileText,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{children}</p>
  );
}

// ─── Per-component editors ────────────────────────────────────────────────────

function SceneHeaderConfig({ sceneData, onSceneDataChange }: Pick<ComponentConfiguratorProps, 'sceneData' | 'onSceneDataChange'>) {
  return (
    <div className="space-y-3">
      <SectionLabel>Scene Header</SectionLabel>
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">Title</label>
        <input
          type="text"
          value={sceneData.title}
          onChange={e => onSceneDataChange('title', e.target.value)}
          className={INPUT_CLS}
          placeholder="Scene title…"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">Description</label>
        <textarea
          value={sceneData.description}
          onChange={e => onSceneDataChange('description', e.target.value)}
          rows={4}
          className={`${INPUT_CLS} resize-none`}
          placeholder="Brief clinical scenario description…"
        />
      </div>
    </div>
  );
}

function VitalsConfig({
  sceneData,
  onVitalsChange,
  onVisibilityToggle,
  onVitalColorChange,
}: Pick<ComponentConfiguratorProps, 'sceneData' | 'onVitalsChange' | 'onVisibilityToggle' | 'onVitalColorChange'>) {
  const displayConfig: VitalsDisplayConfig = sceneData.vitalsDisplayConfig || defaultVitalsDisplayConfig;

  const VITALS = [
    { key: 'heartRate' as const, visKey: 'heartRate' as const, label: 'Heart Rate', unit: 'bpm', step: '1' },
    { key: 'systolic' as const, visKey: 'bloodPressure' as const, label: 'Systolic BP', unit: 'mmHg', step: '1' },
    { key: 'diastolic' as const, visKey: 'bloodPressure' as const, label: 'Diastolic BP', unit: 'mmHg', step: '1' },
    { key: 'respiratoryRate' as const, visKey: 'respiratoryRate' as const, label: 'Resp. Rate', unit: 'rpm', step: '1' },
    { key: 'oxygenSaturation' as const, visKey: 'oxygenSaturation' as const, label: 'SpO₂', unit: '%', step: '1' },
    { key: 'temperature' as const, visKey: 'temperature' as const, label: 'Temperature', unit: '°C', step: '0.1' },
    { key: 'painLevel' as const, visKey: 'painLevel' as const, label: 'Pain Level', unit: '/10', step: '1', optional: true as boolean },
  ];

  const PATIENT_FIELDS = [
    { key: 'patientName', label: 'Patient Name', type: 'text', placeholder: 'Tobi James' },
    { key: 'age', label: 'Age', type: 'number', placeholder: '15' },
    { key: 'bedNumber', label: 'Bed #', type: 'text', placeholder: '4B' },
    { key: 'mrn', label: 'MRN', type: 'text', placeholder: 'MRN-00142' },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Patient info */}
      <div>
        <SectionLabel>Patient Info</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {PATIENT_FIELDS.map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type={type}
                value={sceneData.vitals[key] ?? ''}
                onChange={e => onVitalsChange(key, type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
                className={INPUT_CLS}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Alarm toggle */}
      <div>
        <SectionLabel>Alarm</SectionLabel>
        <button
          type="button"
          onClick={() => onVitalsChange('isAlarmOn', !sceneData.vitals.isAlarmOn)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all w-full text-left text-sm ${sceneData.vitals.isAlarmOn
            ? 'border-red-400 bg-red-50 text-red-800'
            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
            }`}
        >
          <span className="text-base">🚨</span>
          <div className="flex-1">
            <div className="font-medium text-xs">Monitor Alarm</div>
            <div className="text-xs opacity-75">{sceneData.vitals.isAlarmOn ? 'Active' : 'Off'}</div>
          </div>
          <div className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-colors ${sceneData.vitals.isAlarmOn ? 'bg-red-500' : 'bg-gray-300'}`}>
            <div className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${sceneData.vitals.isAlarmOn ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>

      {/* Vital values */}
      <div>
        <SectionLabel>Vital Values</SectionLabel>
        <div className="space-y-2">
          {VITALS.map(({ key, visKey, label, unit, step, optional }) => {
            const colorKey: VitalColorKey = visKey === 'bloodPressure' ? 'bloodPressure' : visKey;
            const currentColor = (displayConfig.colors?.[colorKey] || 'cyan') as VitalColorName;
            const isVisible = displayConfig.visibility[visKey];

            return (
              <div key={key} className={`rounded-lg border p-2 transition-all ${isVisible ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onVisibilityToggle(visKey)}
                    className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${isVisible ? 'text-blue-600' : 'text-gray-400'}`}
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <span className="flex-1 text-xs font-medium text-gray-700">{label}</span>
                  <div className="w-4 h-4 rounded-full border border-white/50 shadow-sm flex-shrink-0" style={{ backgroundColor: COLOR_HEX[currentColor] }} />
                  <input
                    type="number"
                    step={step}
                    min={optional ? '' : '0'}
                    max={visKey === 'painLevel' ? '10' : undefined}
                    value={sceneData.vitals[key] ?? ''}
                    onChange={e => {
                      const val = e.target.value;
                      onVitalsChange(key, val === '' ? undefined : (step === '0.1' ? parseFloat(val) : parseInt(val)) || 0);
                    }}
                    className="w-16 p-1 border border-gray-200 rounded text-xs text-center focus:ring-1 focus:ring-blue-500"
                    placeholder={optional ? '—' : '0'}
                  />
                  <span className="text-xs text-gray-400 w-7">{unit}</span>
                </div>

                {isVisible && key !== 'diastolic' && (
                  <div className="flex gap-1 mt-1.5 ml-8 flex-wrap">
                    {VITAL_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => onVitalColorChange(colorKey, color)}
                        className={`w-4 h-4 rounded-full ${COLOR_SWATCHES[color]} transition-all ${currentColor === color ? 'ring-2 ring-offset-1 ring-blue-500 scale-110' : 'opacity-50 hover:opacity-100'
                          }`}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Patient info visibility */}
          <div className={`rounded-lg border p-2 transition-all ${displayConfig.visibility.patientInfo ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onVisibilityToggle('patientInfo')}
                className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${displayConfig.visibility.patientInfo ? 'text-blue-600' : 'text-gray-400'}`}
              >
                {displayConfig.visibility.patientInfo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <span className="flex-1 text-xs font-medium text-gray-700">Patient Info Header</span>
              <span className="text-xs text-gray-400">Name, age, MRN…</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoConfig({ sceneData, videoEmbed, onVideoEmbedChange }: Pick<ComponentConfiguratorProps, 'sceneData' | 'videoEmbed' | 'onVideoEmbedChange'>) {
  return (
    <div className="space-y-3">
      <SectionLabel>Video Content</SectionLabel>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <VideoEmbedInput
          value={videoEmbed}
          onChange={onVideoEmbedChange}
          existingVideoUrl={sceneData.videoUrl}
          sceneId={sceneData.id}
          compact
        />
      </div>
    </div>
  );
}

function ClinicalFindingsConfig({ sceneData, onArrayItemAdd, onArrayItemRemove, onArrayItemUpdate }: Pick<ComponentConfiguratorProps, 'sceneData' | 'onArrayItemAdd' | 'onArrayItemRemove' | 'onArrayItemUpdate'>) {
  const findings = sceneData.clinicalFindings || [];
  return (
    <div className="space-y-3">
      <SectionLabel>Clinical Findings</SectionLabel>
      <div className="space-y-1.5">
        {findings.map((finding, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </div>
            <input
              type="text"
              value={finding}
              onChange={e => onArrayItemUpdate('clinicalFindings', i, e.target.value)}
              className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., HR 124 bpm, elevated"
            />
            <button
              onClick={() => onArrayItemRemove('clinicalFindings', i)}
              className="p-1 text-gray-300 hover:text-red-500 transition-colors text-xs leading-none"
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => onArrayItemAdd('clinicalFindings')}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium py-1 w-full"
        >
          <span className="text-base leading-none">+</span>
          Add finding
        </button>
      </div>
    </div>
  );
}

function QuizConfig({ sceneData, onSceneDataChange }: Pick<ComponentConfiguratorProps, 'sceneData' | 'onSceneDataChange'>) {
  return (
    <div className="space-y-3">
      <SectionLabel>Quiz Questions</SectionLabel>
      <QuizQuestionsEditor
        questions={sceneData.quiz?.questions || []}
        onChange={questions => onSceneDataChange('quiz', questions.length > 0 ? { questions } : undefined)}
      />
    </div>
  );
}

function ActionPromptConfig({ sceneData, onSceneDataChange }: Pick<ComponentConfiguratorProps, 'sceneData' | 'onSceneDataChange'>) {
  return (
    <div className="space-y-3">
      <SectionLabel>Action Prompt</SectionLabel>
      <ActionPromptsEditor
        actionPrompt={sceneData.actionPrompt}
        onChange={ap => onSceneDataChange('actionPrompt', ap)}
      />
    </div>
  );
}

function AudioConfig() {
  return (
    <div className="space-y-3">
      <SectionLabel>Character Audio</SectionLabel>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="text-xs text-gray-600 leading-relaxed">
          Audio clips are managed from the scene audio management workflow. Use this component to control
          visibility and placement on the canvas.
        </p>
      </div>
    </div>
  );
}

// ─── Main configurator ────────────────────────────────────────────────────────

function ComponentConfigurator({
  selectedType,
  sceneData,
  videoEmbed,
  onSceneDataChange,
  onVitalsChange,
  onVisibilityToggle,
  onVitalColorChange,
  onVideoEmbedChange,
  onArrayItemAdd,
  onArrayItemRemove,
  onArrayItemUpdate,
}: ComponentConfiguratorProps) {

  if (!selectedType) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
          <Settings2 className="w-6 h-6 text-gray-500" />
        </div>
        <p className="text-sm font-semibold text-gray-300">No component selected</p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Click any component on the canvas<br />to configure its settings
        </p>
      </div>
    );
  }

  const def = COMPONENT_REGISTRY[selectedType];
  const Icon = ICON_MAP[def.icon] || Settings2;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Config header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{def.label}</h3>
            <p className="text-xs text-gray-500 leading-none">{def.description}</p>
          </div>
        </div>
      </div>

      {/* Config body */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedType === 'scene-header' && (
          <SceneHeaderConfig sceneData={sceneData} onSceneDataChange={onSceneDataChange} />
        )}
        {selectedType === 'vitals-monitor' && (
          <VitalsConfig
            sceneData={sceneData}
            onVitalsChange={onVitalsChange}
            onVisibilityToggle={onVisibilityToggle}
            onVitalColorChange={onVitalColorChange}
          />
        )}
        {selectedType === 'video-player' && (
          <VideoConfig sceneData={sceneData} videoEmbed={videoEmbed} onVideoEmbedChange={onVideoEmbedChange} />
        )}
        {selectedType === 'clinical-findings' && (
          <ClinicalFindingsConfig
            sceneData={sceneData}
            onArrayItemAdd={onArrayItemAdd}
            onArrayItemRemove={onArrayItemRemove}
            onArrayItemUpdate={onArrayItemUpdate}
          />
        )}
        {(selectedType === 'interactive-panel' || selectedType === 'quiz-panel' || selectedType === 'action-prompt') && (
          <div className="space-y-5">
            <QuizConfig sceneData={sceneData} onSceneDataChange={onSceneDataChange} />
            <div className="border-t border-gray-200 pt-4">
              <ActionPromptConfig sceneData={sceneData} onSceneDataChange={onSceneDataChange} />
            </div>
          </div>
        )}
        {selectedType === 'audio-player' && (
          <AudioConfig />
        )}
      </div>
    </div>
  );
}

export default ComponentConfigurator;
