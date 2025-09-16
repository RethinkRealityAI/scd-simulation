import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, Sparkles, MessageCircle, Check, ChevronRight, Clipboard, Users, Activity } from 'lucide-react';
import SBARWordBank from './SBARWordBank';
import { scenes } from '../data/scenesData';

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'text-input' | 'multi-select';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface ActionPrompt {
  type: 'action-selection' | 'sbar' | 'multi-select' | 'reflection';
  title: string;
  content: string;
  options?: string[];
  correctAnswers?: string[];
  explanation?: string;
}

interface QuizComponentProps {
  quiz?: Quiz;
  actionPrompt?: ActionPrompt;
  onAnswered: (responses: Array<{ questionId: string; answer: string; isCorrect: boolean }>) => void;
  onContinueToDiscussion: () => void;
  onCompleteScene: () => void;
  sceneId: string;
  discussionPrompts?: string[];
  showDiscussion: boolean;
  isSceneCompleted: boolean;
  canComplete: boolean;
  sceneResponses: Array<{ questionId: string; answer: string; isCorrect: boolean }>;
  allQuestionsSubmitted: boolean;
  hasInteractiveOptions: boolean;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ 
  quiz, 
  actionPrompt,
  onAnswered,
  onContinueToDiscussion,
  onCompleteScene,
  sceneId, 
  discussionPrompts,
  showDiscussion,
  isSceneCompleted,
  canComplete,
  sceneResponses,
  allQuestionsSubmitted,
  hasInteractiveOptions
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>(() => {
    // Initialize with existing responses if available
    const initialAnswers: Record<string, string | string[]> = {};
    sceneResponses.forEach(response => {
      initialAnswers[response.questionId] = response.answer;
    });
    return initialAnswers;
  });
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>(() => {
    // Initialize feedback state based on existing responses
    const initialFeedback: Record<string, boolean> = {};
    sceneResponses.forEach(response => {
      initialFeedback[response.questionId] = true;
    });
    return initialFeedback;
  });
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  // Handle action prompt responses
  const [actionResponse, setActionResponse] = useState<string | string[]>('');
  const [actionSubmitted, setActionSubmitted] = useState(false);
  const [shouldShowCompleteButton, setShouldShowCompleteButton] = useState(false);

  const hasContent = quiz || actionPrompt;
  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const isLastQuestion = quiz ? currentQuestionIndex === quiz.questions.length - 1 : true;

  // Determine if scene has discussion prompts
  const hasDiscussionPrompts = discussionPrompts && discussionPrompts.length > 0;

  // Check if this is an informational scene (no quiz or action prompt) - but not completion scene
  const isInformationalScene = !quiz && !actionPrompt && sceneId !== '10';

