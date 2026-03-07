import React, { useMemo } from 'react';
import { SceneData, SceneLayoutConfig } from '../data/scenesData';
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
 * User-facing dynamic scene layout.
 * Uses native CSS Grid (fr units) so components ALWAYS fill the container exactly —
 * no pixel arithmetic, no overflow, no react-grid-layout dependency at render time.
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
  const enabledComponents = useMemo(() => {
    return layoutConfig.components.filter(c => {
      if (!c.enabled) return false;
      if (!isPreview && c.type === 'audio-player' && (!sceneAudioFiles || sceneAudioFiles.length === 0)) return false;
      if (!isPreview && c.type === 'clinical-findings' && (!scene.clinicalFindings || scene.clinicalFindings.length === 0)) return false;
      if (!isPreview && c.type === 'video-player' && !videoUrl && !scene.iframeUrl && scene.id !== '8') return false;
      return true;
    });
  }, [layoutConfig.components, isPreview, sceneAudioFiles, scene.clinicalFindings, videoUrl, scene.iframeUrl, scene.id]);

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
      {enabledComponents.map(comp => {
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
