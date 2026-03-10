import React from 'react';
import {
  SceneComponentType,
  SceneData,
} from '../data/scenesData';
import VitalsMonitor from './VitalsMonitor';
import VideoPlayer from './VideoPlayer';
import QuizComponent from './QuizComponent';
import AudioPlayer from './AudioPlayer';
import TabContainer from './TabContainer';
import SBARChart from './SBARChart';

export interface SceneAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  score?: number;
}

export interface RuntimeResponse {
  sceneId: string;
  questionId: string;
  answer: string;
}

export interface SceneAudioFileLike {
  id: string;
  audio_url: string;
  audio_title: string;
  audio_description?: string;
  display_order: number;
  auto_play?: boolean;
  hide_player?: boolean;
  character?: {
    character_name?: string;
    avatar_url?: string;
  };
}

type InteractiveVariant = 'combined' | 'quizOnly' | 'actionOnly';

export interface RenderSceneComponentOptions {
  type: SceneComponentType;
  scene: SceneData;
  sceneId?: string;
  videoUrl?: string;
  videosLoading?: boolean;
  isPreview?: boolean;
  interactiveVariant?: InteractiveVariant;
  suppressCompletionControls?: boolean;
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
}

const NOOP = () => { };
const NOOP_QUIZ = (_responses: SceneAnswer[]) => { };

function parseSbarData(allResponses: RuntimeResponse[] = []) {
  const sbarResponse = allResponses.find(
    r => r.sceneId === '4' && r.questionId === 'action_4',
  );

  const sbarData: {
    situation: string[];
    background: string[];
    assessment: string[];
    recommendation: string[];
  } = {
    situation: [],
    background: [],
    assessment: [],
    recommendation: [],
  };

  if (!sbarResponse?.answer) return sbarData;

  try {
    const sections = sbarResponse.answer.split('\n');
    sections.forEach(section => {
      const [category, items] = section.split(': ');
      if (!category || !items) return;

      const categoryKey = category.toLowerCase() as keyof typeof sbarData;
      if (Object.prototype.hasOwnProperty.call(sbarData, categoryKey)) {
        sbarData[categoryKey] = items
          .split(', ')
          .filter(item => item.trim());
      }
    });
  } catch (error) {
    console.error('Error parsing SBAR data:', error);
  }

  return sbarData;
}

/**
 * Every component returned here MUST fill its parent container.
 * The parent is always a flex-col cell created by the grid layout.
 * We use w-full h-full + flex flex-col + min-h-0 on every wrapper
 * to ensure proper containment with no overflow.
 */