  // Initialize action submitted state based on existing responses
  useEffect(() => {
    console.log('QuizComponent useEffect - sceneId:', sceneId, 'sceneResponses:', sceneResponses, 'showDiscussion:', showDiscussion);
    
    // Reset action state when showDiscussion changes back to false (scene reset)
    if (!showDiscussion) {
      const existingActionResponse = sceneResponses.find(r => r.questionId === `action_${sceneId}`);
      if (existingActionResponse) {
        setActionSubmitted(true);
        setActionResponse(existingActionResponse.answer);
        console.log('Found existing action response:', existingActionResponse);
      } else {
        setActionSubmitted(false);
        setActionResponse('');
        console.log('No existing action response found');
      }
    }
    
    // Check if all quiz questions are answered
    if (quiz && quiz.questions.length > 0) {
      const allAnswered = quiz.questions.every(q => 
        sceneResponses.some(r => r.questionId === q.id)
      );
      setAllQuestionsAnswered(allAnswered);
      console.log('Quiz questions all answered:', allAnswered);
    }
    
    // For informational scenes (no quiz or action prompt), show complete button immediately if not completed
    if (isInformationalScene && !isSceneCompleted) {
      setShouldShowCompleteButton(true);
      console.log('Informational scene - showing complete button');
    }
  }, [sceneResponses, sceneId, isSceneCompleted, quiz, isInformationalScene, showDiscussion]);

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // Handle multi-select answers
  const handleMultiSelect = (questionId: string, option: string) => {
    setUserAnswers(prev => {
      const current = prev[questionId] as string[] || [];
      const updated = current.includes(option) 
        ? current.filter(item => item !== option)
        : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  };

  // Handle action prompt submission
  const handleActionSubmit = () => {
    if (actionPrompt?.type === 'multi-select') {
      if (!Array.isArray(actionResponse) || actionResponse.length === 0) return;
      
      setActionSubmitted(true);
      const isCorrect = actionPrompt.correctAnswers ? 
        actionResponse.every(ans => actionPrompt.correctAnswers!.includes(ans)) &&
        actionPrompt.correctAnswers.every(ans => actionResponse.includes(ans)) : true;
      
      const response = {
        questionId: `action_${sceneId}`,
        answer: Array.isArray(actionResponse) ? actionResponse.join(', ') : actionResponse,
        isCorrect
      };
      onAnswered([response]);
      console.log('Action submitted for scene', sceneId, 'hasDiscussionPrompts:', hasDiscussionPrompts, 'isSceneCompleted:', isSceneCompleted);
      // Only show complete button if scene is not already completed
      if (!isSceneCompleted) {
        setShouldShowCompleteButton(true);
      }
    } else if (actionPrompt?.type === 'reflection') {
      if (typeof actionResponse !== 'string' || actionResponse.trim() === '') return;
      
      setActionSubmitted(true);
      const response = {
        questionId: `action_${sceneId}`,
        answer: actionResponse as string,
        isCorrect: true // Reflection is always considered correct when completed
      };
      onAnswered([response]);
      console.log('Action submitted for scene', sceneId, 'hasDiscussionPrompts:', hasDiscussionPrompts, 'isSceneCompleted:', isSceneCompleted);
      // Only show complete button if scene is not already completed
      if (!isSceneCompleted) {
        setShouldShowCompleteButton(true);
      }
    } else {
      if (!actionResponse) return;
      
      setActionSubmitted(true);
      const isCorrect = actionPrompt?.correctAnswers ? 
        actionPrompt.correctAnswers.includes(actionResponse as string) : true;
      
      const response = {
        questionId: `action_${sceneId}`,
        answer: actionResponse as string,
        isCorrect
      };
      onAnswered([response]);
      console.log('Action submitted for scene', sceneId, 'hasDiscussionPrompts:', hasDiscussionPrompts, 'isSceneCompleted:', isSceneCompleted);
      // Only show complete button if scene is not already completed
      if (!isSceneCompleted) {
        setShouldShowCompleteButton(true);
      }
    }
  };

  // Handle answer submission with feedback display
  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;
    const userAnswer = userAnswers[currentQuestion.id];
    if (!userAnswer) return;

    // Show feedback for current question
    setShowFeedback(prev => ({ ...prev, [currentQuestion.id]: true }));

    // Immediately check if this completes all questions
    if (isLastQuestion) {
      // All questions answered, mark as submitted
      const responses = quiz!.questions.map(q => ({
        questionId: q.id,
        answer: Array.isArray(userAnswers[q.id]) ? 
          (userAnswers[q.id] as string[]).join(', ') : 
          userAnswers[q.id] as string || '',
        isCorrect: Array.isArray(q.correctAnswer) ?
          Array.isArray(userAnswers[q.id]) && 
          (userAnswers[q.id] as string[]).every(ans => (q.correctAnswer as string[]).includes(ans)) &&
          (q.correctAnswer as string[]).every(ans => (userAnswers[q.id] as string[]).includes(ans)) :
          userAnswers[q.id] === q.correctAnswer,
      }));
      onAnswered(responses);
      setAllQuestionsAnswered(true);
      // Only show complete button if scene is not already completed
      if (!isSceneCompleted) {
        setShouldShowCompleteButton(true);
      }
    } else {
      // Move to next question after a brief delay to show feedback
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 1500);
    }
  };

  const getHeaderIcon = () => {
    if (actionPrompt) {
      switch (actionPrompt.type) {
        case 'action-selection': return Activity;
        case 'sbar': return Clipboard;
        case 'multi-select': return Users;
        case 'reflection': return MessageCircle;
        default: return Activity;
      }
    }
    return CheckCircle;
  };

