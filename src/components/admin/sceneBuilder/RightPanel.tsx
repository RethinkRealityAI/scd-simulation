import React, { useState } from 'react';
import {
  Save,
  Eye,
  RotateCcw,
  Loader2,
  Star,
  CheckCircle,
  Info,
  LayoutGrid,
  Settings2,
  FileText,
  Maximize2,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import {
  SceneData,
  SceneComponentLayout,
  SceneComponentType,
  ScoringCategory,
  defaultVitalsVisibility,
} from '../../../data/scenesData';
import { VideoEmbedValue } from '../VideoEmbedInput';
import ComponentPalette from './ComponentPalette';
import ComponentConfigurator from './ComponentConfigurator';

export type RightPanelTab = 'components' | 'selected' | 'scene';

const DEEP_EDIT_TYPES: SceneComponentType[] = [
  'interactive-panel',
  'quiz-panel',
  'action-prompt',
  'vitals-monitor',
  'video-player',
  'clinical-findings',
];

const SCORING_CATEGORIES: { value: ScoringCategory; label: string }[] = [
  { value: 'timelyPainManagement', label: 'Timely Pain Mgmt' },
  { value: 'clinicalJudgment', label: 'Clinical Judgment' },
  { value: 'communication', label: 'Communication' },
  { value: 'culturalSafety', label: 'Cultural Safety' },
  { value: 'biasMitigation', label: 'Bias Mitigation' },
];

const TABS: { id: RightPanelTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'components', label: 'Components', icon: LayoutGrid },
  { id: 'selected', label: 'Configure', icon: Settings2 },
  { id: 'scene', label: 'Scene', icon: FileText },
];

