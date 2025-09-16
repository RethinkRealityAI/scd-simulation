import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import VitalsMonitor from './VitalsMonitor';
import QuizComponent from './QuizComponent';
import VideoPlayer from './VideoPlayer';
import TabContainer from './TabContainer';
import AudioPlayer from './AudioPlayer';
import { useAudioData } from '../hooks/useAudioData';
import ProgressBar from './ProgressBar';
import { scenes } from '../data/scenesData';
import { useVideoData } from '../hooks/useVideoData';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const SimulationScene: React.FC = () => {
  const { sceneId } = useParams<{ sceneId: string }>();
  const navigate = useNavigate();
  const { state, dispatch, sendDataToWebhook } = useSimulation();
  const { videos, loading: videosLoading, refetch: refetchVideos } = useVideoData();
  const { getAudioFilesByScene, loading: audioLoading } = useAudioData();
  const [sceneStartTime, setSceneStartTime] = useState(Date.now());
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [sceneResponses, setSceneResponses] = useState<Array<{ questionId: string; answer: string; isCorrect: boolean }>>([]);
  const [allQuestionsSubmitted, setAllQuestionsSubmitted] = useState(false);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState<number | null>(null);
  const [previousSceneId, setPreviousSceneId] = useState<string | null>(null);

  const currentSceneNumber = parseInt(sceneId || '1');
  const scene = scenes[currentSceneNumber - 1];
  
  // Get video URL from database first, then fallback to scene data
  const videoData = videos.find(v => v.scene_id === currentSceneNumber);
  const videoUrl = videoData?.video_url || scene?.videoUrl || '';
  
  // Get audio files for this scene
  const sceneAudioFiles = getAudioFilesByScene(currentSceneNumber);

  // Calculate accessible scenes: completed scenes + current scene
  const completedScenes = Array.from(state.userData.completedScenes);
  const maxCompletedScene = completedScenes.length > 0 ? Math.max(...completedScenes) : 0;
  const maxAccessibleScene = Math.max(maxCompletedScene + 1, 1); // At least scene 1 is always accessible
  const canAccessScene = currentSceneNumber <= maxAccessibleScene;

  // Check if current scene is completed
  const isCurrentSceneCompleted = state.userData.completedScenes.has(currentSceneNumber);

  // Check if this is the completion scene (Scene 10)
  const isCompletionScene = scene?.isCompletionScene || currentSceneNumber === 10;

  // Redirect to completion screen if this is scene 10
  useEffect(() => {
    if (isCompletionScene) {
      navigate('/completion');
      return;
    }
  }, [isCompletionScene, navigate]);

  // Check if scene has discussion prompts
  const hasDiscussionPrompts = scene?.discussionPrompts && scene.discussionPrompts.length > 0;

  // Handle audio auto-play sequence
  const handleAudioEnded = (currentIndex: number) => {
    const nextIndex = currentIndex + 1;
    const sortedAudioFiles = sceneAudioFiles.sort((a, b) => a.display_order - b.display_order);
    
    if (nextIndex < sortedAudioFiles.length && sortedAudioFiles[nextIndex].auto_play) {
      setCurrentPlayingAudio(nextIndex);
      // The AudioPlayer component will handle the actual playback
    } else {
      setCurrentPlayingAudio(null);
    }
  };

  // Load existing responses for this scene
  useEffect(() => {
    // Refetch videos when component mounts to ensure latest data
    refetchVideos();
    
    // Reset state when changing scenes
    const currentSceneStr = sceneId || '1';
    if (previousSceneId !== null && previousSceneId !== currentSceneStr) {
      console.log('Resetting scene state - changing from', previousSceneId, 'to', currentSceneStr);
      setShowDiscussion(false);
      setAllQuestionsSubmitted(false);
      setSceneResponses([]);
      setCurrentPlayingAudio(null);
    }
    setPreviousSceneId(currentSceneStr);
    
    const existingResponses = state.userData.responses.filter(r => r.sceneId === sceneId);
    if (existingResponses.length > 0) {
      const responses = existingResponses.map(r => ({
        questionId: r.questionId,
        answer: r.answer,
        isCorrect: r.isCorrect
      }));
      setSceneResponses(responses);
      setAllQuestionsSubmitted(true);
      
      // For completed scenes, DON'T automatically show discussion prompts
      // Let the user progress through action prompts first
      console.log('Scene', sceneId, 'has existing responses, isCompleted:', isCurrentSceneCompleted);
    } else {
      // New scene with no responses - ensure clean state
      setShowDiscussion(false);
      setAllQuestionsSubmitted(false);
      setSceneResponses([]);
    }
  }, [sceneId, state.userData.responses, isCurrentSceneCompleted, previousSceneId]);

  useEffect(() => {
    if (!scene) {
      navigate('/');
      return;
    }

    // Redirect if user cannot access this scene
    if (!canAccessScene) {
      navigate(`/scene/${maxAccessibleScene}`);
      return;
    }

    dispatch({ type: 'SET_CURRENT_SCENE', payload: currentSceneNumber });
    setSceneStartTime(Date.now());
  }, [sceneId, scene, dispatch, navigate, currentSceneNumber, canAccessScene, maxAccessibleScene]);

  // Handle quiz answers (triggered by Continue button)
  const handleQuizAnswered = (responses: Array<{ questionId: string; answer: string; isCorrect: boolean }>) => {
    setSceneResponses(responses);
    setAllQuestionsSubmitted(true);
  };

  // Handle continue to discussion (triggered by Continue to Discussion button)
  const handleContinueToDiscussion = () => {
    setShowDiscussion(true);
  };

  // Handle scene completion (only triggered by Complete Scene button)
  const handleCompleteScene = async () => {
    const timeSpent = Date.now() - sceneStartTime;
    
    // Add responses to global state (only if not already added and responses exist)
    if (sceneResponses.length > 0) {
      sceneResponses.forEach(response => {
        const existingResponse = state.userData.responses.find(
          r => r.questionId === response.questionId && r.sceneId === sceneId
        );
        
        if (!existingResponse) {
          dispatch({
            type: 'ADD_RESPONSE',
            payload: {
              questionId: response.questionId,
              sceneId: sceneId || '1',
              answer: response.answer,
              isCorrect: response.isCorrect,
              timeSpent,
              timestamp: Date.now(),
            },
          });
        }
      });
    } else {
      // For informational scenes without responses, add a completion marker
      const completionResponse = {
        questionId: `scene_completion_${sceneId}`,
        sceneId: sceneId || '1',
        answer: 'Scene completed',
        isCorrect: true,
        timeSpent,
        timestamp: Date.now(),
      };
      
      const existingResponse = state.userData.responses.find(
        r => r.questionId === completionResponse.questionId && r.sceneId === sceneId
      );
      
      if (!existingResponse) {
        dispatch({
          type: 'ADD_RESPONSE',
          payload: completionResponse,
        });
      }
    }

    // Mark scene as completed
    dispatch({ type: 'COMPLETE_SCENE', payload: currentSceneNumber });

    console.log('Scene completed:', currentSceneNumber, 'Total completed:', state.userData.completedScenes.size + 1);

    // If this is the last scene, automatically submit data
    const isLastScene = currentSceneNumber >= state.userData.totalScenes;
    if (isLastScene) {
      try {
        console.log('Last scene completed, automatically submitting data...');
        await sendDataToWebhook();
        console.log('Data submitted successfully');
      } catch (error) {
        console.error('Failed to submit data automatically:', error);
        // Continue to results page even if submission fails
      }
    }

    // Navigate to next scene or results
    if (currentSceneNumber < state.userData.totalScenes) {
      navigate(`/scene/${currentSceneNumber + 1}`);
    } else {
      navigate('/completion');
    }
  };

  // Pure navigation functions (do not affect completion status)
  const handleNextScene = () => {
    const nextScene = currentSceneNumber + 1;
    const canAccessNext = nextScene <= maxAccessibleScene || isCurrentSceneCompleted;
    
    console.log('Navigation check:', {
      nextScene,
      maxAccessibleScene,
      isCurrentSceneCompleted,
      canAccessNext,
      totalScenes: state.userData.totalScenes
    });
    
    if (canAccessNext && nextScene <= state.userData.totalScenes) {
      navigate(`/scene/${nextScene}`);
    } else if (nextScene > state.userData.totalScenes) {
      navigate('/completion');
    }
  };

  const handlePreviousScene = () => {
    if (currentSceneNumber > 1) {
      navigate(`/scene/${currentSceneNumber - 1}`);
    }
  };

  // Navigation button states
  const canGoNext = isCurrentSceneCompleted || currentSceneNumber < maxAccessibleScene;
  const canGoPrevious = currentSceneNumber > 1;

  if (!scene) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-white text-xl">Scene not found</div>
      </div>
    );
  }

  if (!canAccessScene) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen overflow-hidden relative"
      style={{
        backgroundImage: 'url(https://i.ibb.co/BH6c7SRj/Splas.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Progress Bar - Minimal padding and full width */}
        <div className="flex-shrink-0 px-4 py-1">
          <ProgressBar 
            current={currentSceneNumber} 
            total={state.userData.totalScenes}
            completedScenes={state.userData.completedScenes}
          />
        </div>

        {/* Main Content - Optimized for no initial scrolling */}
        <div className="flex-1 overflow-hidden px-4 pb-12">
          <div className="h-full grid grid-cols-1 xl:grid-cols-12 gap-2">
            {/* Left Column - Vitals Monitor - Increased width */}
            <div className="xl:col-span-3 flex items-stretch order-last xl:order-first h-full">
              <VitalsMonitor vitalsData={scene.vitals} className="h-full" />
            </div>

            {/* Main Content Area - Adjusted for wider vitals */}
            <div className="xl:col-span-9 flex flex-col space-y-1 overflow-hidden h-full min-h-0">
              {/* Scene Header - Compact */}
              <div className="flex-shrink-0 p-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20">
                <div className="flex items-center justify-between mb-1">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                    {scene.title}
                  </h1>
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{currentSceneNumber} of {state.userData.totalScenes}</span>
                  </div>
                </div>
                <p className="text-gray-100 text-sm leading-relaxed">{scene.description}</p>
              </div>

              {/* Content Grid - Better proportions */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-5 gap-2 min-h-0 max-h-full">
                {/* Video and Audio Section */}
                <div className="lg:col-span-3 flex flex-col space-y-2 h-full min-h-0 overflow-hidden">
                  {/* Video/Interactive Container - Scene 2 gets tabbed interface */}
                  {currentSceneNumber === 2 ? (
                    <TabContainer
                      videoUrl={videoUrl}
                      iframeUrl={scene.iframeUrl}
                      posterUrl={scene.posterUrl}
                      sceneTitle={scene.title}
                    />
                  ) : (
                    <div className="rounded-lg overflow-hidden bg-black/50 backdrop-blur-xl border border-white/20 flex-1 min-h-0">
                      <div className="w-full h-full">
                        {scene.iframeUrl ? (
                          <iframe
                            src={scene.iframeUrl}
                            className="w-full h-full border-0"
                            title={`${scene.title} Interactive Content`}
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                            loading="lazy"
                            onError={(e) => {
                              console.error('Iframe failed to load:', e);
                            }}
                            onLoad={() => {
                              console.log('Iframe loaded successfully');
                            }}
                          />
                        ) : videosLoading || !videoUrl ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-white">
                              {videosLoading ? 'Loading video...' : 'No video available for this scene'}
                            </div>
                          </div>
                        ) : (
                          <VideoPlayer
                            videoUrl={videoUrl}
                            poster={scene.posterUrl}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Clinical Findings Display */}
                  {scene.clinicalFindings && scene.clinicalFindings.length > 0 && (
                    <div className="rounded-lg bg-white/5 backdrop-blur-xl border border-white/20 p-3">
                      <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                        Clinical Findings
                      </h4>
                      <div className="space-y-1">
                        {scene.clinicalFindings.map((finding, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-gray-200">
                            <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                            <span>{finding}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audio Files Section - Constrained height */}
                  {sceneAudioFiles.length > 0 && (
                    <div className="rounded-lg bg-white/5 backdrop-blur-xl border border-white/20 p-2 flex-shrink-0 max-h-32 overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                        <h4 className="text-white font-semibold text-sm">Character Audio</h4>
                      </div>
                      <div className="space-y-1 overflow-y-auto max-h-24">
                        {sceneAudioFiles
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
                              onPlay={() => setCurrentPlayingAudio(index)}
                              onPause={() => setCurrentPlayingAudio(null)}
                              onEnded={() => handleAudioEnded(index)}
                              className="pill"
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quiz Section - Fixed height with internal scrolling */}
                {(scene.quiz || scene.actionPrompt) && (
                  <div className="lg:col-span-2 h-full min-h-0 max-h-full overflow-hidden">
                    {/* Determine if scene has interactive options */}
                    {(() => {
                      const hasInteractiveOptions = !!(
                        (scene.quiz && scene.quiz.questions.length > 0) ||
                        (scene.actionPrompt && (
                          scene.actionPrompt.options || 
                          scene.actionPrompt.type === 'sbar' || 
                          scene.actionPrompt.type === 'reflection' ||
                          scene.actionPrompt.type === 'multi-select'
                        ))
                      );
                      
                      console.log('Scene', sceneId, 'hasInteractiveOptions:', hasInteractiveOptions, 'actionPrompt:', scene.actionPrompt);
                      
                      return (
                    <QuizComponent
                      quiz={scene.quiz}
                      actionPrompt={scene.actionPrompt}
                      onAnswered={handleQuizAnswered}
                      onContinueToDiscussion={handleContinueToDiscussion}
                      onCompleteScene={handleCompleteScene}
                      sceneId={sceneId || '1'}
                      discussionPrompts={scene.discussionPrompts}
                      showDiscussion={showDiscussion}
                      isSceneCompleted={isCurrentSceneCompleted}
                      canComplete={sceneResponses.length > 0}
                      sceneResponses={sceneResponses}
                      allQuestionsSubmitted={allQuestionsSubmitted}
                      hasInteractiveOptions={hasInteractiveOptions}
                    />
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Overlay - Reduced size and better positioning */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center pointer-events-none z-50">
          <button
            onClick={handlePreviousScene}
            disabled={!canGoPrevious}
            className="pointer-events-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 text-white 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     enabled:hover:bg-white/20 transition-all duration-200 shadow-lg text-xs"
          >
            <ChevronLeft className="w-3 h-3" />
            Previous
          </button>

          <button
            onClick={handleNextScene}
            disabled={!canGoNext}
            className="pointer-events-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white
                     disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed disabled:opacity-50
                     enabled:hover:from-cyan-400 enabled:hover:to-blue-400 
                     transition-all duration-200 shadow-lg text-xs"
          >
            {currentSceneNumber >= state.userData.totalScenes ? 'View Results' : 'Next Scene'}
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulationScene;