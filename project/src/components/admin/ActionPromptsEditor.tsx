import React from 'react';
import { Activity, Plus, X } from 'lucide-react';
import { ActionPrompt } from '../QuizComponent';

interface ActionPromptsEditorProps {
  actionPrompt?: ActionPrompt;
  onChange: (actionPrompt: ActionPrompt | undefined) => void;
}

const ActionPromptsEditor: React.FC<ActionPromptsEditorProps> = ({ actionPrompt, onChange }) => {
  const togglePrompt = () => {
    if (actionPrompt) {
      onChange(undefined);
    } else {
      onChange({
        type: 'action-selection',
        title: '',
        content: '',
        options: ['', ''],
        correctAnswers: [],
        explanation: ''
      });
    }
  };

  const updatePrompt = (updates: Partial<ActionPrompt>) => {
    if (actionPrompt) {
      onChange({ ...actionPrompt, ...updates });
    }
  };

  const addOption = () => {
    if (actionPrompt && actionPrompt.options) {
      updatePrompt({ options: [...actionPrompt.options, ''] });
    }
  };

  const updateOption = (index: number, value: string) => {
    if (actionPrompt && actionPrompt.options) {
      const updated = [...actionPrompt.options];
      updated[index] = value;
      updatePrompt({ options: updated });
    }
  };

  const deleteOption = (index: number) => {
    if (actionPrompt && actionPrompt.options && actionPrompt.options.length > 2) {
      const updated = actionPrompt.options.filter((_, i) => i !== index);
      updatePrompt({ options: updated });
    }
  };

  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-500" />
          Action Prompt
        </h3>
        <button
          onClick={togglePrompt}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            actionPrompt
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {actionPrompt ? 'Remove Action Prompt' : 'Add Action Prompt'}
        </button>
      </div>

      {!actionPrompt ? (
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No action prompt configured. Click "Add Action Prompt" to create one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Prompt Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prompt Type</label>
            <select
              value={actionPrompt.type}
              onChange={(e) => {
                const newType = e.target.value as ActionPrompt['type'];
                updatePrompt({
                  type: newType,
                  options: ['sbar', 'reflection'].includes(newType) ? undefined : actionPrompt.options || ['', ''],
                  correctAnswers: ['sbar', 'reflection'].includes(newType) ? undefined : []
                });
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="action-selection">Action Selection (Single Choice)</option>
              <option value="multi-select">Multi-Select (Multiple Choices)</option>
              <option value="sbar">SBAR Communication</option>
              <option value="reflection">Reflection (Text Input)</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={actionPrompt.title}
              onChange={(e) => updatePrompt({ title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Select initial actions for Tobi's care:"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content / Instructions</label>
            <textarea
              value={actionPrompt.content}
              onChange={(e) => updatePrompt({ content: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Provide detailed instructions or context..."
            />
          </div>

          {/* Options (for selection-based prompts) */}
          {['action-selection', 'multi-select'].includes(actionPrompt.type) && actionPrompt.options && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Action Options</label>
                  <button
                    onClick={addOption}
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Option
                  </button>
                </div>
                <div className="space-y-2">
                  {actionPrompt.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-600 w-8">{getOptionLabel(index)}.</span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder={`Option ${getOptionLabel(index)}`}
                      />
                      {actionPrompt.options!.length > 2 && (
                        <button
                          onClick={() => deleteOption(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct Answers */}
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <label className="block text-sm font-medium text-green-800 mb-2">✓ Correct Answer(s)</label>
                
                {actionPrompt.type === 'action-selection' && (
                  <select
                    value={actionPrompt.correctAnswers?.[0] || ''}
                    onChange={(e) => updatePrompt({ correctAnswers: e.target.value ? [e.target.value] : [] })}
                    className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">Select correct action...</option>
                    {actionPrompt.options.map((opt, i) => (
                      <option key={i} value={opt}>{getOptionLabel(i)}. {opt}</option>
                    ))}
                  </select>
                )}

                {actionPrompt.type === 'multi-select' && (
                  <div className="space-y-2">
                    {actionPrompt.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 p-2 hover:bg-green-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={actionPrompt.correctAnswers?.includes(opt) || false}
                          onChange={(e) => {
                            const current = actionPrompt.correctAnswers || [];
                            const updated = e.target.checked
                              ? [...current, opt]
                              : current.filter(a => a !== opt);
                            updatePrompt({ correctAnswers: updated });
                          }}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-sm">{getOptionLabel(i)}. {opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Explanation/Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {['sbar', 'reflection'].includes(actionPrompt.type) ? 'Guidance / Feedback' : 'Explanation'}
            </label>
            <textarea
              value={actionPrompt.explanation || ''}
              onChange={(e) => updatePrompt({ explanation: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={2}
              placeholder="Provide explanation or guidance..."
            />
          </div>

          {['sbar', 'reflection'].includes(actionPrompt.type) && (
            <div className="p-3 bg-purple-100 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                💡 <strong>Note:</strong> {actionPrompt.type === 'sbar' ? 'SBAR prompts use a word bank interface and are auto-validated.' : 'Reflection prompts are open-ended and auto-validated.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionPromptsEditor;