export interface RightPanelProps {
  activeTab: RightPanelTab;
  onTabChange: (tab: RightPanelTab) => void;
  sceneData: SceneData;
  saving: boolean;
  onSave: () => void;
  onPreview: () => void;
  onResetLayout: () => void;
  onSceneDataChange: (field: keyof SceneData, value: SceneData[keyof SceneData]) => void;
  components: SceneComponentLayout[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onToggleComponent: (id: string) => void;
  onAddComponent: (type: SceneComponentType) => void;
  selectedType: SceneComponentType | null;
  videoEmbed: VideoEmbedValue;
  onVitalsChange: (field: keyof SceneData['vitals'], value: SceneData['vitals'][keyof SceneData['vitals']]) => void;
  onVisibilityToggle: (field: keyof typeof defaultVitalsVisibility) => void;
  onVitalColorChange: (field: string, color: string) => void;
  onVideoEmbedChange: (value: VideoEmbedValue) => void;
  onArrayItemAdd: (field: 'clinicalFindings' | 'discussionPrompts') => void;
  onArrayItemRemove: (field: 'clinicalFindings' | 'discussionPrompts', index: number) => void;
  onArrayItemUpdate: (field: 'clinicalFindings' | 'discussionPrompts', index: number, value: string) => void;
  onOpenDeepEditor: () => void;
  /** Collapsed state lifted to parent so toolbar button can also toggle */
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  activeTab,
  onTabChange,
  sceneData,
  saving,
  onSave,
  onPreview,
  onResetLayout,
  onSceneDataChange,
  components,
  selectedComponentId,
  onSelectComponent,
  onToggleComponent,
  onAddComponent,
  selectedType,
  videoEmbed,
  onVitalsChange,
  onVisibilityToggle,
  onVitalColorChange,
  onVideoEmbedChange,
  onArrayItemAdd,
  onArrayItemRemove,
  onArrayItemUpdate,
  onOpenDeepEditor,
  collapsed,
  onToggleCollapse,
}) => {
  const [discussionOpen, setDiscussionOpen] = useState(false);

  const scoringCategories = sceneData.scoringCategories || [];
  const discussions = sceneData.discussionPrompts || [];
  const canOpenDeepEditor = selectedType !== null && DEEP_EDIT_TYPES.includes(selectedType);

  /* ── Collapsed: show a slim vertical strip with toggle button ── */
  if (collapsed) {
    return (
      <div className="flex-shrink-0 w-10 flex flex-col items-center py-3 gap-3 bg-white/5 border-l border-white/10 backdrop-blur-xl">
        <button
          onClick={onToggleCollapse}
          title="Expand panel"
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>
        {/* Rotated tab indicators */}
        {TABS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { onToggleCollapse(); onTabChange(id); }}
            title={id}
            className={`p-1.5 rounded-lg transition-colors ${activeTab === id ? 'text-blue-400 bg-blue-500/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/10'}`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-80 flex flex-col bg-gray-900/80 backdrop-blur-xl border-l border-white/10 overflow-hidden">

      {/* ── Tab bar ── */}
      <div className="flex-shrink-0 flex items-center border-b border-white/10 bg-white/5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 px-2 py-2.5 text-xs font-medium transition-colors border-b-2 ${activeTab === id
                ? 'border-blue-400 text-blue-400 bg-white/5'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          title="Collapse panel"
          className="p-2 text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors flex-shrink-0 border-l border-white/10"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-hidden flex flex-col">

        {/* Components Tab */}
        {activeTab === 'components' && (
          <ComponentPalette
            sceneData={sceneData}
            components={components}
            selectedComponentId={selectedComponentId}
            onSelectComponent={(id) => {
              onSelectComponent(id);
              onTabChange('selected');
            }}
            onToggleComponent={onToggleComponent}
            onAddComponent={onAddComponent}
          />
        )}

        {/* Configure Tab */}
        {activeTab === 'selected' && (
          <div className="flex flex-col h-full overflow-hidden">
            {canOpenDeepEditor && (
              <div className="flex-shrink-0 px-3 py-2 border-b border-white/10 bg-blue-500/10">
                <button
                  onClick={onOpenDeepEditor}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Open Full Editor
                </button>
              </div>
            )}
            <ComponentConfigurator
              selectedType={selectedType}
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
        )}

        {/* Scene Tab */}
        {activeTab === 'scene' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Actions */}
            <div className="flex-shrink-0 p-3 border-b border-white/10 space-y-2">
              <button
                onClick={onSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Save Scene'}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onPreview}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors border border-white/10"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
                <button
                  onClick={onResetLayout}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-medium transition-colors border border-white/10"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Settings body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Completion scene */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Scene Type</p>
                <button
                  type="button"
                  onClick={() => onSceneDataChange('isCompletionScene', !sceneData.isCompletionScene)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${sceneData.isCompletionScene
                      ? 'border-yellow-400/60 bg-yellow-400/10 text-yellow-300'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-yellow-400/30'
                    }`}
                >
                  <Star className={`w-4 h-4 flex-shrink-0 ${sceneData.isCompletionScene ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold">Completion Scene</div>
                    <div className="text-xs opacity-70">
                      {sceneData.isCompletionScene ? 'Final scene of simulation' : 'Mark as final scene'}
                    </div>
                  </div>
                  {sceneData.isCompletionScene && <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                </button>
              </div>

              {/* Scoring categories */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Scoring Categories</p>
                <div className="space-y-1">
                  {SCORING_CATEGORIES.map(({ value, label }) => {
                    const active = scoringCategories.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          const updated = active
                            ? scoringCategories.filter(c => c !== value)
                            : [...scoringCategories, value];
                          onSceneDataChange('scoringCategories', updated);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left text-xs transition-all ${active
                            ? 'border-blue-400/40 bg-blue-500/15 text-blue-300'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                          }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 border ${active ? 'bg-blue-600 border-blue-500' : 'border-gray-600'}`}>
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
                  className="w-full flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2"
                >
                  <span>Discussion Prompts ({discussions.length})</span>
                  <ChevronRight className={`w-3.5 h-3.5 text-gray-500 transition-transform ${discussionOpen ? 'rotate-90' : ''}`} />
                </button>
                {discussionOpen && (
                  <div className="space-y-1.5">
                    {discussions.map((d, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1">
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
                          className="flex-1 px-2.5 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-400 focus:border-transparent"
                          placeholder="Debrief question…"
                        />
                        <button
                          onClick={() => onSceneDataChange('discussionPrompts', discussions.filter((_, j) => j !== i))}
                          className="p-1 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => onSceneDataChange('discussionPrompts', [...discussions, ''])}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium py-0.5"
                    >
                      + Add prompt
                    </button>
                  </div>
                )}
              </div>

              {/* Scene info */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <Info className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-400">Scene Info</span>
                </div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  <div>ID: <span className="font-medium text-gray-300">{sceneData.id}</span></div>
                  <div>Quiz: <span className="font-medium text-gray-300">{sceneData.quiz?.questions?.length ?? 0} questions</span></div>
                  <div>Findings: <span className="font-medium text-gray-300">{sceneData.clinicalFindings?.length ?? 0} items</span></div>
                  <div>Prompts: <span className="font-medium text-gray-300">{sceneData.actionPrompt?.type ?? 'none'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