  const HeaderIcon = getHeaderIcon();

  const getHeaderTitle = () => {
    if (actionPrompt) {
      switch (actionPrompt.type) {
        case 'action-selection': return 'Select Action';
        case 'sbar': return 'Conduct SBAR';
        case 'multi-select': return 'Select Interventions';
        case 'reflection': return 'Reflection';
        default: return 'Action Required';
      }
    }
    return 'Clinical Assessment';
  };

  // Show discussion prompts when showDiscussion is true
  if (showDiscussion && discussionPrompts) {
    return (
      <div className="p-3 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
          <MessageCircle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-white">Discussion Points</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 mb-3">
          {discussionPrompts.map((prompt, index) => (
            <div key={index} className="p-3 rounded-lg bg-slate-800/40 border-l-4 border-cyan-400 shadow-lg">
              <p className="text-gray-100 text-sm leading-relaxed">{prompt}</p>
            </div>
          ))}
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={onCompleteScene}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm
                     hover:from-green-400 hover:to-emerald-400 transition-all duration-200 
                     flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Check className="w-3 h-3" />
            Complete {(() => {
              const sceneNumber = parseInt(sceneId);
              const scene = scenes[sceneNumber - 1];
              return scene?.title?.replace(/^Scene \d+:\s*/, '') || `Scene ${sceneNumber}`;
            })()}
          </button>
        </div>
      </div>
    );
  }

