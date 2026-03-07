import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Undo2,
  Redo2,
  AlertCircle,
  Layout,
  Pencil,
  CheckCircle,
} from 'lucide-react';
import {
  SceneData,
  SceneComponentLayout,
  SceneComponentType,
  defaultSceneLayoutConfig,
  defaultVitalsDisplayConfig,
  defaultVitalsVisibility,
  normalizeSceneLayoutConfig,
} from '../../../data/scenesData';
import { getDefaultLayout } from './componentRegistry';
import { useVideoData } from '../../../hooks/useVideoData';
import { parseVideoUrl } from '../../../utils/videoEmbedUtils';
import { VideoEmbedValue } from '../VideoEmbedInput';
import ScenePreview from '../../ScenePreview';

import BuilderCanvas from './BuilderCanvas';
import RightPanel, { RightPanelTab } from './RightPanel';
import BuilderModeView from './BuilderModeView';
import ComponentEditorModal from './ComponentEditorModal';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SceneBuilderProps {
  scene: SceneData;
  onSave: (updatedScene: SceneData) => Promise<boolean>;
  onClose: () => void;
  instanceId?: string;
  /** New scenes start in 'builder' (content-first); existing scenes start in 'canvas'. */
  initialMode?: 'builder' | 'canvas';
}

// ─── History ──────────────────────────────────────────────────────────────────

type HistoryEntry = {
  sceneData: SceneData;
  layoutComponents: SceneComponentLayout[];
};

const MAX_HISTORY = 30;
const RIGHT_TAB_STORAGE_KEY = 'scene-builder-right-tab';

function isRightPanelTab(value: string | null): value is RightPanelTab {
  return value === 'components' || value === 'selected' || value === 'scene';
}

function useHistory(initial: HistoryEntry) {
  const [state, setState] = useState<{
    stack: HistoryEntry[];
    pointer: number;
    savedPointer: number;
  }>({ stack: [initial], pointer: 0, savedPointer: 0 });

  const push = useCallback((entry: HistoryEntry) => {
    setState(prev => {
      const base = prev.stack.slice(0, prev.pointer + 1);
      const next = [...base, entry].slice(-MAX_HISTORY);
      return { ...prev, stack: next, pointer: next.length - 1 };
    });
  }, []);

  const undo = useCallback(() =>
    setState(prev => ({ ...prev, pointer: Math.max(0, prev.pointer - 1) })),
    []);

  const redo = useCallback(() =>
    setState(prev => ({ ...prev, pointer: Math.min(prev.stack.length - 1, prev.pointer + 1) })),
    []);

  const markSaved = useCallback(() =>
    setState(prev => ({ ...prev, savedPointer: prev.pointer })),
    []);

  return {
    current: state.stack[state.pointer],
    push,
    undo,
    redo,
    markSaved,
    canUndo: state.pointer > 0,
    canRedo: state.pointer < state.stack.length - 1,
    isDirty: state.pointer !== state.savedPointer,
  };
}

function cloneLayoutComponents(components: SceneComponentLayout[]): SceneComponentLayout[] {
  return components.map(c => ({ ...c }));
}

// ─── SceneBuilder ─────────────────────────────────────────────────────────────

