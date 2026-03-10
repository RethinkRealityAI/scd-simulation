import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import VitalsMonitor from './VitalsMonitor';
import QuizComponent from './QuizComponent';
import VideoPlayer from './VideoPlayer';
import TabContainer from './TabContainer';
import AudioPlayer from './AudioPlayer';
import SBARChart from './SBARChart';
import DynamicSceneLayout from './DynamicSceneLayout';
import { useAudioData } from '../hooks/useAudioData';
import ProgressBar from './ProgressBar';
import { useVideoData } from '../hooks/useVideoData';
import { useSceneConfig } from '../hooks/useSceneConfig';
import { useSceneOrdering } from '../hooks/useSceneOrdering';
import { ChevronLeft, ChevronRight, Clock, RefreshCw, Share2 } from 'lucide-react';

const SimulationScene: React.FC = () => {
  const { sceneId } = useParams<{ sceneId: string }>();
  const navigate = useNavigate();
  const { state, dispatch, sendDataToWebhook } = useSimulation();
  const { videos, loading: videosLoading, refetch: refetchVideos } = useVideoData();
  const { getAudioFilesByScene } = useAudioData();
  const [sceneStartTime, setSceneStartTime] = useState(Date.now());
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [sceneResponses, setSceneResponses] = useState<Array<{ questionId: string; answer: string; isCorrect: boolean; score?: number }>>([]);
  const [allQuestionsSubmitted, setAllQuestionsSubmitted] = useState(false);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState<number | null>(null);
  const [previousSceneId, setPreviousSceneId] = useState<string | null>(null);

  const currentSceneNumber = parseInt(sceneId || '1');

  // Load scene ordering to determine the dynamic completion scene and total content scenes
  const {
    getCompletionScene,
    getContentScenes,
    getNextContentScene,
    getPreviousContentScene,
    getContentSceneIndex,
    getFirstUnlockedContentScene,
    getAccessibleContentSceneIds,
    loading: orderLoading,
  } = useSceneOrdering();

  // Load scene configuration from database (with static fallback)
  const { sceneData: scene, loading: sceneLoading } = useSceneConfig(currentSceneNumber);

  // Get video URL from database first, then fallback to scene data
  const videoData = videos.find(v => v.scene_id === currentSceneNumber);
  const videoUrl = videoData?.video_url || scene?.videoUrl || '';

  // Get audio files for this scene
  const sceneAudioFiles = getAudioFilesByScene(currentSceneNumber);

  // Check if current scene is completed
  const isCurrentSceneCompleted = state.userData.completedScenes.has(currentSceneNumber);

  // Determine the completion scene from DB ordering (fallback: scene 10)
  const completionSceneItem = getCompletionScene();
  const completionSceneNumber = completionSceneItem?.scene_id ?? 10;
  const isCompletionScene = currentSceneNumber === completionSceneNumber;

  // Content scenes: active, non-completion scenes in display order
  const contentScenes = getContentScenes();
  const orderedSceneIds = contentScenes.map(item => item.scene_id);
  const completedSceneIds = Array.from(state.userData.completedScenes);
  const accessibleSceneIds = getAccessibleContentSceneIds(completedSceneIds);
  const nextUnlockedSceneId = getFirstUnlockedContentScene(completedSceneIds) ?? orderedSceneIds[0] ?? null;
  const currentScenePosition = getContentSceneIndex(currentSceneNumber);
  const previousSceneIdForNav = getPreviousContentScene(currentSceneNumber);
  const nextSceneIdForNav = getNextContentScene(currentSceneNumber);
  const canAccessScene = isCompletionScene || accessibleSceneIds.includes(currentSceneNumber);

  // Sync totalScenes from ordering data once loaded
  useEffect(() => {
    if (!orderLoading && contentScenes.length > 0) {
      dispatch({ type: 'SET_TOTAL_SCENES', payload: contentScenes.length });
    }
  }, [orderLoading, contentScenes.length, dispatch]);

  // Redirect to completion screen if this is the completion scene
  useEffect(() => {
    if (!orderLoading && isCompletionScene) {
      navigate('/completion');
    }
  }, [orderLoading, isCompletionScene, navigate]);

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

  // Refetch videos once on mount to get latest data — separate effect so it never
  // causes the scene-state effect below to re-run infinitely
  useEffect(() => {
    refetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load existing responses for this scene
  useEffect(() => {
    // Reset state when changing scenes
    const currentSceneStr = sceneId || '1';
    if (previousSceneId !== null && previousSceneId !== currentSceneStr) {
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
    } else {
      setShowDiscussion(false);
      setAllQuestionsSubmitted(false);
      setSceneResponses([]);
    }
  }, [sceneId, state.userData.responses, isCurrentSceneCompleted, previousSceneId]);

  useEffect(() => {
    // Wait for scene to load before checking
    if (sceneLoading) return;

    if (!scene) {
      navigate('/');
      return;
    }

    // Redirect if user cannot access this scene
    if (!canAccessScene && nextUnlockedSceneId !== null) {
      navigate(`/scene/${nextUnlockedSceneId}`);
      return;
    }

    dispatch({ type: 'SET_CURRENT_SCENE', payload: currentSceneNumber });
    setSceneStartTime(Date.now());
  }, [sceneId, scene, sceneLoading, dispatch, navigate, currentSceneNumber, canAccessScene, nextUnlockedSceneId]);

  const handleQuizAnswered = (responses: Array<{ questionId: string; answer: string; isCorrect: boolean; score?: number }>) => {
    setSceneResponses(prev => {
      const merged = new Map(prev.map(r => [r.questionId, r]));
      responses.forEach(r => merged.set(r.questionId, r));
      return Array.from(merged.values());
    });
    setAllQuestionsSubmitted(true);
  };

  // Handle continue to discussion (triggered by Continue to Discussion button)
  const handleContinueToDiscussion = () => {
    setShowDiscussion(true);
  };

  // Handle scene completion (only triggered by Complete Scene button)
  const handleCompleteScene = async () => {
    const timeSpent = Date.now() - sceneStartTime;

    const pendingResponses = [...state.userData.responses];

    // Add responses to global state (only if not already added and responses exist)
    if (sceneResponses.length > 0) {
      sceneResponses.forEach(response => {
        const existingResponse = pendingResponses.find(
          r => r.questionId === response.questionId && r.sceneId === sceneId
        );

        if (!existingResponse) {
          const nextResponse = {
            questionId: response.questionId,
            sceneId: sceneId || '1',
            answer: response.answer,
            isCorrect: response.isCorrect,
              score: response.score,
            timeSpent,
            timestamp: Date.now(),
          };
          pendingResponses.push(nextResponse);
          dispatch({
            type: 'ADD_RESPONSE',
            payload: nextResponse,
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
        score: 1,
        timeSpent,
        timestamp: Date.now(),
      };

      const existingResponse = pendingResponses.find(
        r => r.questionId === completionResponse.questionId && r.sceneId === sceneId
      );

      if (!existingResponse) {
        pendingResponses.push(completionResponse);
        dispatch({
          type: 'ADD_RESPONSE',
          payload: completionResponse,
        });
      }
    }

    // Mark scene as completed
    dispatch({ type: 'COMPLETE_SCENE', payload: currentSceneNumber });
    const pendingCompletedScenes = new Set([...state.userData.completedScenes, currentSceneNumber]);

    // Determine next scene from ordering system
    const nextSceneId = getNextContentScene(currentSceneNumber);
    const isLastScene = nextSceneId === null;

    // Submit data when completing the last content scene
    if (isLastScene) {
      try {
        await sendDataToWebhook({
          responses: pendingResponses,
          completedScenes: pendingCompletedScenes,
        });
      } catch (error) {
        console.error('Failed to submit data automatically:', error);
        // Continue to results page even if submission fails
      }
    }

    // Navigate to next scene or completion
    if (nextSceneId !== null) {
      navigate(`/scene/${nextSceneId}`);
    } else {
      navigate('/completion');
    }
  };

  // Pure navigation functions (do not affect completion status)
  const handleNextScene = () => {
    if (nextSceneIdForNav === null) {
      navigate('/completion');
      return;
    }
    const canAccessNext = accessibleSceneIds.includes(nextSceneIdForNav) || isCurrentSceneCompleted;
    if (canAccessNext) {
      navigate(`/scene/${nextSceneIdForNav}`);
    }
  };

  const handlePreviousScene = () => {
    if (previousSceneIdForNav !== null) {
      navigate(`/scene/${previousSceneIdForNav}`);
    }
  };

  // Navigation button states
  const canGoNext = isCurrentSceneCompleted || (nextSceneIdForNav !== null && accessibleSceneIds.includes(nextSceneIdForNav));
  const canGoPrevious = previousSceneIdForNav !== null;

  const [resultsCopied, setResultsCopied] = useState(false);

  // Show loading state while scene data or order is being fetched
  if (sceneLoading || orderLoading || !scene) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          {(sceneLoading || orderLoading) ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <div className="text-white text-xl font-semibold mb-2">Loading scene...</div>
              <div className="text-gray-400">Please wait while we load the latest data</div>
            </>
          ) : (
            <div className="text-white text-xl">Scene not found</div>
          )}
        </div>
      </div>
    );
  }

  if (!canAccessScene) {
    return null;
  }

  return (
    <div className="h-screen overflow-hidden relative bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Progress Bar - Minimal padding and full width */}
        <div className="flex-shrink-0 px-4 py-1">
          <ProgressBar
            current={currentSceneNumber}
            total={state.userData.totalScenes}
            completedScenes={state.userData.completedScenes}
            orderedSceneIds={orderedSceneIds}
            accessibleSceneIds={accessibleSceneIds}
          />
        </div>

        {/* Main Content - Optimized for no initial scrolling */}
        <div className="flex-1 overflow-hidden px-4 pb-10">
          {scene.layoutConfig ? (
            /* ── Dynamic layout from SceneBuilder ── */
            <DynamicSceneLayout
              scene={scene}
              layoutConfig={scene.layoutConfig}
              sceneId={sceneId || '1'}
              videoUrl={videoUrl}
              videosLoading={videosLoading}
              sceneAudioFiles={sceneAudioFiles}
              currentPlayingAudio={currentPlayingAudio}
              onAudioPlay={setCurrentPlayingAudio}
              onAudioPause={() => setCurrentPlayingAudio(null)}
              onAudioEnded={handleAudioEnded}
              onQuizAnswered={handleQuizAnswered}
              onContinueToDiscussion={handleContinueToDiscussion}
              onCompleteScene={handleCompleteScene}
              sceneResponses={sceneResponses}
              allQuestionsSubmitted={allQuestionsSubmitted}
              showDiscussion={showDiscussion}
              isSceneCompleted={isCurrentSceneCompleted}
              canComplete={sceneResponses.length > 0}
              allResponses={state.userData.responses}
            />
          ) : (
            /* ── Legacy hardcoded layout (fallback) ── */
            <div className="h-full grid grid-cols-1 xl:grid-cols-12 gap-2">
              {/* Left Column - Vitals Monitor - Hidden for Scene 9 */}
              {currentSceneNumber !== 9 && (
                <div className="flex items-stretch order-last xl:order-first h-full xl:col-span-3">
                  <VitalsMonitor vitalsData={scene.vitals} displayConfig={scene.vitalsDisplayConfig} className="h-full" sceneId={sceneId} />
                </div>
              )}

              {/* Main Content Area - Full width for Scene 9, consistent for all other scenes */}
              <div className={`flex flex-col space-y-1 overflow-hidden h-full min-h-0 ${currentSceneNumber === 9 ? 'xl:col-span-12' : 'xl:col-span-9'
                }`}>
                {/* Scene Header - Compact */}
                <div className="flex-shrink-0 p-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20">
                  <div className="flex items-center justify-between mb-1">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                      {scene.title}
                    </h1>
                    <div className="flex items-center gap-2">
                      {/* Scene 9 Action Buttons */}
                      {currentSceneNumber === 9 && (
                        <div className="flex items-center gap-2 mr-3">
                          <button
                            onClick={() => {
                              dispatch({ type: 'RESET_SIMULATION' });
                              navigate('/welcome');
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-xs
                                   hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Restart Simulation
                          </button>

                          <button
                            onClick={() => {
                              const results = {
                                score: state.userData.responses.filter(r => r.isCorrect).length / state.userData.responses.length * 100,
                                completionTime: Date.now() - state.userData.startTime,
                                responses: state.userData.responses.length
                              };
                              navigator.clipboard.writeText(JSON.stringify(results, null, 2)).then(() => {
                                setResultsCopied(true);
                                setTimeout(() => setResultsCopied(false), 2000);
                              });
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-xs
                                   hover:from-green-400 hover:to-emerald-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <Share2 className="w-3 h-3" />
                            {resultsCopied ? 'Copied!' : 'Share Results'}
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-cyan-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{currentScenePosition >= 0 ? currentScenePosition + 1 : currentSceneNumber} of {state.userData.totalScenes}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-100 text-sm leading-relaxed">{scene.description}</p>
                </div>

                {/* Content Grid - Scene 4 gets different proportions for SBAR expansion */}
                <div className={`flex-1 overflow-hidden grid grid-cols-1 gap-2 min-h-0 max-h-full transition-all duration-700 ease-in-out ${currentSceneNumber === 4 ? 'lg:grid-cols-7' : 'lg:grid-cols-5'
                  }`}>
                  {/* Video and Audio Section - Hidden for Scene 9, expanded for Scene 4 */}
                  {currentSceneNumber !== 9 && (
                    <div className={`flex flex-col space-y-2 h-full min-h-0 overflow-hidden transition-all duration-700 ease-in-out ${currentSceneNumber === 4 ? 'lg:col-span-4' : 'lg:col-span-3'
                      }`}>
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
                              />
                            ) : currentSceneNumber === 8 ? (
                              // Show SBAR Chart for Scene 8
                              (() => {
                                // Get SBAR data from Scene 4 responses
                                const sbarResponse = state.userData.responses.find(r =>
                                  r.sceneId === '4' && r.questionId === 'action_4'
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
                                  recommendation: []
                                };

                                if (sbarResponse) {
                                  try {
                                    // Parse SBAR response format: "SITUATION: item1, item2\nBACKGROUND: ..."
                                    const sections = sbarResponse.answer.split('\n');
                                    sections.forEach(section => {
                                      const [category, items] = section.split(': ');
                                      if (category && items) {
                                        const categoryKey = category.toLowerCase() as keyof typeof sbarData;
                                        if (Object.prototype.hasOwnProperty.call(sbarData, categoryKey)) {
                                          sbarData[categoryKey] = items.split(', ').filter(item => item.trim());
                                        }
                                      }
                                    });
                                  } catch (error) {
                                    console.error('Error parsing SBAR data:', error);
                                  }
                                }

                                return (
                                  <SBARChart
                                    data={sbarData}
                                    readOnly={true}
                                  />
                                );
                              })()
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
                                  isHidden={audioFile.hide_player || false}
                                />
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quiz Section - Full width for Scene 9, reduced width for Scene 4 */}
                  {(scene.quiz || scene.actionPrompt) && (
                    <div className={`h-full min-h-0 max-h-full overflow-y-auto transition-all duration-700 ease-in-out ${currentSceneNumber === 9 ? 'lg:col-span-5' :
                      currentSceneNumber === 4 ? 'lg:col-span-3' : 'lg:col-span-2'
                      }`}>
                      {(() => {
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
                            sceneResponses={sceneResponses}
                            allQuestionsSubmitted={allQuestionsSubmitted}
                          />
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
            {nextSceneIdForNav === null ? 'View Results' : 'Next Scene'}
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulationScene;