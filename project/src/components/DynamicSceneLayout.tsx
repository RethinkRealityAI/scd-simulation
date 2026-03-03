/**
 * DynamicSceneLayout
 *
 * Renders scene components from `layoutConfig` using the same shared renderer
 * used by the builder canvas for WYSIWYG parity.
 */

import React from 'react';
import { SceneData, SceneLayoutConfig, SceneComponentLayout } from '../data/scenesData';
import { renderSceneComponent, RuntimeResponse, SceneAnswer, SceneAudioFileLike } from './renderSceneComponent';

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

function getMaxRow(comps: SceneComponentLayout[]): number {
  return Math.max(...comps.map(c => c.y + c.h), 10);
}

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
  const enabledComponents = layoutConfig.components.filter(c => c.enabled);
  const hasQuizPanel = enabledComponents.some(c => c.type === 'quiz-panel');
  const hasActionPanel = enabledComponents.some(c => c.type === 'action-prompt');
  const maxRow = getMaxRow(enabledComponents);

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gridTemplateRows: `repeat(${maxRow}, 1fr)`,
    gap: '6px',
    height: '100%',
    width: '100%',
  };

  return (
    <div style={gridStyle}>
      {enabledComponents.map(comp => {
        const style: React.CSSProperties = {
          gridColumn: `${comp.x + 1} / span ${comp.w}`,
          gridRow: `${comp.y + 1} / span ${comp.h}`,
          minHeight: 0,
          overflow: 'hidden',
        };

        const interactiveVariant =
          comp.type === 'quiz-panel' && hasActionPanel
            ? 'quizOnly'
            : comp.type === 'action-prompt' && hasQuizPanel
              ? 'actionOnly'
              : 'combined';

        const node = renderSceneComponent({
          type: comp.type,
          scene,
          sceneId: sceneId || scene.id,
          videoUrl,
          videosLoading,
          isPreview,
          interactiveVariant,
          suppressCompletionControls: comp.type === 'quiz-panel' && hasActionPanel,
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
          <div key={comp.id} style={style}>
            {node}
          </div>
        );
      })}
    </div>
  );
};

export default DynamicSceneLayout;
