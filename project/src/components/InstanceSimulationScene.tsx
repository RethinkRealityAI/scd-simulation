import React, { useState, useEffect, useRef } from 'react';
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
import { ChevronLeft, ChevronRight, Clock, RefreshCw, Share2, CheckCircle } from 'lucide-react';

const InstanceSimulationScene: React.FC = () => {
  const { sceneId, institutionId } = useParams<{ sceneId: string; institutionId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useInstanceSimulation();
  const [sceneStartTime, setSceneStartTime] = useState(Date.now());
  const [sceneResponses, setSceneResponses] = useState<Array<{ questionId: string; answer: string; isCorrect: boolean }>>([]);
  const [allQuestionsSubmitted, setAllQuestionsSubmitted] = useState(false);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState<number | null>(null);

  const currentSceneNumber = parseInt(sceneId || '1');
  
  // Load scene configuration from database (with static fallback)
  const { sceneData, loading: sceneLoading } = useSceneConfig(currentSceneNumber);
  
  // Get video URL from database first, then fallback to scene data
  const { videos } = useVideoData();
  const videoData = videos.find(v => v.scene_id === currentSceneNumber);
  const videoUrl = videoData?.video_url || sceneData?.videoUrl || '';
  
  // Get audio files for this scene
  const { getAudioFilesByScene } = useAudioData();
  const sceneAudioFiles = getAudioFilesByScene(currentSceneNumber);

  // Calculate accessible scenes: completed scenes + current scene
  const completedScenes = Array.from(state.userData.completedScenes);
  const maxCompletedScene = completedScenes.length > 0 ? Math.max(...completedScenes) : 0;
  const maxAccessibleScene = Math.max(maxCompletedScene + 1, 1); // At least scene 1 is always accessible
  const canAccessScene = currentSceneNumber <= maxAccessibleScene;

  // Check if current scene is completed
  const isCurrentSceneCompleted = state.userData.completedScenes.has(currentSceneNumber);

  // Check if this is the completion scene (Scene 10)
  const isCompletionScene = currentSceneNumber === state.userData.totalScenes;

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
        let existingStyle = document.getElementById(styleId);
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

  // Handle scene completion
  const handleCompleteScene = async () => {
    const timeSpent = Date.now() - sceneStartTime;

    try {
      // Create completion data with instance information
      const completionData = {
        institution_id: state.instance?.institution_id,
        instance_id: state.instance?.id,
        scene_id: currentSceneNumber,
        time_spent: timeSpent,
        quiz_completed: allQuestionsSubmitted,
        sbar_completed: false, // Add SBAR completion logic if needed
        notes: '',
        completion_reason: 'completed',
        completion_notes: '',
        timestamp: new Date().toISOString(),
        user_data: {
          education_level: state.userData?.educationLevel,
          organization: state.userData?.organization,
          school: state.userData?.school,
          year: state.userData?.year,
          program: state.userData?.program,
          field: state.userData?.field,
          how_heard: state.userData?.howHeard
        }
      };

      // Send to instance-specific webhook if configured
      if (state.instance?.webhook_url) {
        try {
          const response = await fetch(state.instance.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': state.instance.webhook_secret ? `Bearer ${state.instance.webhook_secret}` : '',
            },
            body: JSON.stringify(completionData)
          });

          if (!response.ok) {
            console.error('Webhook submission failed:', response.statusText);
          }
        } catch (error) {
          console.error('Error submitting to webhook:', error);
        }
      }

      // Update local state
      dispatch({
        type: 'COMPLETE_SCENE',
        payload: {
          sceneId: currentSceneNumber,
          timeSpent,
          responses: sceneResponses,
          timestamp: new Date().toISOString()
        }
      });

      console.log('Data submitted successfully');
    } catch (error) {
      console.error('Failed to submit data automatically:', error);
      // Continue to results page even if submission fails
    }

    // Navigate to next scene or results
    if (currentSceneNumber < state.userData.totalScenes) {
      navigate(`/sim/${institutionId}/scene/${currentSceneNumber + 1}`);
    } else {
      navigate(`/sim/${institutionId}/completion`);
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
      navigate(`/sim/${institutionId}/scene/${nextScene}`);
    } else if (nextScene > state.userData.totalScenes) {
      navigate(`/sim/${institutionId}/completion`);
    }
  };

  const handlePreviousScene = () => {
    if (currentSceneNumber > 1) {
      navigate(`/sim/${institutionId}/scene/${currentSceneNumber - 1}`);
    }
  };

  // Navigation button states
  const canGoNext = isCurrentSceneCompleted || currentSceneNumber < maxAccessibleScene;
  const canGoPrevious = currentSceneNumber > 1;

  // Show loading state while scene data is being fetched from database
  if (sceneLoading || !sceneData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          {sceneLoading ? (
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
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen overflow-hidden relative"
      style={{
        backgroundImage: state.instance?.branding_config.background_image_url || 'url(https://i.ibb.co/BH6c7SRj/Splas.jpg)',
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
            {/* Left Column - Vitals Monitor - Hidden for Scene 9 */}
            {currentSceneNumber !== 9 && (
              <div className="flex items-stretch order-last xl:order-first h-full xl:col-span-3">
                <VitalsMonitor vitalsData={sceneData.vitals} className="h-full" sceneId={sceneId} />
              </div>
            )}

            {/* Main Content Area - Full width for Scene 9, consistent for all other scenes */}
            <div className={`flex flex-col space-y-1 overflow-hidden h-full min-h-0 ${
              currentSceneNumber === 9 ? 'xl:col-span-12' : 'xl:col-span-9'
            }`}>
              {/* Scene Header - Compact */}
              <div className="flex-shrink-0 p-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20">
                <div className="flex items-center justify-between mb-1">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                    {sceneData.title}
                  </h1>
                  <div className="flex items-center gap-2">
                    {/* Scene 9 Action Buttons */}
                    {currentSceneNumber === 9 && (
                      <div className="flex items-center gap-2 mr-3">
                        <button
                          onClick={() => {
                            dispatch({ type: 'RESET_SIMULATION' });
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
                            navigator.clipboard.writeText(JSON.stringify(results, null, 2));
                            alert('Results copied to clipboard!');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-xs
                                   hover:from-green-400 hover:to-emerald-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Share2 className="w-3 h-3" />
                          Share Results
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{currentSceneNumber} of {state.userData.totalScenes}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-100 text-sm leading-relaxed">{sceneData.description}</p>
              </div>

              {/* Content Grid - Scene 4 gets different proportions for SBAR expansion */}
              <div className={`flex-1 overflow-hidden grid grid-cols-1 gap-2 min-h-0 max-h-full transition-all duration-700 ease-in-out ${
                currentSceneNumber === 4 ? 'lg:grid-cols-7' : 'lg:grid-cols-5'
              }`}>
                {/* Video and Audio Section - Hidden for Scene 9, expanded for Scene 4 */}
                {currentSceneNumber !== 9 && (
                  <div className={`flex flex-col space-y-2 h-full min-h-0 overflow-hidden transition-all duration-700 ease-in-out ${
                    currentSceneNumber === 4 ? 'lg:col-span-4' : 'lg:col-span-3'
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
                            onLoad={() => {
                              console.log('Iframe loaded successfully');
                            }}
                          />
                        ) : currentSceneNumber === 8 ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                            <div className="text-center text-white p-8">
                              <h3 className="text-xl font-semibold mb-4">Interactive Quiz</h3>
                              <p className="text-gray-300">Complete the quiz below to proceed</p>
                            </div>
                          </div>
                        ) : videoData?.video_url || sceneData.videoUrl ? (
                          <VideoPlayer
                            videoUrl={videoData.video_url || sceneData.videoUrl}
                            posterUrl={videoData.poster_url || sceneData.posterUrl}
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
                  <div className={`flex flex-col space-y-2 h-full min-h-0 overflow-hidden transition-all duration-700 ease-in-out ${
                    currentSceneNumber === 4 ? 'lg:col-span-3' : 'lg:col-span-2'
                  }`}>
                    {/* Quiz Component */}
                    {sceneData.quiz && sceneData.quiz.questions && sceneData.quiz.questions.length > 0 && (
                      <div className="flex-1 min-h-0">
                        <QuizComponent
                          questions={sceneData.quiz.questions}
                          onQuizComplete={(responses) => {
                            setSceneResponses(responses);
                            setAllQuestionsSubmitted(responses.every(r => r.answer !== ''));
                          }}
                          sceneId={sceneId}
                          className="h-full"
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
                          onSBARComplete={(sbarData) => {
                            console.log('SBAR completed:', sbarData);
                          }}
                          className="bg-white/10 backdrop-blur-xl border border-white/20 h-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls - Fixed at bottom */}
        <div className="flex-shrink-0 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePreviousScene}
                disabled={!canGoPrevious}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  canGoPrevious
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
              <button
                onClick={handleCompleteScene}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <CheckCircle className="w-4 h-4" />
                Complete Scene
              </button>
              
              <button
                onClick={handleNextScene}
                disabled={!canGoNext}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  canGoNext
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