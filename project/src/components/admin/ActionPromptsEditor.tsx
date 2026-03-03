import React from 'react';
import {
  MousePointerClick,
  ListChecks,
  FileText,
  Network,
  Plus,
  X,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import { ActionPrompt } from '../QuizComponent';

interface ActionPromptsEditorProps {
  actionPrompt?: ActionPrompt;
  onChange: (actionPrompt: ActionPrompt | undefined) => void;
}

const PROMPT_TYPES = [
  {
    value: 'action-selection' as const,
    label: 'Action Select',
    description: 'Learner picks one clinical action',
    icon: MousePointerClick,
    color: 'purple',
    hasOptions: true,
  },
  {
    value: 'multi-select' as const,
    label: 'Multi-Select',
    description: 'Select all appropriate interventions',
    icon: ListChecks,
    color: 'blue',
    hasOptions: true,
  },
  {
    value: 'sbar' as const,
    label: 'SBAR',
    description: 'Drag-and-drop handoff communication',
    icon: Network,
    color: 'orange',
    hasOptions: false,
  },
  {
    value: 'reflection' as const,
    label: 'Reflection',
    description: 'Free-text open response',
    icon: FileText,
    color: 'teal',
    hasOptions: false,
  },
];

const TYPE_COLORS: Record<string, { active: string; icon: string; badge: string }> = {
  purple: {
    active: 'border-purple-400 bg-purple-50 shadow-sm',
    icon: 'text-purple-600 bg-purple-100',
    badge: 'bg-purple-100 text-purple-800',
  },
  blue: {
    active: 'border-blue-400 bg-blue-50 shadow-sm',
    icon: 'text-blue-600 bg-blue-100',
    badge: 'bg-blue-100 text-blue-800',
  },
  orange: {
    active: 'border-orange-400 bg-orange-50 shadow-sm',
    icon: 'text-orange-600 bg-orange-100',
    badge: 'bg-orange-100 text-orange-800',
  },
  teal: {
    active: 'border-teal-400 bg-teal-50 shadow-sm',
    icon: 'text-teal-600 bg-teal-100',
    badge: 'bg-teal-100 text-teal-800',
  },
};

const OPTION_LABELS = 'ABCDEFGHIJ'.split('');

const ActionPromptsEditor: React.FC<ActionPromptsEditorProps> = ({ actionPrompt, onChange }) => {
  const selectedType = PROMPT_TYPES.find(t => t.value === actionPrompt?.type);

  const handleSelectType = (type: ActionPrompt['type']) => {
    if (actionPrompt?.type === type) return;
    const hasOptions = PROMPT_TYPES.find(t => t.value === type)?.hasOptions;
    onChange({
      type,
      title: actionPrompt?.title || '',
      content: actionPrompt?.content || '',
      options: hasOptions ? (actionPrompt?.options || ['', '']) : undefined,
      correctAnswers: hasOptions ? (actionPrompt?.correctAnswers || []) : undefined,
      explanation: actionPrompt?.explanation || '',
    });
  };

  const updatePrompt = (updates: Partial<ActionPrompt>) => {
    if (actionPrompt) onChange({ ...actionPrompt, ...updates });
  };

  const addOption = () => {
    if (actionPrompt?.options) updatePrompt({ options: [...actionPrompt.options, ''] });
  };

  const updateOption = (i: number, val: string) => {
    if (!actionPrompt?.options) return;
    const updated = [...actionPrompt.options];
    updated[i] = val;
    updatePrompt({ options: updated });
  };

  const removeOption = (i: number) => {
    if (!actionPrompt?.options || actionPrompt.options.length <= 2) return;
    const removed = actionPrompt.options[i];
    updatePrompt({
      options: actionPrompt.options.filter((_, idx) => idx !== i),
      correctAnswers: (actionPrompt.correctAnswers || []).filter(a => a !== removed),
    });
  };

  const toggleCorrect = (opt: string) => {
    if (!actionPrompt) return;
    if (actionPrompt.type === 'action-selection') {
      updatePrompt({ correctAnswers: [opt] });
    } else {
      const current = actionPrompt.correctAnswers || [];
      updatePrompt({
        correctAnswers: current.includes(opt)
          ? current.filter(a => a !== opt)
          : [...current, opt],
      });
    }
  };

  const isCorrect = (opt: string) =>
    (actionPrompt?.correctAnswers || []).includes(opt);

  return (
    <div className="space-y-5">
      {/* Type selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Prompt Type
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PROMPT_TYPES.map(({ value, label, description, icon: Icon, color }) => {
            const colors = TYPE_COLORS[color];
            const isActive = actionPrompt?.type === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleSelectType(value)}
                className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${
                  isActive ? colors.active : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                  isActive ? colors.icon : 'bg-gray-200 text-gray-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-gray-800">{label}</span>
                <span className="text-xs text-gray-400 leading-snug mt-0.5">{description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* No prompt selected state */}
      {!actionPrompt && (
        <div className="text-center py-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
          <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center mx-auto mb-3">
            <MousePointerClick className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Select a prompt type above to configure this scene's interaction.</p>
        </div>
      )}

      {/* Prompt configuration */}
      {actionPrompt && selectedType && (
        <div className="space-y-4 p-4 rounded-2xl border border-gray-200 bg-white">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLORS[selectedType.color].badge}`}>
                {selectedType.label}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove prompt
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Prompt Title
            </label>
            <input
              type="text"
              value={actionPrompt.title}
              onChange={e => updatePrompt({ title: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
              placeholder="e.g., Select initial actions for Tobi's care:"
            />
          </div>

          {/* Content / instructions */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Instructions / Context
            </label>
            <textarea
              value={actionPrompt.content}
              onChange={e => updatePrompt({ content: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none bg-gray-50 focus:bg-white transition-colors"
              rows={3}
              placeholder="Describe the clinical scenario and what the learner must decide…"
            />
          </div>

          {/* SBAR / Reflection info banners */}
          {actionPrompt.type === 'sbar' && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-2.5">
              <Network className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-orange-800">SBAR Word-Bank Interface</p>
                <p className="text-xs text-orange-700 mt-0.5">
                  The learner will see a drag-and-drop word bank to construct an SBAR communication. This is automatically configured — no options needed. Add guidance text above.
                </p>
              </div>
            </div>
          )}

          {actionPrompt.type === 'reflection' && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-teal-800">Open Reflection</p>
                <p className="text-xs text-teal-700 mt-0.5">
                  Learners write a free-text response. Reflections are always marked as complete when submitted. Use the guidance field below to set debrief expectations.
                </p>
              </div>
            </div>
          )}

          {/* Options editor (for choice-based prompts) */}
          {selectedType.hasOptions && actionPrompt.options && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Answer Options
                  <span className="text-gray-400 font-normal ml-1 normal-case">
                    — {actionPrompt.type === 'action-selection' ? 'click radio to mark correct' : 'check all correct options'}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  Add option
                </button>
              </div>
              <div className="space-y-2">
                {actionPrompt.options.map((opt, i) => (
                  <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all ${
                    isCorrect(opt) ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    {/* Correct selector */}
                    {actionPrompt.type === 'action-selection' ? (
                      <button
                        type="button"
                        onClick={() => toggleCorrect(opt)}
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all flex items-center justify-center ${
                          isCorrect(opt) ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {isCorrect(opt) && <div className="w-2 h-2 bg-white rounded-full" />}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleCorrect(opt)}
                        className={`w-5 h-5 rounded border-2 flex-shrink-0 transition-all flex items-center justify-center ${
                          isCorrect(opt) ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {isCorrect(opt) && (
                          <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-none stroke-current stroke-2">
                            <polyline points="2,6 5,9 10,3" />
                          </svg>
                        )}
                      </button>
                    )}
                    <span className={`text-xs font-bold w-5 flex-shrink-0 ${isCorrect(opt) ? 'text-green-700' : 'text-gray-400'}`}>
                      {OPTION_LABELS[i]}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => updateOption(i, e.target.value)}
                      className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                      placeholder={`Option ${OPTION_LABELS[i]}`}
                    />
                    {actionPrompt.options!.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {(actionPrompt.correctAnswers || []).length === 0 && actionPrompt.options.some(o => o.trim()) && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  {actionPrompt.type === 'action-selection'
                    ? 'Click the radio button on an option to mark it as correct.'
                    : 'Check one or more options to mark them as correct.'}
                </p>
              )}
            </div>
          )}

          {/* Explanation / feedback */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              {['sbar', 'reflection'].includes(actionPrompt.type) ? 'Guidance / Debrief Notes' : 'Explanation / Feedback'}
              <span className="text-gray-400 font-normal ml-1 normal-case">— shown after submitting</span>
            </label>
            <textarea
              value={actionPrompt.explanation || ''}
              onChange={e => updatePrompt({ explanation: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none bg-gray-50 focus:bg-white transition-colors"
              rows={2}
              placeholder="Explain the clinical rationale or provide debrief guidance for facilitators…"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPromptsEditor;
