import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import VitalsMonitor from './VitalsMonitor';
import QuizComponent from './QuizComponent';
import { SceneData } from '../data/scenesData';

interface ScenePreviewProps {
  sceneData: SceneData;
  onClose: () => void;
}

const ScenePreview: React.FC<ScenePreviewProps> = ({ sceneData, onClose }) => {
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [sceneResponses, setSceneResponses] = useState<Array<{ questionId: string; answer: string; isCorrect: boolean }>>([]);
  const [allQuestionsSubmitted, setAllQuestionsSubmitted] = useState(false);
  const [isSceneCompleted, setIsSceneCompleted] = useState(false);

  const handleQuizAnswered = (responses: Array<{ questionId: string; answer: string; isCorrect: boolean }>) => {
    setSceneResponses(responses);
    setAllQuestionsSubmitted(true);
  };

  const handleContinueToDiscussion = () => {
    setShowDiscussion(true);
  };

  const handleCompleteScene = () => {
    setIsSceneCompleted(true);
  };

  const hasInteractiveOptions = !!(
    (sceneData.quiz && sceneData.quiz.questions.length > 0) ||
    (sceneData.actionPrompt && (
      sceneData.actionPrompt.options || 
      sceneData.actionPrompt.type === 'sbar' || 
      sceneData.actionPrompt.type === 'reflection' ||
      sceneData.actionPrompt.type === 'multi-select'
    ))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://i.ibb.co/BH6c7SRj/Splas.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Preview Banner */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-semibold text-sm">PREVIEW MODE - Test the scene flow as learners will experience it</span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X className="w-4 h-4" />
          <span className="text-sm font-medium">Close Preview</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col pt-12">
        {/* Scene Content */}
        <div className="flex-1 overflow-hidden px-4 pb-4 pt-2">
          <div className="h-full grid grid-cols-1 xl:grid-cols-12 gap-2">
            {/* Left Column - Vitals Monitor */}
            {sceneData.id !== '9' && (
              <div className="flex items-stretch order-last xl:order-first h-full xl:col-span-3">
                <VitalsMonitor vitalsData={sceneData.vitals} className="h-full" sceneId={sceneData.id} />
              </div>
            )}

            {/* Main Content Area */}
            <div className={`flex flex-col space-y-1 overflow-hidden h-full min-h-0 ${
              sceneData.id === '9' ? 'xl:col-span-12' : 'xl:col-span-9'
            }`}>
              {/* Scene Header */}
              <div className="flex-shrink-0 p-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20">
                <div className="flex items-center justify-between mb-1">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                    {sceneData.title}
                  </h1>
                </div>
                <p className="text-gray-100 text-sm leading-relaxed">{sceneData.description}</p>
              </div>

              {/* Content Grid */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 gap-2 min-h-0 max-h-full lg:grid-cols-5">
                {/* Content Section */}
                {sceneData.id !== '9' && (
                  <div className="flex flex-col space-y-2 h-full min-h-0 overflow-hidden lg:col-span-3">
                    {/* Video Placeholder */}
                    <div className="rounded-lg overflow-hidden bg-black/50 backdrop-blur-xl border border-white/20 flex-1 min-h-0 flex items-center justify-center">
                      <div className="text-white text-center p-8">
                        <div className="text-6xl mb-4">🎬</div>
                        <p className="text-lg font-semibold mb-2">Video Content Area</p>
                        <p className="text-sm text-gray-300">This is where the scene video/interactive content would appear</p>
                      </div>
                    </div>

                    {/* Clinical Findings */}
                    {sceneData.clinicalFindings && sceneData.clinicalFindings.length > 0 && (
                      <div className="rounded-lg bg-white/5 backdrop-blur-xl border border-white/20 p-3">
                        <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          Clinical Findings
                        </h4>
                        <div className="space-y-1">
                          {sceneData.clinicalFindings.map((finding, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-gray-200">
                              <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                              <span>{finding}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz/Action Section */}
                {(sceneData.quiz || sceneData.actionPrompt) && (
                  <div className={`h-full min-h-0 max-h-full overflow-hidden ${
                    sceneData.id === '9' ? 'lg:col-span-5' : 'lg:col-span-2'
                  }`}>
                    <QuizComponent
                      quiz={sceneData.quiz}
                      actionPrompt={sceneData.actionPrompt}
                      onAnswered={handleQuizAnswered}
                      onContinueToDiscussion={handleContinueToDiscussion}
                      onCompleteScene={handleCompleteScene}
                      sceneId={sceneData.id}
                      discussionPrompts={sceneData.discussionPrompts}
                      showDiscussion={showDiscussion}
                      isSceneCompleted={isSceneCompleted}
                      canComplete={sceneResponses.length > 0 || !hasInteractiveOptions}
                      sceneResponses={sceneResponses}
                      allQuestionsSubmitted={allQuestionsSubmitted}
                      hasInteractiveOptions={hasInteractiveOptions}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Completion Message */}
        {isSceneCompleted && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md mx-4 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-white mb-2">Scene Completed!</h2>
              <p className="text-gray-300 mb-6">
                In the actual simulation, the learner would now proceed to the next scene or view results.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold
                         hover:from-green-400 hover:to-emerald-400 transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenePreview;