  // For informational scenes (no quiz or action prompt), show Complete Scene button immediately
  if (isInformationalScene) {
    return (
      <div className="p-3 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 h-full flex flex-col items-center justify-center">
        <div className="text-center mb-4">
          <CheckCircle className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white">Interactive Content</h3>
          <p className="text-gray-300 text-xs">Review the content and proceed when ready</p>
        </div>
        
        <button
          onClick={onCompleteScene}
          className="py-2 px-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm
                   hover:from-green-400 hover:to-emerald-400 transition-all duration-200 
                   flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Check className="w-3 h-3" />
          Complete {(() => {
            const sceneNumber = parseInt(sceneId);
            const scene = scenes[sceneNumber - 1];
            return scene?.title || `Scene ${sceneNumber}`;
          })()}
        </button>
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="p-3 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 h-full flex items-center justify-center">
        <p className="text-gray-300 text-sm">No assessment content available for this scene.</p>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 h-full flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <HeaderIcon className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-white">
            {getHeaderTitle()}
          </h3>
        </div>
        {quiz && (
          <div className="text-sm text-gray-300">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
        )}
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {/* Action Prompt Content */}
        {actionPrompt && !actionSubmitted && (
          <div className="space-y-3">
            {/* Interactive SBAR Component */}
            {actionPrompt.type === 'sbar' ? (
              <SBARWordBank
                onComplete={(responses) => {
                  // Convert SBAR responses to single response format
                  const sbarResponse = Object.entries(responses)
                    .map(([category, items]) => `${category.toUpperCase()}: ${items.join(', ')}`)
                    .join('\n');
                  
                  const response = {
                    questionId: `action_${sceneId}`,
                    answer: sbarResponse,
                    isCorrect: true
                  };
                  onAnswered([response]);
                  setActionSubmitted(true);
                  // Only show complete button if scene is not already completed
                  if (!isSceneCompleted) {
                    setShouldShowCompleteButton(true);
                  }
                }}
                onSubmit={() => {
                  setActionSubmitted(true);
                }}
                isCompleted={actionSubmitted}
              />
            ) : (
              <>
                <h4 className="text-base font-medium text-white leading-relaxed">
                  {actionPrompt.title}
                </h4>
                <p className="text-sm text-gray-200 leading-relaxed">
                  {actionPrompt.content}
                </p>
              </>
            )}

            {/* Multi-select Options */}
            {actionPrompt.type === 'multi-select' && actionPrompt.options && (
              <div className="space-y-2">
                {actionPrompt.options.map((option, index) => {
                  const isSelected = Array.isArray(actionResponse) && actionResponse.includes(option);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        const current = Array.isArray(actionResponse) ? actionResponse : [];
                        const updated = current.includes(option) 
                          ? current.filter(item => item !== option)
                          : [...current, option];
                        setActionResponse(updated);
                      }}
                      className={`w-full p-3 text-left rounded-lg border transition-all duration-200 text-sm ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100'
                          : 'bg-slate-700/30 border-slate-600 text-gray-200 hover:bg-slate-600/40 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border transition-all ${
                          isSelected ? 'bg-cyan-400 border-cyan-400' : 'border-slate-500'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-slate-900" />}
                        </div>
                        <span className="leading-relaxed">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Single Select Options */}
            {actionPrompt.type === 'action-selection' && actionPrompt.options && (
              <div className="space-y-2">
                {actionPrompt.options.map((option, index) => {
                  const isSelected = actionResponse === option;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setActionResponse(option)}
                      className={`w-full p-3 text-left rounded-lg border transition-all duration-200 text-sm ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100'
                          : 'bg-slate-700/30 border-slate-600 text-gray-200 hover:bg-slate-600/40 hover:border-slate-500'
                      }`}
                    >
                      <span className="leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Reflection Text Area */}
            {actionPrompt.type === 'reflection' && (
              <textarea
                value={actionResponse as string}
                onChange={(e) => setActionResponse(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-600 text-white text-sm
                         focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none"
                rows={4}
                placeholder="Share your thoughts and reflections..."
              />
            )}
          </div>
        )}

        {/* Action Feedback */}
        {actionPrompt && actionSubmitted && actionPrompt.explanation && (
          <div className="p-3 rounded-lg border-l-4 bg-green-500/20 border-green-400 shadow-lg shadow-green-500/20 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3 h-3 text-green-400" />
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="font-bold text-sm text-green-400">Completed!</span>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-white font-medium mb-1 text-xs">Summary:</p>
              <p className="text-gray-200 leading-relaxed text-xs">{actionPrompt.explanation}</p>
            </div>
          </div>
        )}

        {/* Quiz Questions */}
        {quiz && currentQuestion && (
          <>
            <h4 className="text-sm font-medium text-white leading-relaxed">
              {currentQuestion.question}
            </h4>

            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = userAnswers[currentQuestion.id] === option;
                  const isCorrectOption = option === currentQuestion.correctAnswer;
                  const showCurrentFeedback = showFeedback[currentQuestion.id];
                  
                  let buttonClass = "w-full p-2 text-left rounded-lg border transition-all duration-200 text-xs ";
                  
                  if (showCurrentFeedback) {
                    if (isCorrectOption) {
                      buttonClass += "bg-green-500/20 border-green-400 text-green-100";
                    } else if (isSelected && !isCorrectOption) {
                      buttonClass += "bg-red-500/20 border-red-400 text-red-100";
                    } else {
                      buttonClass += "bg-slate-700/30 border-slate-600 text-gray-400";
                    }
                  } else {
                    if (isSelected) {
                      buttonClass += "bg-cyan-500/20 border-cyan-400 text-cyan-100";
                    } else {
                      buttonClass += "bg-slate-700/30 border-slate-600 text-gray-200 hover:bg-slate-600/40 hover:border-slate-500";
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => !showCurrentFeedback && handleAnswerSelect(currentQuestion.id, option)}
                      disabled={showCurrentFeedback}
                      className={buttonClass}
                    >
                      <div className="flex items-center justify-between">
                        <span className="leading-relaxed">{option}</span>
                        {showCurrentFeedback && isCorrectOption && (
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-green-400" />
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          </div>
                        )}
                        {showCurrentFeedback && isSelected && !isCorrectOption && (
                          <XCircle className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'multi-select' && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = Array.isArray(userAnswers[currentQuestion.id]) && 
                    (userAnswers[currentQuestion.id] as string[]).includes(option);
                  const showCurrentFeedback = showFeedback[currentQuestion.id];
                  const isCorrectOption = Array.isArray(currentQuestion.correctAnswer) && 
                    (currentQuestion.correctAnswer as string[]).includes(option);
                  
                  let buttonClass = "w-full p-2 text-left rounded-lg border transition-all duration-200 text-xs ";
                  
                  if (showCurrentFeedback) {
                    if (isCorrectOption) {
                      buttonClass += "bg-green-500/20 border-green-400 text-green-100";
                    } else if (isSelected && !isCorrectOption) {
                      buttonClass += "bg-red-500/20 border-red-400 text-red-100";
                    } else {
                      buttonClass += "bg-slate-700/30 border-slate-600 text-gray-400";
                    }
                  } else {
                    if (isSelected) {
                      buttonClass += "bg-cyan-500/20 border-cyan-400 text-cyan-100";
                    } else {
                      buttonClass += "bg-slate-700/30 border-slate-600 text-gray-200 hover:bg-slate-600/40 hover:border-slate-500";
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => !showCurrentFeedback && handleMultiSelect(currentQuestion.id, option)}
                      disabled={showCurrentFeedback}
                      className={buttonClass}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded border transition-all ${
                            isSelected ? 'bg-cyan-400 border-cyan-400' : 'border-slate-500'
                          }`}>
                            {isSelected && <Check className="w-2 h-2 text-slate-900" />}
                          </div>
                          <span className="leading-relaxed">{option}</span>
                        </div>
                        {showCurrentFeedback && isCorrectOption && (
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-green-400" />
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          </div>
                        )}
                        {showCurrentFeedback && isSelected && !isCorrectOption && (
                          <XCircle className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quiz Feedback Section */}
            {quiz && currentQuestion && showFeedback[currentQuestion.id] && (
              <div className={`p-3 rounded-lg border-l-4 animate-fade-in ${
                Array.isArray(currentQuestion.correctAnswer) ?
                  (Array.isArray(userAnswers[currentQuestion.id]) && 
                   (userAnswers[currentQuestion.id] as string[]).every(ans => (currentQuestion.correctAnswer as string[]).includes(ans)) &&
                   (currentQuestion.correctAnswer as string[]).every(ans => (userAnswers[currentQuestion.id] as string[]).includes(ans)))
                  : userAnswers[currentQuestion.id] === currentQuestion.correctAnswer
                  ? 'bg-green-500/20 border-green-400 shadow-lg shadow-green-500/20' 
                  : 'bg-red-500/20 border-red-400 shadow-lg shadow-red-500/20'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {(Array.isArray(currentQuestion.correctAnswer) ?
                    (Array.isArray(userAnswers[currentQuestion.id]) && 
                     (userAnswers[currentQuestion.id] as string[]).every(ans => (currentQuestion.correctAnswer as string[]).includes(ans)) &&
                     (currentQuestion.correctAnswer as string[]).every(ans => (userAnswers[currentQuestion.id] as string[]).includes(ans)))
                    : userAnswers[currentQuestion.id] === currentQuestion.correctAnswer) ? (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-green-400" />
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`font-bold text-sm ${
                    (Array.isArray(currentQuestion.correctAnswer) ?
                      (Array.isArray(userAnswers[currentQuestion.id]) && 
                       (userAnswers[currentQuestion.id] as string[]).every(ans => (currentQuestion.correctAnswer as string[]).includes(ans)) &&
                       (currentQuestion.correctAnswer as string[]).every(ans => (userAnswers[currentQuestion.id] as string[]).includes(ans)))
                      : userAnswers[currentQuestion.id] === currentQuestion.correctAnswer) 
                      ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(Array.isArray(currentQuestion.correctAnswer) ?
                      (Array.isArray(userAnswers[currentQuestion.id]) && 
                       (userAnswers[currentQuestion.id] as string[]).every(ans => (currentQuestion.correctAnswer as string[]).includes(ans)) &&
                       (currentQuestion.correctAnswer as string[]).every(ans => (userAnswers[currentQuestion.id] as string[]).includes(ans)))
                      : userAnswers[currentQuestion.id] === currentQuestion.correctAnswer) ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-white font-medium mb-1 text-xs">Explanation:</p>
                  <p className="text-gray-200 leading-relaxed text-xs">{currentQuestion.explanation}</p>
                  {!(Array.isArray(currentQuestion.correctAnswer) ?
                    (Array.isArray(userAnswers[currentQuestion.id]) && 
                     (userAnswers[currentQuestion.id] as string[]).every(ans => (currentQuestion.correctAnswer as string[]).includes(ans)) &&
                     (currentQuestion.correctAnswer as string[]).every(ans => (userAnswers[currentQuestion.id] as string[]).includes(ans)))
                    : userAnswers[currentQuestion.id] === currentQuestion.correctAnswer) && (
                    <div className="mt-2 p-2 rounded bg-green-500/10 border border-green-400/20">
                      <p className="text-green-300 text-xs font-medium">Correct Answer:</p>
                      <p className="text-green-200 text-xs">
                        {Array.isArray(currentQuestion.correctAnswer) 
                          ? currentQuestion.correctAnswer.join(', ')
                          : currentQuestion.correctAnswer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Fixed bottom section */}
      <div className="flex-shrink-0 space-y-2">
        {/* Action Submit Button */}
        {actionPrompt && !actionSubmitted && actionPrompt.type !== 'sbar' && (
          <button
            onClick={handleActionSubmit}
            disabled={
              actionPrompt.type === 'multi-select'
                ? !Array.isArray(actionResponse) || actionResponse.length === 0
                : actionPrompt.type === 'reflection'
                ? typeof actionResponse !== 'string' || actionResponse.trim() === ''
                : !actionResponse
            }
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm
                     disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:opacity-50
                     enabled:hover:from-cyan-400 enabled:hover:to-blue-400 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Submit
            <ArrowRight className="w-3 h-3" />
          </button>
        )}

        {/* Quiz Submit Button */}
        {quiz && currentQuestion && !showFeedback[currentQuestion.id] && userAnswers[currentQuestion.id] && (
          <button
            onClick={handleSubmitAnswer}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm
                     hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Submit Answer
            <ArrowRight className="w-3 h-3" />
          </button>
        )}

        {/* Continue to Discussion Button - only appears if there are discussion prompts */}
        {hasDiscussionPrompts && (allQuestionsSubmitted || actionSubmitted) && !showDiscussion && !isSceneCompleted && (
          <button
            onClick={onContinueToDiscussion}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold text-sm
                     hover:from-purple-400 hover:to-indigo-400 transition-all duration-200 
                     flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Continue to Discussion
            <ChevronRight className="w-3 h-3" />
          </button>
        )}

        {/* Complete Scene Button - shows when appropriate */}
        {!isSceneCompleted && shouldShowCompleteButton && (
          <>
            {/* For scenes WITHOUT discussion prompts - show after assessment */}
            {!hasDiscussionPrompts && (allQuestionsSubmitted || actionSubmitted || allQuestionsAnswered) && (
              <button
                onClick={onCompleteScene}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm
                         hover:from-green-400 hover:to-emerald-400 transition-all duration-200 
                         flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Check className="w-3 h-3" />
                Complete {(() => {
                  const sceneNumber = parseInt(sceneId);
                  const scene = scenes[sceneNumber - 1];
                  return scene?.title?.replace(/^Scene \d+:\s*/, '') || `Scene ${sceneNumber}`;
                })()}
              </button>
            )}
            
            {/* For scenes WITH discussion prompts - show after discussion is displayed */}
            {hasDiscussionPrompts && showDiscussion && (
              <button
                onClick={onCompleteScene}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm
                         hover:from-green-400 hover:to-emerald-400 transition-all duration-200 
                         flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Check className="w-3 h-3" />
                Complete {(() => {
                  const sceneNumber = parseInt(sceneId);
                  const scene = scenes[sceneNumber - 1];
                  return scene?.title?.replace(/^Scene \d+:\s*/, '') || `Scene ${sceneNumber}`;
                })()}
              </button>
            )}
          </>
        )}

        {/* Scene Already Completed State */}
        {isSceneCompleted && (
          <div className="w-full py-2 px-3 rounded-lg bg-green-500/20 border border-green-400 text-green-100 font-semibold text-sm
                        flex items-center justify-center gap-2">
            <CheckCircle className="w-3 h-3" />
            Scene Completed
          </div>
        )}

        {/* Question Progress */}
        {quiz && (
          <div className="flex gap-0.5">
            {quiz.questions.map((_, index) => (
              <div
                key={index}
                className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                  index < currentQuestionIndex ? 'bg-green-400' :
                  index === currentQuestionIndex ? 'bg-cyan-400' :
                  'bg-slate-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;