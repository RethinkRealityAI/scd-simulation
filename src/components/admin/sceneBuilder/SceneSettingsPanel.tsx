import React, { useState } from 'react';
import {
  Save,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Info,
  Star,
  FileText,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { SceneData, ScoringCategory } from '../../../data/scenesData';

interface SceneSettingsPanelProps {
  sceneData: SceneData;
  saving: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSave: () => void;
  onPreview: () => void;
  onResetLayout: () => void;
  onSceneDataChange: (field: keyof SceneData, value: SceneData[keyof SceneData]) => void;
}

const SCORING_CATEGORIES: { value: ScoringCategory; label: string }[] = [
  { value: 'timelyPainManagement', label: 'Timely Pain Mgmt' },
  { value: 'clinicalJudgment', label: 'Clinical Judgment' },
  { value: 'communication', label: 'Communication' },
  { value: 'culturalSafety', label: 'Cultural Safety' },
  { value: 'biasMitigation', label: 'Bias Mitigation' },
];

function SceneSettingsPanel({
  sceneData,
  saving,
  collapsed,
  onToggleCollapse,
  onSave,
  onPreview,
  onResetLayout,
  onSceneDataChange,
}: SceneSettingsPanelProps) {
  const [discussionOpen, setDiscussionOpen] = useState(false);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-4 gap-3 bg-white border-l border-gray-200 w-10">
        {/* Expand button */}
        <button
          onClick={onToggleCollapse}
          title="Expand panel"
          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
        </button>
        {/* Quick save */}
        <button
          onClick={onSave}
          disabled={saving}
          title="Save"
          className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Save className="w-3.5 h-3.5 text-white" />}
        </button>
        {/* Quick preview */}
        <button
          onClick={onPreview}
          title="Preview"
          className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    );
  }

  const scoringCategories = sceneData.scoringCategories || [];

  const toggleScoring = (cat: ScoringCategory) => {
    const updated = scoringCategories.includes(cat)
      ? scoringCategories.filter(c => c !== cat)
      : [...scoringCategories, cat];
    onSceneDataChange('scoringCategories', updated);
  };

  const discussions = sceneData.discussionPrompts || [];

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 overflow-hidden w-72">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-bold text-gray-900">Scene Settings</h3>
        </div>
        <button
          onClick={onToggleCollapse}
          title="Collapse panel"
          className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 p-3 border-b border-gray-100 space-y-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Scene'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onPreview}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-medium transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
          <button
            onClick={onResetLayout}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Layout
          </button>
        </div>
      </div>

      {/* Settings body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Completion scene */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Scene Type</p>
          <button
            type="button"
            onClick={() => onSceneDataChange('isCompletionScene', !sceneData.isCompletionScene)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
              sceneData.isCompletionScene
                ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-yellow-200'
            }`}
          >
            <Star className={`w-4 h-4 flex-shrink-0 ${sceneData.isCompletionScene ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold">Completion Scene</div>
              <div className="text-xs opacity-70">{sceneData.isCompletionScene ? 'Final scene of this simulation' : 'Mark as the final scene'}</div>
            </div>
            {sceneData.isCompletionScene && <CheckCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />}
          </button>
        </div>

        {/* Scoring categories */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Scoring Categories</p>
          <div className="space-y-1">
            {SCORING_CATEGORIES.map(({ value, label }) => {
              const active = scoringCategories.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleScoring(value)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left text-xs transition-all ${
                    active
                      ? 'border-blue-200 bg-blue-50 text-blue-800'
                      : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 border ${active ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                    {active && <span className="text-white text-xs leading-none">✓</span>}
                  </div>
                  <span className="font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Discussion prompts */}
        <div>
          <button
            onClick={() => setDiscussionOpen(v => !v)}
            className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
          >
            <span>Discussion Prompts</span>
            <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${discussionOpen ? 'rotate-90' : ''}`} />
          </button>

          {discussionOpen && (
            <div className="space-y-1.5">
              {discussions.map((d, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1">
                    {i + 1}
                  </div>
                  <input
                    type="text"
                    value={d}
                    onChange={e => {
                      const updated = [...discussions];
                      updated[i] = e.target.value;
                      onSceneDataChange('discussionPrompts', updated);
                    }}
                    className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
                    placeholder="Debrief question…"
                  />
                  <button
                    onClick={() => onSceneDataChange('discussionPrompts', discussions.filter((_, j) => j !== i))}
                    className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => onSceneDataChange('discussionPrompts', [...discussions, ''])}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium py-0.5"
              >
                + Add prompt
              </button>
            </div>
          )}
        </div>

        {/* Scene ID info */}
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-600">Scene Info</span>
          </div>
          <div className="text-xs text-gray-500 space-y-0.5">
            <div>ID: <span className="font-medium text-gray-700">{sceneData.id}</span></div>
            <div>Quiz: <span className="font-medium text-gray-700">{sceneData.quiz?.questions?.length ?? 0} questions</span></div>
            <div>Findings: <span className="font-medium text-gray-700">{sceneData.clinicalFindings?.length ?? 0} items</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SceneSettingsPanel;