const SceneBuilder: React.FC<SceneBuilderProps> = ({
  scene,
  onSave,
  onClose,
  instanceId,
  initialMode = 'canvas',
}) => {
  const { uploadVideo, saveStreamVideo } = useVideoData();

  const initialLayout = normalizeSceneLayoutConfig(scene.layoutConfig || defaultSceneLayoutConfig);
  const initialEntry: HistoryEntry = {
    sceneData: {
      ...scene,
      vitalsDisplayConfig: scene.vitalsDisplayConfig || { ...defaultVitalsDisplayConfig },
    },
    layoutComponents: cloneLayoutComponents(initialLayout.components),
  };

  const { current, push, undo, redo, markSaved, canUndo, canRedo, isDirty } =
    useHistory(initialEntry);
  const { sceneData, layoutComponents } = current;

  // ── UI state ────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<'builder' | 'canvas'>(initialMode);
  const [rightTab, setRightTab] = useState<RightPanelTab>(() => {
    if (typeof window === 'undefined') return 'components';
    const storedTab = window.sessionStorage.getItem(RIGHT_TAB_STORAGE_KEY);
    return isRightPanelTab(storedTab) ? storedTab : 'components';
  });
  const [deepEditorOpen, setDeepEditorOpen] = useState(false);

  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // Track components manually disabled by user in Canvas to avoid re-enabling them
  const manuallyDisabledRef = useRef<Set<string>>(new Set());

  const [videoEmbed, setVideoEmbed] = useState<VideoEmbedValue>({
    sourceType: scene.videoSourceType === 'stream' ? 'stream' : 'upload',
    file: null,
    streamUrl: scene.streamUrl || '',
    parsed: scene.streamUrl ? parseVideoUrl(scene.streamUrl) : null,
    title: '',
    description: '',
  });

  // ── Canvas dimension tracking ────────────────────────────────────────────────
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);

  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0]?.contentRect || {};
      if (width) setCanvasWidth(width);
      if (height) setCanvasHeight(height);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Auto-switch to Configure tab when a component is selected
  useEffect(() => {
    if (selectedComponentId && mode === 'canvas') setRightTab('selected');
  }, [selectedComponentId, mode]);

  // Persist the last-used right panel tab for this browser session.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(RIGHT_TAB_STORAGE_KEY, rightTab);
  }, [rightTab]);

  // ── Effective video URL for live canvas preview (before save) ──────────────
  const previewVideoUrlRef = useRef<string | undefined>(undefined);
  const effectiveVideoUrl = (() => {
    if (videoEmbed.sourceType === 'stream' && videoEmbed.parsed?.embedUrl) {
      return videoEmbed.parsed.embedUrl;
    }
    if (videoEmbed.sourceType === 'upload' && videoEmbed.file) {
      // Blob URL lifecycle managed by VideoEmbedInput; reuse ref to avoid churn
      if (!previewVideoUrlRef.current) {
        previewVideoUrlRef.current = URL.createObjectURL(videoEmbed.file);
      }
      return previewVideoUrlRef.current;
    }
    return sceneData.videoUrl || undefined;
  })();

  // Clean up blob URL when file changes
  useEffect(() => {
    return () => {
      if (previewVideoUrlRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(previewVideoUrlRef.current);
        previewVideoUrlRef.current = undefined;
      }
    };
  }, [videoEmbed.file]);

  // ── Auto-sync: enable canvas components when builder content is configured ──
  useEffect(() => {
    const hasInteractiveContent =
      !!(sceneData.quiz?.questions && sceneData.quiz.questions.length > 0) ||
      !!sceneData.actionPrompt;

    const dataPresence: Record<string, boolean> = {
      'scene-header': !!(sceneData.title?.trim()),
      'video-player': !!(sceneData.videoUrl || videoEmbed.file || videoEmbed.streamUrl),
      'vitals-monitor': true,
      'clinical-findings': !!(sceneData.clinicalFindings && sceneData.clinicalFindings.length > 0),
      'interactive-panel': hasInteractiveContent,
    };

    let changed = false;
    const nextLayout = layoutComponents.map(comp => {
      // Only auto-enable — never auto-disable
      if (!comp.enabled && dataPresence[comp.type] && !manuallyDisabledRef.current.has(comp.id)) {
        changed = true;
        return { ...comp, enabled: true };
      }
      return comp;
    });

    if (changed) {
      push({ sceneData, layoutComponents: nextLayout });
    }
  }, [sceneData, videoEmbed]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mutation helpers ─────────────────────────────────────────────────────────

  const mutate = useCallback(
    (nextScene: SceneData, nextLayout: SceneComponentLayout[]) => {
      push({ sceneData: nextScene, layoutComponents: nextLayout });
    },
    [push],
  );

  const updateScene = useCallback(
    (field: keyof SceneData, value: SceneData[keyof SceneData]) => {
      mutate({ ...sceneData, [field]: value }, layoutComponents);
    },
    [sceneData, layoutComponents, mutate],
  );

  const updateVitals = useCallback(
    (field: keyof SceneData['vitals'], value: SceneData['vitals'][keyof SceneData['vitals']]) => {
      mutate({ ...sceneData, vitals: { ...sceneData.vitals, [field]: value } }, layoutComponents);
    },
    [sceneData, layoutComponents, mutate],
  );

  const updateVisibility = useCallback(
    (field: keyof typeof defaultVitalsVisibility) => {
      const cfg = sceneData.vitalsDisplayConfig || { ...defaultVitalsDisplayConfig };
      mutate(
        {
          ...sceneData,
          vitalsDisplayConfig: {
            ...cfg,
            visibility: { ...cfg.visibility, [field]: !cfg.visibility[field] },
          },
        },
        layoutComponents,
      );
    },
    [sceneData, layoutComponents, mutate],
  );

  const updateVitalColor = useCallback(
    (field: string, color: string) => {
      const cfg = sceneData.vitalsDisplayConfig || { ...defaultVitalsDisplayConfig };
      mutate(
        {
          ...sceneData,
          vitalsDisplayConfig: { ...cfg, colors: { ...cfg.colors, [field]: color } },
        },
        layoutComponents,
      );
    },
    [sceneData, layoutComponents, mutate],
  );

  const updateArrayItem = useCallback(
    (field: 'clinicalFindings' | 'discussionPrompts', index: number, value: string) => {
      mutate(
        {
          ...sceneData,
          [field]: (sceneData[field] || []).map((item: string, i: number) =>
            i === index ? value : item,
          ),
        },
        layoutComponents,
      );
    },
    [sceneData, layoutComponents, mutate],
  );

  const addArrayItem = useCallback(
    (field: 'clinicalFindings' | 'discussionPrompts') => {
      mutate(
        { ...sceneData, [field]: [...(sceneData[field] || []), ''] },
        layoutComponents,
      );
    },
    [sceneData, layoutComponents, mutate],
  );

  const removeArrayItem = useCallback(
    (field: 'clinicalFindings' | 'discussionPrompts', index: number) => {
      mutate(
        {
          ...sceneData,
          [field]: (sceneData[field] || []).filter((_: string, i: number) => i !== index),
        },
        layoutComponents,
      );
    },
    [sceneData, layoutComponents, mutate],
  );

  const updateLayout = useCallback(
    (updated: SceneComponentLayout[]) => {
      push({ sceneData, layoutComponents: updated });
    },
    [sceneData, push],
  );

  const toggleComponent = useCallback(
    (id: string) => {
      const comp = layoutComponents.find(c => c.id === id);
      if (comp?.enabled) {
        // User is manually disabling — track it
        manuallyDisabledRef.current.add(id);
      } else {
        // User is manually enabling — remove from manually-disabled
        manuallyDisabledRef.current.delete(id);
      }
      mutate(
        sceneData,
        layoutComponents.map(c => (c.id === id ? { ...c, enabled: !c.enabled } : c)),
      );
    },
    [sceneData, layoutComponents, mutate],
  );

  const removeComponent = useCallback(
    (id: string) => {
      mutate(
        sceneData,
        layoutComponents.filter(c => c.id !== id),
      );
      if (selectedComponentId === id) setSelectedComponentId(null);
    },
    [sceneData, layoutComponents, mutate, selectedComponentId],
  );

  const addComponent = useCallback(
    (type: SceneComponentType) => {
      const existing = layoutComponents.find(c => c.type === type);
      if (existing) {
        mutate(
          sceneData,
          layoutComponents.map(c => (c.id === existing.id ? { ...c, enabled: true } : c)),
        );
        setSelectedComponentId(existing.id);
      } else {
        const newComp = getDefaultLayout(type);
        mutate(sceneData, [...layoutComponents, newComp]);
        setSelectedComponentId(newComp.id);
      }
    },
    [sceneData, layoutComponents, mutate],
  );

  const resetLayout = useCallback(() => {
    mutate(sceneData, cloneLayoutComponents(defaultSceneLayoutConfig.components));
  }, [sceneData, mutate]);

  // ── Save ──────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const sceneToSave: SceneData = {
        ...sceneData,
        layoutConfig: { components: layoutComponents },
      };

      if (videoEmbed.sourceType === 'stream' && videoEmbed.parsed) {
        await saveStreamVideo(
          parseInt(scene.id),
          videoEmbed.parsed.embedUrl,
          sceneToSave.title,
          sceneToSave.description,
          instanceId,
        );
        sceneToSave.videoUrl = videoEmbed.parsed.embedUrl;
        sceneToSave.videoSourceType = 'stream';
        sceneToSave.streamUrl = videoEmbed.streamUrl;
      } else if (videoEmbed.sourceType === 'upload' && videoEmbed.file) {
        const insertData = await uploadVideo(
          videoEmbed.file,
          parseInt(scene.id),
          sceneToSave.title,
          sceneToSave.description,
          instanceId,
        );
        if (insertData?.video_url) sceneToSave.videoUrl = insertData.video_url;
        sceneToSave.videoSourceType = 'upload';
        sceneToSave.streamUrl = undefined;
      }

      const success = await onSave(sceneToSave);
      if (success) {
        markSaved();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError('Failed to save scene configuration');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save scene');
    } finally {
      setSaving(false);
    }
  };

  // ── Close guard ───────────────────────────────────────────────────────────────

  const handleClose = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Close without saving?')) return;
    onClose();
  };

  // ── Derived ───────────────────────────────────────────────────────────────────

  const selectedComponent = layoutComponents.find(c => c.id === selectedComponentId);
  const selectedType: SceneComponentType | null = selectedComponent?.type ?? null;

  // Shared props object for configurator-aware sub-components
  const configuratorProps = {
    sceneData,
    videoEmbed,
    onSceneDataChange: updateScene,
    onVitalsChange: updateVitals,
    onVisibilityToggle: updateVisibility,
    onVitalColorChange: updateVitalColor,
    onVideoEmbedChange: setVideoEmbed,
    onArrayItemAdd: addArrayItem,
    onArrayItemRemove: removeArrayItem,
    onArrayItemUpdate: updateArrayItem,
  };

  // ── Preview shortcut ──────────────────────────────────────────────────────────

  if (showPreview) {
    return (
      <ScenePreview
        sceneData={{ ...sceneData, layoutConfig: { components: layoutComponents } }}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-gray-950">

      {/* ── Save success toast ───────────────────────────────────────────── */}
      {saveSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl shadow-2xl shadow-green-900/40 animate-fade-in text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Scene saved successfully!
        </div>
      )}

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-700">

        {/* Left: scene identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {scene.id}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white leading-tight truncate max-w-xs">
              {sceneData.title || 'Untitled Scene'}
            </h1>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-gray-400">Scene Builder</p>
              {isDirty && (
                <span className="text-xs text-amber-400 font-medium">● Unsaved</span>
              )}
            </div>
          </div>
        </div>

        {/* Center: undo/redo + mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo"
              className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo"
              className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode toggle pill */}
          <div className="flex items-center bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setMode('builder')}
              title="Builder mode — edit content without the canvas"
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${mode === 'builder'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              Builder
            </button>
            <button
              onClick={() => setMode('canvas')}
              title="Canvas mode — drag and arrange components"
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${mode === 'canvas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              <Layout className="w-3.5 h-3.5" />
              Canvas
            </button>
          </div>
        </div>

        {/* Right: panel toggle + error + close */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {mode === 'canvas' && (
            <button
              onClick={() => setPanelCollapsed(v => !v)}
              title={panelCollapsed ? 'Show panel' : 'Hide panel'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg text-xs transition-colors"
            >
              {panelCollapsed
                ? <><Layout className="w-3.5 h-3.5" /><span>Show Panel</span></>
                : <><X className="w-3.5 h-3.5" /><span>Hide Panel</span></>}
            </button>
          )}
          {error && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/50 border border-red-700 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-300 text-xs">{error}</span>
            </div>
          )}
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl text-xs font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            Close
          </button>
        </div>
      </div>

      {/* ── Main body ────────────────────────────────────────────────────── */}
      {mode === 'builder' ? (

        /* Builder mode: full-width content editor */
        <BuilderModeView
          {...configuratorProps}
          saving={saving}
          onSave={handleSave}
          onPreview={() => setShowPreview(true)}
          onSwitchToCanvas={() => setMode('canvas')}
        />

      ) : (

        /* Canvas mode: drag-and-drop grid + single right panel */
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* CENTER CANVAS */}
          <div
            ref={canvasContainerRef}
            className="flex-1 min-w-0 min-h-0 overflow-hidden relative"
          >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full text-xs text-white/50 pointer-events-none select-none">
              Canvas Mode · Drag to move, resize handles to resize
            </div>

            <BuilderCanvas
              sceneData={sceneData}
              components={layoutComponents}
              selectedComponentId={selectedComponentId}
              onSelectComponent={setSelectedComponentId}
              onLayoutChange={updateLayout}
              onToggleComponent={toggleComponent}
              onRemoveComponent={removeComponent}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              previewVideoUrl={effectiveVideoUrl}
            />
          </div>

          {/* RIGHT PANEL: single tabbed panel */}
          <RightPanel
            activeTab={rightTab}
            onTabChange={setRightTab}
            saving={saving}
            onSave={handleSave}
            onPreview={() => setShowPreview(true)}
            onResetLayout={resetLayout}
            components={layoutComponents}
            selectedComponentId={selectedComponentId}
            selectedType={selectedType}
            onSelectComponent={setSelectedComponentId}
            onToggleComponent={toggleComponent}
            onAddComponent={addComponent}
            onOpenDeepEditor={() => setDeepEditorOpen(true)}
            collapsed={panelCollapsed}
            onToggleCollapse={() => setPanelCollapsed(v => !v)}
            {...configuratorProps}
          />
        </div>
      )}

      {/* ── Deep editor modal ─────────────────────────────────────────────── */}
      {deepEditorOpen && selectedType && (
        <ComponentEditorModal
          selectedType={selectedType}
          {...configuratorProps}
          onClose={() => setDeepEditorOpen(false)}
        />
      )}
    </div>
  );
};

export default SceneBuilder;
