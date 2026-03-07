import React, { useMemo, useState } from 'react';
import {
  Activity,
  Play,
  HelpCircle,
  MessageSquare,
  Stethoscope,
  Volume2,
  FileText,
  Save,
  Eye,
  Loader2,
  Layout,
  ArrowRight,
} from 'lucide-react';
import { SceneData, SceneComponentType, defaultVitalsVisibility } from '../../../data/scenesData';
import { VideoEmbedValue } from '../VideoEmbedInput';
import { COMPONENT_REGISTRY, COMPONENT_ORDER } from './componentRegistry';
import ComponentConfigurator from './ComponentConfigurator';

interface BuilderModeViewProps {
  sceneData: SceneData;
  videoEmbed: VideoEmbedValue;
  saving: boolean;
  onSceneDataChange: (field: keyof SceneData, value: SceneData[keyof SceneData]) => void;
  onVitalsChange: (field: keyof SceneData['vitals'], value: SceneData['vitals'][keyof SceneData['vitals']]) => void;
  onVisibilityToggle: (field: keyof typeof defaultVitalsVisibility) => void;
  onVitalColorChange: (field: string, color: string) => void;
  onVideoEmbedChange: (value: VideoEmbedValue) => void;
  onArrayItemAdd: (field: 'clinicalFindings' | 'discussionPrompts') => void;
  onArrayItemRemove: (field: 'clinicalFindings' | 'discussionPrompts', index: number) => void;
  onArrayItemUpdate: (field: 'clinicalFindings' | 'discussionPrompts', index: number, value: string) => void;
  onSave: () => void;
  onPreview: () => void;
  onSwitchToCanvas: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Activity, Play, HelpCircle, MessageSquare, Stethoscope, Volume2, FileText,
};

const TYPE_COLORS: Record<SceneComponentType, string> = {
  'scene-header':       'bg-purple-500',
  'vitals-monitor':     'bg-cyan-500',
  'video-player':       'bg-orange-500',
  'clinical-findings':  'bg-green-500',
  'interactive-panel':  'bg-blue-500',
  'quiz-panel':         'bg-blue-500',
  'action-prompt':      'bg-pink-500',
  'audio-player':       'bg-sky-500',
};

// Content completeness check per section
function getSectionStatus(type: SceneComponentType, sceneData: SceneData): 'complete' | 'partial' | 'empty' {
  const isQuizQuestionComplete = (question: NonNullable<SceneData['quiz']>['questions'][number]) => {
    const hasQuestionText = question.question.trim().length > 0;
    if (!hasQuestionText) return false;
    if (question.type === 'text-input') return true;
    if (question.type === 'multiple-choice') return typeof question.correctAnswer === 'string' && question.correctAnswer.trim().length > 0;
    return Array.isArray(question.correctAnswer) && question.correctAnswer.length > 0;
  };

  const getQuizStatus = (): 'complete' | 'partial' | 'empty' => {
    const questions = sceneData.quiz?.questions || [];
    if (questions.length === 0) return 'empty';
    const completeCount = questions.filter(isQuizQuestionComplete).length;
    if (completeCount === questions.length) return 'complete';
    return completeCount > 0 ? 'partial' : 'empty';
  };

  const getActionPromptStatus = (): 'complete' | 'partial' | 'empty' => {
    const prompt = sceneData.actionPrompt;
    if (!prompt) return 'empty';
    const hasTitle = prompt.title.trim().length > 0;
    const hasContent = prompt.content.trim().length > 0;
    const hasRequiredText = hasTitle && hasContent;

    if (prompt.type === 'reflection' || prompt.type === 'sbar') {
      return hasRequiredText ? 'complete' : 'partial';
    }

    const options = prompt.options || [];
    const nonEmptyOptions = options.filter(option => option.trim().length > 0);
    const hasValidOptions = nonEmptyOptions.length >= 2;
    const hasCorrect = (prompt.correctAnswers || []).length > 0;

    if (hasRequiredText && hasValidOptions && hasCorrect) return 'complete';
    return hasRequiredText || hasValidOptions || hasCorrect ? 'partial' : 'empty';
  };

  switch (type) {
    case 'scene-header':
      return sceneData.title?.trim() && sceneData.description?.trim() ? 'complete' : sceneData.title?.trim() ? 'partial' : 'empty';
    case 'video-player':
      return sceneData.videoUrl ? 'complete' : 'empty';
    case 'vitals-monitor':
      return sceneData.vitals?.patientName?.trim() ? 'complete' : 'partial';
    case 'clinical-findings':
      return (sceneData.clinicalFindings?.length ?? 0) > 0 ? 'complete' : 'empty';
    case 'interactive-panel': {
      const q = getQuizStatus();
      const a = getActionPromptStatus();
      if (q === 'complete' || a === 'complete') return 'complete';
      if (q === 'partial' || a === 'partial') return 'partial';
      return 'empty';
    }
    case 'quiz-panel':
      return getQuizStatus();
    case 'action-prompt':
      return getActionPromptStatus();
    case 'audio-player':
      return 'partial'; // managed externally
    default:
      return 'empty';
  }
}

