import React, { useMemo } from 'react';
import { SceneComponentLayout, SceneData, SceneLayoutConfig } from '../data/scenesData';
import { renderSceneComponent, RuntimeResponse, SceneAnswer, SceneAudioFileLike } from './renderSceneComponent';
import {
  GRID_COLS,
  GRID_ROWS,
  GRID_MARGIN,
  GRID_CONTAINER_PADDING,
} from '../utils/gridConstants';

interface DynamicSceneLayoutProps {
  scene: SceneData;
  layoutConfig: SceneLayoutConfig;
  sceneId?: string;
  videoUrl?: string;
  videosLoading?: boolean;
  sceneAudioFiles?: SceneAudioFileLike[];
  currentPlayingAudio?: number | null;
  onAudioPlay?: (index: number) => void;
  onAudioPause?: () => void;
  onAudioEnded?: (index: number) => void;
  onQuizAnswered?: (responses: SceneAnswer[]) => void;
  onContinueToDiscussion?: () => void;
  onCompleteScene?: () => void;
  sceneResponses?: SceneAnswer[];
  allQuestionsSubmitted?: boolean;
  showDiscussion?: boolean;
  isSceneCompleted?: boolean;
  canComplete?: boolean;
  allResponses?: RuntimeResponse[];
  isPreview?: boolean;
}

/**
 * Expands key content components to fill vertical space that is vacant below
 * them in the same column band. This keeps the video and interactive panel
 * visually aligned when optional blocks like clinical findings or audio are
 * hidden.
 */
function computeAdaptiveLayout(
  components: SceneComponentLayout[],
): SceneComponentLayout[] {
  const expandableTypes = new Set(['video-player', 'interactive-panel']);

  return components.map(component => {
    if (!expandableTypes.has(component.type)) return component;

    const componentBottom = component.y + component.h;
    let nextOccupied = GRID_ROWS;

    for (const comp of components) {
      if (comp === component) continue;

      const xOverlap = comp.x < component.x + component.w && comp.x + comp.w > component.x;
      if (xOverlap && comp.y >= componentBottom) {
        nextOccupied = Math.min(nextOccupied, comp.y);
      }
    }

    if (nextOccupied <= componentBottom) return component;

    return {
      ...component,
      h: nextOccupied - component.y,
    };
  });
}

/**
 * User-facing dynamic scene layout.
 * Uses native CSS Grid (fr units) so components ALWAYS fill the container
 * exactly — no pixel arithmetic, no overflow, no react-grid-layout dependency
 * at render time. Applies adaptive expansion so the video and interactive
 * panel fill space left vacant by removed/hidden optional components.
 */
const DynamicSceneLayout: React.FC<DynamicSceneLayoutProps> = ({
  scene,
  layoutConfig,
  sceneId,
  videoUrl,
  videosLoading,
  sceneAudioFiles = [],
  currentPlayingAudio,
  onAudioPlay,
  onAudioPause,
  onAudioEnded,
  onQuizAnswered,
  onContinueToDiscussion,
  onCompleteScene,
  sceneResponses,
  allQuestionsSubmitted,
  showDiscussion,
  isSceneCompleted,
  canComplete,
  allResponses = [],
  isPreview = false,
}) => {
  // Step 1: filter to only components that are enabled and have data
  const enabledComponents = useMemo(() => {
    return layoutConfig.components.filter(c => {
      if (!c.enabled) return false;
      if (!isPreview && c.type === 'audio-player' && (!sceneAudioFiles || sceneAudioFiles.length === 0)) return false;
      if (!isPreview && c.type === 'clinical-findings' && (!scene.clinicalFindings || scene.clinicalFindings.length === 0)) return false;
      if (!isPreview && c.type === 'video-player' && !videoUrl && !scene.iframeUrl && scene.id !== '8') return false;
      return true;
    });
  }, [layoutConfig.components, isPreview, sceneAudioFiles, scene.clinicalFindings, videoUrl, scene.iframeUrl, scene.id]);

  // Step 2: expand core content components to fill any vacant space below them
  const adaptedComponents = useMemo(
    () => (isPreview ? enabledComponents : computeAdaptiveLayout(enabledComponents)),
    [enabledComponents, isPreview],
  );

  return (
    <div
      className="w-full h-full min-w-0 min-h-0 overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
        gap: `${GRID_MARGIN[1]}px ${GRID_MARGIN[0]}px`,
        padding: `${GRID_CONTAINER_PADDING[1]}px ${GRID_CONTAINER_PADDING[0]}px`,
        boxSizing: 'border-box',
      }}
    >
      {adaptedComponents.map(comp => {
        const node = renderSceneComponent({
          type: comp.type,
          scene,
          sceneId: sceneId || scene.id,
          videoUrl,
          videosLoading,
          isPreview,
          interactiveVariant: 'combined',
          suppressCompletionControls: false,
          sceneAudioFiles,
          currentPlayingAudio,
          onAudioPlay,
          onAudioPause,
          onAudioEnded,
          onQuizAnswered,
          onContinueToDiscussion,
          onCompleteScene,
          sceneResponses,
          allQuestionsSubmitted,
          showDiscussion,
          isSceneCompleted,
          canComplete,
          allResponses,
        });

        if (!node) return null;

        return (
          <div
            key={comp.id}
            className="relative min-w-0 min-h-0 overflow-hidden"
            style={{
              gridColumn: `${comp.x + 1} / ${comp.x + comp.w + 1}`,
              gridRow: `${comp.y + 1} / ${comp.y + comp.h + 1}`,
            }}
          >
            <div className="absolute inset-0 flex flex-col min-h-0 min-w-0 overflow-hidden">
              {node}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DynamicSceneLayout;
