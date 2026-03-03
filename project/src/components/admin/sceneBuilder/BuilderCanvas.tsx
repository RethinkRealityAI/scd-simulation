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

interface BuilderCanvasProps {
  sceneData: SceneData;
  components: SceneComponentLayout[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onLayoutChange: (updated: SceneComponentLayout[]) => void;
  onToggleComponent: (id: string) => void;
  onRemoveComponent: (id: string) => void;
  canvasWidth: number;
  /** Container height in px — used to compute dynamic rowHeight so grid fits without scrolling */
  canvasHeight?: number;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Activity,
  Play,
  HelpCircle,
  MessageSquare,
  Stethoscope,
  Volume2,
  FileText,
};

const ROWS = 10;
const ROW_HEIGHT = 60;

/**
 * Compute a rowHeight that makes the grid fit exactly inside canvasHeight.
 * Formula: (containerHeight - p-2 padding (16px) - (ROWS-1) * verticalMargin (6px)) / ROWS
 */
function computeRowHeight(canvasHeight: number | undefined): number {
  if (!canvasHeight || canvasHeight <= 0) return ROW_HEIGHT;
  const available = canvasHeight - 16 - (ROWS - 1) * 6;
  return Math.max(40, Math.floor(available / ROWS));
}

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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowHeight = computeRowHeight(canvasHeight);

  const enabledComponents = components.filter(c => c.enabled);
  const hasQuizPanel = enabledComponents.some(c => c.type === 'quiz-panel');
  const hasActionPanel = enabledComponents.some(c => c.type === 'action-prompt');

  const layouts: Layout[] = enabledComponents.map(c => ({
    i: c.id,
    x: c.x,
    y: c.y,
    w: c.w,
    h: c.h,
    minW: c.minW,
    minH: c.minH,
    maxW: c.maxW,
    maxH: c.maxH,
  }));

  const handleLayoutChange = useCallback(
    (newLayouts: Layout[]) => {
      const updated = components.map(comp => {
        const found = newLayouts.find(l => l.i === comp.id);
        if (!found) return comp;
        return { ...comp, x: found.x, y: found.y, w: found.w, h: found.h };
      });
      onLayoutChange(updated);
    },
    [components, onLayoutChange],
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundImage: 'url(https://i.ibb.co/BH6c7SRj/Splas.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={(e) => {
        if (e.target === containerRef.current) onSelectComponent(null);
      }}
    >
      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      <div className="relative z-10 h-full">
        <GridLayout
          className="layout"
          layout={layouts}
          cols={12}
          rowHeight={rowHeight}
          width={canvasWidth}
          maxRows={ROWS}
          compactType={null}
          preventCollision={false}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          margin={[6, 6]}
          containerPadding={[8, 8]}
        >
          {enabledComponents.map(comp => {
            const def = COMPONENT_REGISTRY[comp.type];
            const isSelected = selectedComponentId === comp.id;

            return (
              <div
                key={comp.id}
                className={`group relative flex flex-col rounded-xl overflow-hidden transition-all duration-150 ${
                  isSelected
                    ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent'
                    : 'ring-1 ring-white/10 hover:ring-white/30'
                }`}
                onClick={(e) => { e.stopPropagation(); onSelectComponent(comp.id); }}
              >
                {/* Drag handle bar */}
                <div
                  className={`drag-handle flex items-center justify-between px-2 py-1 flex-shrink-0 cursor-grab active:cursor-grabbing transition-colors ${
                    isSelected ? 'bg-blue-600/80' : 'bg-black/40 group-hover:bg-black/60'
                  } backdrop-blur-sm`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <GripVertical className="w-3 h-3 text-white/50 flex-shrink-0" />
                    <ComponentIcon type={comp.type} className="w-3 h-3 text-white/70 flex-shrink-0" />
                    <span className="text-white/80 text-xs font-medium truncate">{def.label}</span>
                  </div>

                  {/* Quick actions — stop drag on click */}
                  <div
                    className="flex items-center gap-1 flex-shrink-0"
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <button
                      title={comp.enabled ? 'Hide component' : 'Show component'}
                      onClick={(e) => { e.stopPropagation(); onToggleComponent(comp.id); }}
                      className="w-5 h-5 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-colors"
                    >
                      {comp.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    <button
                      title="Remove component"
                      onClick={(e) => { e.stopPropagation(); onRemoveComponent(comp.id); }}
                      className="w-5 h-5 rounded flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Component content area */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  {renderSceneComponent({
                    type: comp.type,
                    scene: sceneData,
                    sceneId: sceneData.id,
                    videoUrl: sceneData.videoUrl,
                    videosLoading: false,
                    isPreview: true,
                    interactiveVariant:
                      comp.type === 'quiz-panel' && hasActionPanel
                        ? 'quizOnly'
                        : comp.type === 'action-prompt' && hasQuizPanel
                          ? 'actionOnly'
                          : 'combined',
                    suppressCompletionControls: comp.type === 'quiz-panel' && hasActionPanel,
                    sceneAudioFiles: [],
                    sceneResponses: [],
                    allQuestionsSubmitted: false,
                    showDiscussion: false,
                    isSceneCompleted: false,
                  })}
                </div>

                {/* Selection highlight border */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-xl pointer-events-none ring-2 ring-blue-400" />
                )}
              </div>
            );
          })}
        </GridLayout>
      </div>
    </div>
  );
};

export default BuilderCanvas;