const STATUS_DOTS: Record<string, string> = {
  complete: 'bg-green-400',
  partial: 'bg-amber-400',
  empty: 'bg-gray-300',
};

const BuilderModeView: React.FC<BuilderModeViewProps> = ({
  sceneData,
  videoEmbed,
  saving,
  onSceneDataChange,
  onVitalsChange,
  onVisibilityToggle,
  onVitalColorChange,
  onVideoEmbedChange,
  onArrayItemAdd,
  onArrayItemRemove,
  onArrayItemUpdate,
  onSave,
  onPreview,
  onSwitchToCanvas,
}) => {
  const [activeSection, setActiveSection] = useState<SceneComponentType>('scene-header');
  const sectionStatuses = useMemo(
    () =>
      COMPONENT_ORDER.reduce<Record<SceneComponentType, 'complete' | 'partial' | 'empty'>>((acc, type) => {
        acc[type] = getSectionStatus(type, sceneData);
        return acc;
      }, {} as Record<SceneComponentType, 'complete' | 'partial' | 'empty'>),
    [sceneData],
  );

  const def = COMPONENT_REGISTRY[activeSection];
  const Icon = ICON_MAP[def.icon] || FileText;

  return (
    <div className="flex flex-1 overflow-hidden bg-gray-50">
      {/* ── Left sidebar: section list ──────────────────────────────────── */}
      <div className="flex-shrink-0 w-72 flex flex-col bg-white border-r border-gray-200 overflow-hidden">
        {/* Sidebar header */}
        <div className="flex-shrink-0 px-4 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Content Sections</h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Edit content for each section. Switch to Canvas to arrange them.
          </p>
        </div>

        {/* Section list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {COMPONENT_ORDER.map((type) => {
            const d = COMPONENT_REGISTRY[type];
            const SectionIcon = ICON_MAP[d.icon] || FileText;
            const isActive = activeSection === type;
            const status = sectionStatuses[type];

            return (
              <button
                key={type}
                onClick={() => setActiveSection(type)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-blue-50 border border-blue-200 shadow-sm'
                    : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg ${TYPE_COLORS[type]} flex items-center justify-center flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                  <SectionIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                    {d.label}
                  </div>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5 truncate">{d.description}</p>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOTS[status]}`} title={status} />
              </button>
            );
          })}
        </div>

        {/* Footer: status legend + switch to canvas */}
        <div className="flex-shrink-0 p-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-3 px-1 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Done</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Partial</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> Empty</span>
          </div>
          <button
            onClick={onSwitchToCanvas}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Layout className="w-4 h-4" />
            Switch to Canvas
            <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-60" />
          </button>
        </div>
      </div>

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Section header bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${TYPE_COLORS[activeSection]} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{def.label}</h2>
              <p className="text-xs text-gray-500">{def.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-medium transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Scrollable configurator content */}
        <div className="flex-1 overflow-hidden">
          <ComponentConfigurator
            selectedType={activeSection}
            sceneData={sceneData}
            videoEmbed={videoEmbed}
            onSceneDataChange={onSceneDataChange}
            onVitalsChange={onVitalsChange}
            onVisibilityToggle={onVisibilityToggle}
            onVitalColorChange={onVitalColorChange}
            onVideoEmbedChange={onVideoEmbedChange}
            onArrayItemAdd={onArrayItemAdd}
            onArrayItemRemove={onArrayItemRemove}
            onArrayItemUpdate={onArrayItemUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default BuilderModeView;