export function renderSceneComponent({
  type,
  scene,
  sceneId,
  videoUrl,
  videosLoading,
  isPreview = false,
  interactiveVariant: _interactiveVariant = 'combined',
  suppressCompletionControls = false,
  sceneAudioFiles = [],
  currentPlayingAudio = null,
  onAudioPlay = NOOP,
  onAudioPause = NOOP,
  onAudioEnded = NOOP,
  onQuizAnswered = NOOP_QUIZ,
  onContinueToDiscussion = NOOP,
  onCompleteScene = NOOP,
  sceneResponses = [],
  allQuestionsSubmitted = false,
  showDiscussion = false,
  isSceneCompleted = false,
  allResponses = [],
}: RenderSceneComponentOptions): React.ReactNode {
  const currentSceneNumber = Number.parseInt(sceneId || scene.id || '1', 10);
  const resolvedSceneId = sceneId || scene.id;

  switch (type) {
    case 'scene-header':
      return (
        <div className="w-full h-full rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 px-3 py-2 flex flex-col justify-center gap-0.5 min-h-0 overflow-hidden">
          <h1 className="text-base font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight flex-shrink-0 truncate">
            {scene.title}
          </h1>
          {scene.description && (
            <p className="text-gray-200 text-sm leading-snug flex-shrink-0 line-clamp-2">{scene.description}</p>
          )}
        </div>
      );

    case 'vitals-monitor':
      return (
        <div className="w-full h-full flex flex-col min-h-0">
          <VitalsMonitor
            vitalsData={scene.vitals}
            displayConfig={scene.vitalsDisplayConfig}
            className="h-full"
            sceneId={resolvedSceneId}
          />
        </div>
      );

    case 'video-player':
      if (currentSceneNumber === 2) {
        return (
          <div className="w-full h-full min-h-0">
            <TabContainer
              videoUrl={videoUrl || ''}
              iframeUrl={scene.iframeUrl}
              posterUrl={scene.posterUrl}
              sceneTitle={scene.title}
            />
          </div>
        );
      }

      // In admin preview mode, always surface the actual uploaded/stream video
      // when one exists, even if runtime scene logic would show alternate content.
      if (isPreview && videoUrl) {
        return (
          <div className="w-full h-full rounded-lg overflow-hidden bg-black/50 border border-white/20 flex flex-col min-h-0">
            <VideoPlayer videoUrl={videoUrl} poster={scene.posterUrl} />
          </div>
        );
      }

      if (scene.iframeUrl) {
        return (
          <div className="w-full h-full rounded-lg overflow-hidden bg-black/50 border border-white/20 flex flex-col min-h-0">
            <iframe
              src={scene.iframeUrl}
              className="w-full flex-1 min-h-0 border-0"
              title={`${scene.title} Interactive Content`}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              loading="lazy"
            />
          </div>
        );
      }

      if (currentSceneNumber === 8) {
        return (
          <div className="w-full h-full min-h-0 overflow-auto">
            <SBARChart
              data={parseSbarData(allResponses)}
              readOnly={true}
            />
          </div>
        );
      }

      if (videosLoading || !videoUrl) {
        return (
          <div className="w-full h-full rounded-lg overflow-hidden bg-black/50 border border-white/20 flex items-center justify-center min-h-0">
            <div className="text-white text-sm">
              {videosLoading ? 'Loading video...' : 'No video available for this scene'}
            </div>
          </div>
        );
      }

      return (
        <div className="w-full h-full rounded-lg overflow-hidden bg-black/50 border border-white/20 flex flex-col min-h-0">
          <VideoPlayer videoUrl={videoUrl} poster={scene.posterUrl} />
        </div>
      );

    case 'clinical-findings':
      if (!scene.clinicalFindings?.length && !isPreview) return null;
      return (
        <div className="w-full h-full rounded-lg bg-white/5 backdrop-blur-xl border border-white/20 p-3 flex flex-col min-h-0 overflow-hidden">
          <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2 flex-shrink-0">
            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
            Clinical Findings
          </h4>
          <div className="space-y-1 flex-1 min-h-0 overflow-y-auto">
            {(scene.clinicalFindings || []).length === 0 ? (
              <p className="text-white/40 text-xs italic">No clinical findings</p>
            ) : (
              (scene.clinicalFindings || []).map((finding, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-gray-200">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full flex-shrink-0" />
                  <span>{finding}</span>
                </div>
              ))
            )}
          </div>
        </div>
      );

    case 'interactive-panel':
    case 'quiz-panel':
    case 'action-prompt': {
      if (!scene.quiz && !scene.actionPrompt && !isPreview) return null;

      return (
        <div className="w-full h-full flex flex-col min-h-0 overflow-hidden">
          <QuizComponent
            quiz={scene.quiz}
            actionPrompt={scene.actionPrompt}
            onAnswered={onQuizAnswered}
            onContinueToDiscussion={onContinueToDiscussion}
            onCompleteScene={onCompleteScene}
            sceneId={resolvedSceneId}
            discussionPrompts={scene.discussionPrompts}
            showDiscussion={showDiscussion}
            isSceneCompleted={isSceneCompleted}
            sceneResponses={sceneResponses}
            allQuestionsSubmitted={allQuestionsSubmitted}
            hideCompletionControls={suppressCompletionControls}
          />
        </div>
      );
    }

    case 'audio-player':
      if (!sceneAudioFiles.length && !isPreview) return null;
      return (
        <div className="w-full h-full rounded-lg bg-white/5 backdrop-blur-xl border border-white/20 p-2 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-1 flex-shrink-0">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            <h4 className="text-white font-semibold text-sm">Character Audio</h4>
          </div>
          {!sceneAudioFiles.length ? (
            <div className="flex-1 min-h-0 flex items-center justify-center text-white/40 text-xs">
              No audio files
            </div>
          ) : (
            <div className="flex-1 min-h-0 space-y-1 overflow-y-auto">
              {sceneAudioFiles
                .slice()
                .sort((a, b) => a.display_order - b.display_order)
                .map((audioFile, index) => (
                  <AudioPlayer
                    key={audioFile.id}
                    audioUrl={audioFile.audio_url}
                    title={audioFile.audio_title}
                    characterName={audioFile.character?.character_name || 'Unknown'}
                    avatarUrl={audioFile.character?.avatar_url}
                    subtitles={audioFile.audio_description}
                    autoPlay={index === 0 && currentPlayingAudio === 0}
                    isCurrentlyPlaying={currentPlayingAudio === index}
                    onPlay={() => onAudioPlay(index)}
                    onPause={onAudioPause}
                    onEnded={() => onAudioEnded(index)}
                    className="pill"
                    isHidden={audioFile.hide_player || false}
                  />
                ))}
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}
