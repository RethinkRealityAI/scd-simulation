import React, { useCallback, useRef } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {
  GripVertical,
  X,
  Eye,
  EyeOff,
  Activity,
  Play,
  HelpCircle,
  MessageSquare,
  Stethoscope,
  Volume2,
  FileText,
} from 'lucide-react';
import { SceneData } from '../../../data/scenesData';
import { SceneComponentLayout, SceneComponentType } from '../../../data/scenesData';
import { COMPONENT_REGISTRY } from './componentRegistry';
import { renderSceneComponent } from '../../renderSceneComponent';
import {
  GRID_COLS,
  GRID_ROWS,
  GRID_MARGIN,
  GRID_CONTAINER_PADDING,
  ALL_RESIZE_HANDLES,
  computeRowHeight,
} from '../../../utils/gridConstants';

interface BuilderCanvasProps {
  sceneData: SceneData;
  components: SceneComponentLayout[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onLayoutChange: (updated: SceneComponentLayout[]) => void;
  onToggleComponent: (id: string) => void;
  onRemoveComponent: (id: string) => void;
  canvasWidth: number;
  canvasHeight?: number;
  previewVideoUrl?: string;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Activity, Play, HelpCircle, MessageSquare, Stethoscope, Volume2, FileText,
};

function ComponentIcon({ type, className }: { type: SceneComponentType; className?: string }) {
  const def = COMPONENT_REGISTRY[type];
  const Icon = ICON_MAP[def.icon] || FileText;
  return <Icon className={className} />;
}

const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  sceneData,
  components,
  selectedComponentId,
  onSelectComponent,
  onLayoutChange,
  onToggleComponent,
  onRemoveComponent,
  canvasWidth,
  canvasHeight,
  previewVideoUrl,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowHeight = computeRowHeight(canvasHeight);
  const enabledComponents = components.filter(c => c.enabled);

  // @ts-ignore
  const layouts: Layout[] = enabledComponents.map(c => ({
    i: c.id,
    x: c.x, y: c.y, w: c.w, h: c.h,
    minW: c.minW, minH: c.minH, maxW: c.maxW, maxH: c.maxH,
  }));

  const handleLayoutChange = useCallback(
    (newLayouts: any[]) => {
      const updated = components.map(comp => {
        const found = newLayouts.find((l: any) => l.i === comp.id);
        if (!found) return comp;
        return { ...comp, x: found.x, y: found.y, w: found.w, h: found.h };
      });
      onLayoutChange(updated);
    },
    [components, onLayoutChange],
  );

  const effectiveVideoUrl = previewVideoUrl || sceneData.videoUrl;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-w-0 min-h-0 overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900"
      onClick={(e) => {
        if (e.target === containerRef.current) onSelectComponent(null);
      }}
    >
      {/* Dark scene overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/*
       * Single-layer canvas: react-grid-layout acts as both the interaction
       * layer AND renders the actual components. No separate CSS-Grid preview
       * layer — eliminates all positional drift between editor and display.
       */}
      <div className="relative z-10 w-full h-full min-w-0 min-h-0">
        <GridLayout
          className="layout"
          // @ts-ignore
          layout={layouts}
          cols={GRID_COLS}
          rowHeight={rowHeight}
          width={canvasWidth}
          maxRows={GRID_ROWS}
          // null = items stay exactly where placed; no auto-compaction
          compactType={null}
          preventCollision={false}
          isResizable={true}
          isDraggable={true}
          // @ts-ignore
          resizeHandles={ALL_RESIZE_HANDLES}
          // @ts-ignore
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          margin={GRID_MARGIN}
          containerPadding={GRID_CONTAINER_PADDING}
        >
          {enabledComponents.map(comp => {
            const def = COMPONENT_REGISTRY[comp.type];
            const isSelected = selectedComponentId === comp.id;

            const node = renderSceneComponent({
              type: comp.type,
              scene: sceneData,
              sceneId: sceneData.id,
              videoUrl: effectiveVideoUrl,
              videosLoading: false,
              isPreview: true,
              interactiveVariant: 'combined',
              suppressCompletionControls: false,
              sceneAudioFiles: [],
              sceneResponses: [],
              allQuestionsSubmitted: false,
              showDiscussion: false,
              isSceneCompleted: false,
            });

            return (
              <div
                key={comp.id}
                className={`relative overflow-hidden rounded-xl transition-all duration-100 cursor-default group ${
                  isSelected
                    ? 'ring-2 ring-blue-400 ring-offset-0'
                    : 'ring-1 ring-white/15 hover:ring-white/35'
                }`}
                onClick={(e) => { e.stopPropagation(); onSelectComponent(comp.id); }}
              >
                {/* Component content fills the entire RGL cell */}
                <div className="absolute inset-0 min-w-0 min-h-0 overflow-hidden">
                  {node}
                </div>

                {/* Selection tint */}
                {isSelected && (
                  <div className="absolute inset-0 bg-blue-500/8 pointer-events-none rounded-xl" />
                )}

                {/* Top bar: drag handle (left) + toggle/remove buttons (right) */}
                <div className="absolute inset-x-1.5 top-1.5 z-20 flex items-start justify-between pointer-events-none">
                  {/* Drag handle — only element that initiates drag */}
                  <div
                    className={`drag-handle pointer-events-auto inline-flex max-w-[calc(100%-4.5rem)] items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium select-none backdrop-blur-sm cursor-grab active:cursor-grabbing transition-colors ${
                      isSelected
                        ? 'bg-blue-600/85 border-blue-300/40 text-white'
                        : 'bg-black/55 border-white/15 text-white/75 group-hover:bg-black/70 group-hover:text-white'
                    }`}
                  >
                    <GripVertical className="w-2.5 h-2.5 flex-shrink-0 opacity-70" />
                    <ComponentIcon type={comp.type} className="w-2.5 h-2.5 flex-shrink-0 opacity-80" />
                    <span className="truncate">{def.label}</span>
                  </div>

                  {/* Toggle visibility + remove — visible on hover or when selected */}
                  <div
                    className={`pointer-events-auto flex items-center gap-0.5 transition-opacity ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <button
                      title={comp.enabled ? 'Hide component' : 'Show component'}
                      onClick={(e) => { e.stopPropagation(); onToggleComponent(comp.id); }}
                      className="w-5 h-5 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 backdrop-blur-sm transition-colors"
                    >
                      {comp.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    <button
                      title="Remove component"
                      onClick={(e) => { e.stopPropagation(); onRemoveComponent(comp.id); }}
                      className="w-5 h-5 rounded flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-red-500/20 backdrop-blur-sm transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </GridLayout>
      </div>
    </div>
  );
};

export default BuilderCanvas;
