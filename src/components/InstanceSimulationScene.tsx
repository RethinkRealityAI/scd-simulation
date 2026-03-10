import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInstanceSimulation } from '../context/InstanceSimulationContext';
import { useSceneConfig } from '../hooks/useSceneConfig';
import { useVideoData } from '../hooks/useVideoData';
import { useAudioData } from '../hooks/useAudioData';
import VitalsMonitor from './VitalsMonitor';
import QuizComponent from './QuizComponent';
import VideoPlayer from './VideoPlayer';
import TabContainer from './TabContainer';
import AudioPlayer from './AudioPlayer';
import SBARChart from './SBARChart';
import ProgressBar from './ProgressBar';
import DynamicSceneLayout from './DynamicSceneLayout';
import { ChevronLeft, ChevronRight, Clock, RefreshCw, Share2, CheckCircle } from 'lucide-react';
import SimulationCompleteScreen from './SimulationCompleteScreen';
import { useSceneOrdering } from '../hooks/useSceneOrdering';

const InstanceSimulationScene: React.FC = () => {
  const { sceneId, institutionId } = useParams<{ sceneId: string; institutionId: string }>();
  const navigate = useNavigate();
  const { state, dispatch, sendDataToWebhook } = useInstanceSimulation();
  const [sceneStartTime] = useState(Date.now());
  const [sceneResponses, setSceneResponses] = useState<Array<{ questionId: string; answer: string; isCorrect: boolean; score?: number }>>([]);
  const [allQuestionsSubmitted, setAllQuestionsSubmitted] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState<number | null>(null);

  const currentSceneNumber = parseInt(sceneId || '1');
  const [resultsCopied, setResultsCopied] = useState(false);

  // Load scene ordering for this instance to determine content scenes and completion scene
  const {
    getCompletionScene,
    getContentScenes,
    getNextContentScene,
    getPreviousContentScene,
    getContentSceneIndex,
    getFirstUnlockedContentScene,
    getAccessibleContentSceneIds,
    loading: orderLoading,
  } = useSceneOrdering(state.instance?.id);

  const contentScenes = getContentScenes();
  const completionSceneItem = getCompletionScene();
  const completionSceneNumber = completionSceneItem?.scene_id ?? 10;
  const isCompletionScene = currentSceneNumber === completionSceneNumber;
  const orderedSceneIds = contentScenes.map(item => item.scene_id);
  const completedSceneIds = Array.from(state.userData.completedScenes);
  const accessibleSceneIds = getAccessibleContentSceneIds(completedSceneIds);
  const nextUnlockedSceneId = getFirstUnlockedContentScene(completedSceneIds) ?? orderedSceneIds[0] ?? null;
  const currentScenePosition = getContentSceneIndex(currentSceneNumber);
  const previousSceneIdForNav = getPreviousContentScene(currentSceneNumber);
  const nextSceneIdForNav = getNextContentScene(currentSceneNumber);

  // Sync totalScenes once ordering data is available
  useEffect(() => {
    if (!orderLoading && contentScenes.length > 0) {
      dispatch({ type: 'SET_TOTAL_SCENES', payload: contentScenes.length });
    }
  }, [orderLoading, contentScenes.length, dispatch]);

  // Load scene configuration from database (with static fallback)
  const { sceneData, loading: sceneLoading } = useSceneConfig(currentSceneNumber, state.instance?.id);

  // Get video URL from database first, then fallback to scene data
  const { videos } = useVideoData(state.instance?.id);
  const videoData = videos.find(v => v.scene_id === currentSceneNumber);


  // Get audio files for this scene
  const { getAudioFilesByScene } = useAudioData();
  const sceneAudioFiles = getAudioFilesByScene(currentSceneNumber);

  // Calculate accessible scenes: completed scenes + current scene
  const canAccessScene = isCompletionScene || accessibleSceneIds.includes(currentSceneNumber);

  // Check if current scene is completed
  const isCurrentSceneCompleted = state.userData.completedScenes.has(currentSceneNumber);

  // Check if this is the completion scene (Scene 10)


  // Apply instance-specific branding
  useEffect(() => {
    if (state.instance?.branding_config) {
      const branding = state.instance.branding_config;

      // Apply CSS custom properties
      const root = document.documentElement;
      root.style.setProperty('--primary-color', branding.primary_color);
      root.style.setProperty('--secondary-color', branding.secondary_color);
      root.style.setProperty('--accent-color', branding.accent_color);
      root.style.setProperty('--background-color', branding.background_color);
      root.style.setProperty('--text-color', branding.text_color);
      root.style.setProperty('--font-family', branding.font_family);

      // Apply custom CSS if provided
      if (branding.custom_css) {
        const styleId = 'instance-custom-css';
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          existingStyle.remove();
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = branding.custom_css;
        document.head.appendChild(style);
      }
    }
  }, [state.instance]);

  const handleQuizAnswered = (responses: Array<{ questionId: string; answer: string; isCorrect: boolean; score?: number }>) => {
    setSceneResponses(prev => {
      const merged = new Map(prev.map(r => [r.questionId, r]));
      responses.forEach(r => merged.set(r.questionId, r));
      return Array.from(merged.values());
    });
    setAllQuestionsSubmitted(true);
  };

  const handleContinueToDiscussion = () => {
    setShowDiscussion(true);
  };

  // Handle scene completion
  const handleCompleteScene = async () => {
    const timeSpent = Date.now() - sceneStartTime;
    const pendingResponses = [...state.userData.responses];

    try {
      if (sceneResponses.length > 0) {
        sceneResponses.forEach(response => {
          const existingResponse = pendingResponses.find(
            r => r.questionId === response.questionId && r.sceneId === currentSceneNumber,
          );

          if (!existingResponse) {
            const nextResponse = {
              questionId: response.questionId,
              sceneId: currentSceneNumber,
              answer: response.answer,
              isCorrect: response.isCorrect,
              score: response.score,
              timeSpent,
              timestamp: Date.now(),
            };
            pendingResponses.push(nextResponse);
            dispatch({ type: 'ADD_RESPONSE', payload: nextResponse });
          }
        });
      } else {
        const completionResponse = {
          questionId: `scene_completion_${currentSceneNumber}`,
          sceneId: currentSceneNumber,
          answer: 'Scene completed',
          isCorrect: true,
          score: 1,
          timeSpent,
          timestamp: Date.now(),
        };
        const existingResponse = pendingResponses.find(
          r => r.questionId === completionResponse.questionId && r.sceneId === currentSceneNumber,
        );
        if (!existingResponse) {
          pendingResponses.push(completionResponse);
          dispatch({ type: 'ADD_RESPONSE', payload: completionResponse });
        }
      }

      // Update local state
      dispatch({ type: 'COMPLETE_SCENE', payload: currentSceneNumber });
      const pendingCompletedScenes = new Set([...state.userData.completedScenes, currentSceneNumber]);

      const nextSceneId = getNextContentScene(currentSceneNumber);
      const isLastScene = nextSceneId === null;

      if (isLastScene) {
        await sendDataToWebhook({
          responses: pendingResponses,
          completedScenes: pendingCompletedScenes,
        });
      }

    } catch (error) {
      console.error('Failed to submit data automatically:', error);
      // Continue to results page even if submission fails
    }

    // Navigate to next scene or completion via ordering
    if (nextSceneIdForNav !== null) {
      navigate(`/sim/${institutionId}/scene/${nextSceneIdForNav}`);
    } else {
      navigate(`/sim/${institutionId}/completion`);
    }
  };

  // Pure navigation (does not affect completion status)
  const handleNextScene = () => {
    if (nextSceneIdForNav === null) {
      navigate(`/sim/${institutionId}/completion`);
      return;
    }
    const canAccessNext = accessibleSceneIds.includes(nextSceneIdForNav) || isCurrentSceneCompleted;
    if (canAccessNext) {
      navigate(`/sim/${institutionId}/scene/${nextSceneIdForNav}`);
    }
  };

  const handlePreviousScene = () => {
    if (previousSceneIdForNav !== null) {
      navigate(`/sim/${institutionId}/scene/${previousSceneIdForNav}`);
    }
  };

  // Detect if scene needs interactive input before completing
  // A scene with no quiz AND no actionPrompt requires no interaction — can always be completed
  const hasInteractivePanel = !!(sceneData?.quiz?.questions?.length || sceneData?.actionPrompt);
  const canCompleteScene = !hasInteractivePanel || sceneResponses.length > 0;

  // Navigation button states
  const canGoNext = isCurrentSceneCompleted || !hasInteractivePanel || (nextSceneIdForNav !== null && accessibleSceneIds.includes(nextSceneIdForNav));
  const canGoPrevious = previousSceneIdForNav !== null;

  // Show loading state while scene data is being fetched from database
  if (sceneLoading || orderLoading || !sceneData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          {(sceneLoading || orderLoading) ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <div className="text-white text-xl font-semibold mb-2">Loading scene configuration...</div>
              <div className="text-gray-400">Please wait while we load the latest data from database</div>
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

  // ── Completion scene: render SimulationCompleteScreen instead of normal layout ──
  if (isCompletionScene) {
    const bgColor = (state.instance?.branding_config as Record<string, string>)?.background_color;
    return (
      <div
        className="h-screen overflow-hidden relative bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900"
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 h-full">
          <SimulationCompleteScreen
            onRestart={() => {
              dispatch({ type: 'RESET_SCENE_STATE' });
              navigate(`/sim/${institutionId}`);
            }}
          />
        </div>
      </div>
    );
  }

  const instanceBgImage = (state.instance?.branding_config as Record<string, string>)?.background_image_url;

  return (
    <div
      className="h-screen overflow-hidden relative bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900"
      style={instanceBgImage ? {
        backgroundImage: `url(${instanceBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      } : undefined}
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
            orderedSceneIds={orderedSceneIds}
            accessibleSceneIds={accessibleSceneIds}
          />
        </div>

        {/* Main Content - Optimized for no initial scrolling */}
        <div className="flex-1 overflow-hidden px-4 pb-2">
          {sceneData.layoutConfig ? (
            <DynamicSceneLayout
              scene={sceneData}
              layoutConfig={sceneData.layoutConfig}
              sceneId={sceneId || sceneData.id}
              videoUrl={videoData?.video_url || sceneData.videoUrl}
              videosLoading={false}
              sceneAudioFiles={sceneAudioFiles}
              currentPlayingAudio={currentPlayingAudio}
              onAudioPlay={setCurrentPlayingAudio}
              onAudioPause={() => setCurrentPlayingAudio(null)}
              onAudioEnded={() => setCurrentPlayingAudio(null)}
              onQuizAnswered={handleQuizAnswered}
              onContinueToDiscussion={handleContinueToDiscussion}
              onCompleteScene={handleCompleteScene}
              sceneResponses={sceneResponses}
              allQuestionsSubmitted={allQuestionsSubmitted}
              showDiscussion={showDiscussion}
              isSceneCompleted={isCurrentSceneCompleted}
              canComplete={canCompleteScene}
              allResponses={state.userData.responses.map(r => ({ ...r, sceneId: String(r.sceneId) }))}
            />
          ) : (
            <div className="h-full grid grid-cols-1 xl:grid-cols-12 gap-2">
              {/* Left Column - Vitals Monitor - Hidden for Scene 9 */}
              {currentSceneNumber !== 9 && (
                <div className="flex items-stretch order-last xl:order-first h-full xl:col-span-3">
                  <VitalsMonitor vitalsData={sceneData.vitals} displayConfig={sceneData.vitalsDisplayConfig} className="h-full" sceneId={sceneId} />
                </div>
              )}

              {/* Main Content Area - Full width for Scene 9, consistent for all other scenes */}
              <div className={`flex flex-col space-y-1 overflow-hidden h-full min-h-0 ${currentSceneNumber === 9 ? 'xl:col-span-12' : 'xl:col-span-9'
                }`}>
                {/* Scene Header - Compact */}
                <div className="flex-shrink-0 p-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20">
                  <div className="flex items-center justify-between mb-1">
                    <h1 className="text-base font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                      {sceneData.title}
                    </h1>
                    <div className="flex items-center gap-2">
                      {/* Scene 9 Action Buttons */}
                      {currentSceneNumber === 9 && (
                        <div className="flex items-center gap-2 mr-3">
                          <button
                            onClick={() => {
                              dispatch({ type: 'RESET_SCENE_STATE' });
                              navigate(`/sim/${institutionId}`);
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
                  <p className="text-gray-100 text-sm leading-relaxed">{sceneData.description}</p>
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
                          videoUrl={videoData?.video_url || sceneData.videoUrl || ''}
                          iframeUrl={sceneData.iframeUrl}
                          posterUrl={sceneData.posterUrl}
                          sceneTitle={sceneData.title}
                        />
                      ) : (
                        <div className="rounded-lg overflow-hidden bg-black/50 backdrop-blur-xl border border-white/20 flex-1 min-h-0">
                          <div className="w-full h-full">
                            {sceneData.iframeUrl ? (
                              <iframe
                                src={sceneData.iframeUrl}
                                className="w-full h-full border-0"
                                title={`${sceneData.title} Interactive Content`}
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                                loading="lazy"
                                onError={(e) => {
                                  console.error('Iframe failed to load:', e);
                                }}
                              />
                            ) : currentSceneNumber === 8 ? (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                                <div className="text-center text-white p-8">
                                  <h3 className="text-xl font-semibold mb-4">Interactive Quiz</h3>
                                  <p className="text-gray-300">Complete the quiz below to proceed</p>
                                </div>
                              </div>
                            ) : videoData?.video_url || sceneData?.videoUrl ? (
                              <VideoPlayer
                                videoUrl={(videoData?.video_url || sceneData?.videoUrl)!}
                                poster={videoData?.poster_url || sceneData?.posterUrl}
                                className="w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                                <div className="text-center text-white p-8">
                                  <h3 className="text-xl font-semibold mb-4">No Video Available</h3>
                                  <p className="text-gray-300">Video content will be available soon</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Audio Player - Only show if there are audio files */}
                      {sceneAudioFiles && sceneAudioFiles.length > 0 && (
                        <div className="flex-shrink-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-3">
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
                                  onEnded={() => setCurrentPlayingAudio(null)}
                                  className="pill"
                                  isHidden={audioFile.hide_player || false}
                                />
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Right Column - Quiz and SBAR - Hidden for Scene 9 */}
                  {currentSceneNumber !== 9 && (
                    <div className={`flex flex-col space-y-2 h-full min-h-0 overflow-y-auto transition-all duration-700 ease-in-out ${currentSceneNumber === 4 ? 'lg:col-span-3' : 'lg:col-span-2'
                      }`}>
                      {/* Quiz Component */}
                      {sceneData.quiz && sceneData.quiz.questions && sceneData.quiz.questions.length > 0 && (
                        <div className="flex-1 min-h-0">
                          <QuizComponent
                            quiz={sceneData.quiz}
                            onAnswered={(responses: Array<{ questionId: string; answer: string; isCorrect: boolean; score?: number }>) => {
                              setSceneResponses(responses);
                              setAllQuestionsSubmitted(responses.every((r: { answer: string }) => r.answer !== ''));
                            }}
                            sceneId={sceneId || ''}
                            onContinueToDiscussion={() => { }}
                            onCompleteScene={() => { }}
                            showDiscussion={false}
                            isSceneCompleted={isCurrentSceneCompleted}
                            sceneResponses={sceneResponses}
                            allQuestionsSubmitted={allQuestionsSubmitted}
                          />
                        </div>
                      )}

                      {/* SBAR Chart - Only for Scene 4 */}
                      {currentSceneNumber === 4 && (
                        <div className="flex-1 min-h-0">
                          <SBARChart
                            data={{
                              situation: [
                                '15-year-old Tobiloba Johnson',
                                'Sickle cell disease patient',
                                'Severe pain crisis (9/10)'
                              ],
                              background: [
                                'Known sickle cell disease',
                                'Previous VOC episodes',
                                'Pain started 2 days ago'
                              ],
                              assessment: [
                                'HR: 128 bpm (elevated)',
                                'Pain remains 9/10 after morphine',
                                'Appears withdrawn and guarded'
                              ],
                              recommendation: [
                                'Escalate to attending physician',
                                'Consider additional pain management',
                                'Monitor for complications'
                              ]
                            }}
                            onSBARComplete={() => {}}
                            className="bg-white/10 backdrop-blur-xl border border-white/20 h-full"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls - Fixed at bottom */}
        <div className="flex-shrink-0 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePreviousScene}
                disabled={!canGoPrevious}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${canGoPrevious
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  : 'bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-500/20'
                  }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="text-sm text-gray-300">
                Time spent: {Math.floor((Date.now() - sceneStartTime) / 60000)}:{(Math.floor((Date.now() - sceneStartTime) / 1000) % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Scene 9 has its own "Complete Debrief" button inside the reflection panel — hide the redundant nav button */}
              {currentSceneNumber !== 9 && (
                <button
                  onClick={handleCompleteScene}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  title={nextSceneIdForNav === null ? 'Go to Completion' : 'Complete & proceed to next scene'}
                >
                  <CheckCircle className="w-4 h-4" />
                  {nextSceneIdForNav === null ? 'Finish Simulation' : 'Complete Scene'}
                </button>
              )}

              <button
                onClick={handleNextScene}
                disabled={!canGoNext}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${canGoNext
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  : 'bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-500/20'
                  }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstanceSimulationScene;