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

const NOOP = () => {};
const NOOP_QUIZ = (_responses: SceneAnswer[]) => {};

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
    // Expected format: "SITUATION: item1, item2\nBACKGROUND: ..."
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

export function renderSceneComponent({
  type,
  scene,
  sceneId,
  videoUrl,
  videosLoading,
  isPreview = false,
  interactiveVariant = 'combined',
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
  canComplete,
  allResponses = [],
}: RenderSceneComponentOptions): React.ReactNode {
  const currentSceneNumber = Number.parseInt(sceneId || scene.id || '1', 10);
  const resolvedSceneId = sceneId || scene.id;

  switch (type) {
    case 'scene-header':
      return (
        <div className="rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 p-2.5 flex flex-col justify-center h-full">
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
            {scene.title}
          </h1>
          <p className="text-gray-100 text-sm leading-relaxed mt-0.5">{scene.description}</p>
        </div>
      );

    case 'vitals-monitor':
      return (
        <VitalsMonitor
          vitalsData={scene.vitals}
          displayConfig={scene.vitalsDisplayConfig}
          className="h-full"
          sceneId={resolvedSceneId}
        />
      );

    case 'video-player':
      if (currentSceneNumber === 2) {
        return (
          <TabContainer
            videoUrl={videoUrl || ''}
            iframeUrl={scene.iframeUrl}
            posterUrl={scene.posterUrl}
            sceneTitle={scene.title}
          />
        );
      }

      if (scene.iframeUrl) {
        return (
          <div className="rounded-lg overflow-hidden bg-black/50 border border-white/20 h-full">
            <iframe
              src={scene.iframeUrl}
              className="w-full h-full border-0"
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
          <SBARChart
            data={parseSbarData(allResponses)}
            readOnly={true}
          />
        );
      }

      if (videosLoading || !videoUrl) {
        return (
          <div className="rounded-lg overflow-hidden bg-black/50 border border-white/20 h-full flex items-center justify-center">
            <div className="text-white text-sm">
              {videosLoading ? 'Loading video...' : 'No video available for this scene'}
            </div>
          </div>
        );
      }

      return (
        <div className="rounded-lg overflow-hidden bg-black/50 border border-white/20 h-full">
          <VideoPlayer videoUrl={videoUrl} poster={scene.posterUrl} />
        </div>
      );

    case 'clinical-findings':
      if (!scene.clinicalFindings?.length && !isPreview) return null;
      return (
        <div className="rounded-lg bg-white/5 backdrop-blur-xl border border-white/20 p-3 h-full overflow-auto">
          <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
            Clinical Findings
          </h4>
          <div className="space-y-1">
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

    case 'quiz-panel':
    case 'action-prompt': {
      const quizProp =
        interactiveVariant === 'actionOnly'
          ? undefined
          : scene.quiz;
      const actionPromptProp =
        interactiveVariant === 'quizOnly'
          ? undefined
          : scene.actionPrompt;

      if (!quizProp && !actionPromptProp && !isPreview) return null;

      const hasInteractiveOptions = !!(
        (quizProp && quizProp.questions.length > 0) ||
        (actionPromptProp && (
          actionPromptProp.options ||
          actionPromptProp.type === 'sbar' ||
          actionPromptProp.type === 'reflection' ||
          actionPromptProp.type === 'multi-select'
        ))
      );

      const includeDiscussion = interactiveVariant !== 'quizOnly';

      return (
        <div className="h-full min-h-0 overflow-hidden">
          <QuizComponent
            quiz={quizProp}
            actionPrompt={actionPromptProp}
            onAnswered={onQuizAnswered}
            onContinueToDiscussion={includeDiscussion ? onContinueToDiscussion : NOOP}
            onCompleteScene={onCompleteScene}
            sceneId={resolvedSceneId}
            discussionPrompts={includeDiscussion ? scene.discussionPrompts : undefined}
            showDiscussion={includeDiscussion ? showDiscussion : false}
            isSceneCompleted={isSceneCompleted}
            canComplete={canComplete ?? ((sceneResponses.length > 0) || !hasInteractiveOptions)}
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
        <div className="rounded-lg bg-white/5 backdrop-blur-xl border border-white/20 p-2 h-full overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            <h4 className="text-white font-semibold text-sm">Character Audio</h4>
          </div>
          {!sceneAudioFiles.length ? (
            <div className="h-[calc(100%-24px)] flex items-center justify-center text-white/40 text-xs">
              No audio files
            </div>
          ) : (
            <div className="space-y-1 overflow-y-auto h-[calc(100%-24px)]">
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

