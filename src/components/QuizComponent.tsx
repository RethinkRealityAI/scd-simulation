import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, Sparkles, MessageCircle, Check, ChevronRight, Clipboard, Users, Activity, X } from 'lucide-react';
import SBARWordBank from './SBARWordBank';

import ResourceLinks from './ResourceLinks';
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
  type: 'action-selection' | 'multi-select' | 'reflection' | 'sbar';
  title: string;
  content: string;
  options?: string[];
  correctAnswers?: string[];
  explanation?: string;
}

interface QuizComponentProps {
  quiz?: Quiz;
  actionPrompt?: ActionPrompt;
  onAnswered: (responses: Array<{ questionId: string; answer: string; isCorrect: boolean; score?: number }>) => void;
  onContinueToDiscussion: () => void;
  onCompleteScene: () => void;
  sceneId: string;
  discussionPrompts?: string[];
  showDiscussion: boolean;
  isSceneCompleted: boolean;
  sceneResponses: Array<{ questionId: string; answer: string; isCorrect: boolean }>;
  allQuestionsSubmitted: boolean;
  hideCompletionControls?: boolean;
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
  sceneResponses,
  allQuestionsSubmitted,
  hideCompletionControls = false,
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

  const getSelectedActionOptions = (
    response: string | string[],
    prompt?: ActionPrompt,
  ): string[] => {
    if (!prompt?.options) return [];
    if (Array.isArray(response)) return response;
    if (typeof response !== 'string' || response.trim() === '') return [];

    // Reconstruct selections from the known option list instead of splitting
    // on ", " so options that themselves contain commas are restored exactly.
    return prompt.options.filter(option => response.includes(option));
  };

  // Initialize action submitted state based on existing responses
  useEffect(() => {
    // Reset action state when showDiscussion changes back to false (scene reset)
    if (!showDiscussion) {
      const existingActionResponse = sceneResponses.find(r => r.questionId === `action_${sceneId}`);
      if (existingActionResponse) {
        setActionSubmitted(true);
        if (actionPrompt?.type === 'multi-select') {
          setActionResponse(getSelectedActionOptions(existingActionResponse.answer, actionPrompt));
        } else {
          setActionResponse(existingActionResponse.answer);
        }
        // For completed scenes, don't show complete button
        setShouldShowCompleteButton(isSceneCompleted ? false : !hasDiscussionPrompts);
      } else {
        setActionSubmitted(false);
        setActionResponse('');
        setShouldShowCompleteButton(false);
      }
    }

    // Check if all quiz questions are answered
    if (quiz && quiz.questions.length > 0) {
      const allAnswered = quiz.questions.every(q =>
        sceneResponses.some(r => r.questionId === q.id)
      );
      setAllQuestionsAnswered(allAnswered);
    }

    // For informational scenes (no quiz or action prompt), show complete button immediately if not completed
    if (isInformationalScene && !isSceneCompleted) {
      setShouldShowCompleteButton(true);
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
      const isAllCorrectScenario =
        !!actionPrompt.correctAnswers &&
        !!actionPrompt.options &&
        actionPrompt.options.every(opt => actionPrompt.correctAnswers!.includes(opt));
      const partialScore = isAllCorrectScenario && (actionPrompt.options?.length ?? 0) > 0
        ? actionResponse.filter(ans => actionPrompt.correctAnswers!.includes(ans)).length / (actionPrompt.options?.length ?? 1)
        : undefined;
      const isCorrect = actionPrompt.correctAnswers ?
        actionResponse.length === actionPrompt.correctAnswers.length &&
        actionResponse.every(ans => actionPrompt.correctAnswers!.includes(ans)) &&
        actionPrompt.correctAnswers.every(ans => actionResponse.includes(ans)) : true;

      const response = {
        questionId: `action_${sceneId}`,
        answer: Array.isArray(actionResponse) ? actionResponse.join(', ') : actionResponse,
        isCorrect,
        score: partialScore ?? (isCorrect ? 1 : 0),
      };
      onAnswered([response]);
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
        isCorrect: true, // Reflection is always considered correct when completed
        score: 1,
      };
      onAnswered([response]);
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
        isCorrect,
        score: isCorrect ? 1 : 0,
      };
      onAnswered([response]);
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
        score: (Array.isArray(q.correctAnswer) ?
          Array.isArray(userAnswers[q.id]) &&
          (userAnswers[q.id] as string[]).every(ans => (q.correctAnswer as string[]).includes(ans)) &&
          (q.correctAnswer as string[]).every(ans => (userAnswers[q.id] as string[]).includes(ans)) :
          userAnswers[q.id] === q.correctAnswer) ? 1 : 0,
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
      <div className="p-3 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 w-full h-full flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
          <MessageCircle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-white">Discussion Points</h3>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 mb-3">
          {discussionPrompts.map((prompt, index) => (
            <div key={index} className="p-3 rounded-lg bg-slate-800/40 border-l-4 border-cyan-400 shadow-lg">
              <p className="text-gray-100 text-sm leading-relaxed">{prompt}</p>
            </div>
          ))}
        </div>

        {!hideCompletionControls && (
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
        )}
      </div>
    );
  }

  // For informational scenes (no quiz or action prompt), show Complete Scene button immediately
  if (isInformationalScene) {
    return (
      <div className="p-3 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 w-full h-full flex flex-col items-center justify-center min-h-0 overflow-hidden">
        <div className="text-center mb-4">
          <CheckCircle className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white">Interactive Content</h3>
          <p className="text-gray-300 text-xs">Review the content and proceed when ready</p>
        </div>

        {!hideCompletionControls && (
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
        )}
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="p-3 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 w-full h-full flex items-center justify-center min-h-0 overflow-hidden">
        <p className="text-gray-300 text-sm">No assessment content available for this scene.</p>
      </div>
    );
  }

  // For SBAR scenes — render the SBARWordBank directly without the outer wrapper/header
  // This gives the SBAR wizard component full height without clipping
  if (actionPrompt?.type === 'sbar') {
    if (actionSubmitted) {
      // After SBAR is submitted, show the completion state
      return (
        <div className="p-3 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 w-full h-full flex flex-col min-h-0 overflow-hidden">
          {actionPrompt.explanation && (
            <div className="p-3 rounded-lg border-l-4 border-green-400 bg-green-500/20 shadow-lg animate-fade-in mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3 h-3 text-green-400" />
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="font-bold text-sm text-green-400">Completed!</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-white font-medium mb-1 text-xs">Feedback:</p>
                <p className="text-gray-200 leading-relaxed text-xs">{actionPrompt.explanation}</p>
              </div>
            </div>
          )}
          <div className="flex-1" />
          {!hideCompletionControls && shouldShowCompleteButton && !isSceneCompleted && (
            <button
              onClick={hasDiscussionPrompts ? onContinueToDiscussion : onCompleteScene}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm
                       hover:from-green-400 hover:to-emerald-400 transition-all duration-200 
                       flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0"
            >
              <Check className="w-4 h-4" />
              {hasDiscussionPrompts ? 'Continue to Discussion' : `Complete Team Communication`}
            </button>
          )}
        </div>
      );
    }

    // Active SBAR — render SBARWordBank filling the entire container
    return (
      <SBARWordBank
        onComplete={(responses) => {
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
          if (!isSceneCompleted) {
            setShouldShowCompleteButton(true);
          }
        }}
        onSubmit={() => {
          setActionSubmitted(true);
        }}
        isCompleted={actionSubmitted}
      />
    );
  }

  return (
    <div className="p-2.5 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 w-full h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <HeaderIcon className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">
            {getHeaderTitle()}
          </h3>
        </div>
        {quiz && (
          <div className="text-xs text-gray-300">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden mb-2">
        {/* Scene 9 Full-Width Reflection Layout */}
        {sceneId === '9' ? (
          <div className="h-full flex flex-col gap-3 min-h-0">
            {/* Reflection header */}
            <div className="flex-shrink-0 flex items-center gap-2 px-1">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-400 to-purple-500" />
              <h3 className="text-sm font-bold text-white tracking-wide">Debrief &amp; Reflection</h3>
              <span className="text-[10px] text-gray-400 ml-auto">Respond to each prompt below</span>
            </div>

            {/* Prompts area - scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
              {(() => {
                const sceneNumber = parseInt(sceneId);
                const scene = scenes[sceneNumber - 1];
                const prompts = scene?.discussionPrompts && scene.discussionPrompts.length > 0
                  ? scene.discussionPrompts
                  : ['Take a moment to reflect on your experience with this sickle cell crisis simulation.'];

                return prompts.map((prompt, index) => (
                  <div key={index} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    {/* Prompt header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/10 border-b border-white/10">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/40 border border-blue-400/50 flex items-center justify-center text-[10px] font-bold text-blue-200 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-sm text-gray-200 leading-relaxed">{prompt}</p>
                      </div>
                    </div>
                    {/* Response textarea */}
                    <div className="p-3">
                      <textarea
                        placeholder="Share your thoughts and reflections..."
                        className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-600/40 text-white placeholder-gray-500 text-sm leading-relaxed
                                 focus:outline-none focus:ring-1 focus:ring-blue-400/60 focus:border-blue-400/60 resize-none transition-colors"
                        rows={4}
                        onChange={(e) => {
                          const response = {
                            questionId: `discussion_${sceneId}_${index}`,
                            answer: e.target.value,
                            isCorrect: true,
                          };
                          onAnswered([response]);
                        }}
                      />
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Resources — full width */}
            <div className="flex-shrink-0">
              <ResourceLinks />
            </div>

            {/* Complete button — full width, prominent */}
            {!hideCompletionControls && (
              <button
                onClick={onCompleteScene}
                className="flex-shrink-0 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                           bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm
                           hover:from-green-400 hover:to-emerald-400 transition-all duration-200
                           shadow-lg shadow-green-900/30 hover:shadow-xl hover:shadow-green-800/30
                           transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <Check className="w-4 h-4 flex-shrink-0" />
                Complete Debrief &amp; Reflection
              </button>
            )}

          </div>
        ) : (
          <div className="h-full flex flex-col min-h-0">
            {/* Regular Scene Content */}

            {/* Action Prompt Content */}
            {actionPrompt && !actionSubmitted && (
              <div className="h-full flex flex-col min-h-0">
                <div className="flex-shrink-0 space-y-3">
                  <h4 className="text-base font-medium text-white leading-relaxed">
                    {actionPrompt.title}
                  </h4>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {actionPrompt.content}
                  </p>
                </div>

                {/* Multi-select Options */}
                {actionPrompt.type === 'multi-select' && actionPrompt.options && (
                  <div className="mt-3 flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
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
                          className={`w-full p-3 text-left rounded-lg border transition-all duration-200 text-sm ${isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100'
                            : 'bg-slate-700/30 border-slate-600 text-gray-200 hover:bg-slate-600/40 hover:border-slate-500'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border transition-all ${isSelected ? 'bg-cyan-400 border-cyan-400' : 'border-slate-500'
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
                  <div className="mt-3 flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
                    {actionPrompt.options.map((option, index) => {
                      const isSelected = actionResponse === option;

                      return (
                        <button
                          key={index}
                          onClick={() => setActionResponse(option)}
                          className={`w-full p-3 text-left rounded-lg border transition-all duration-200 text-sm ${isSelected
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
                    className="w-full flex-1 min-h-0 mt-3 p-3 rounded-lg bg-slate-800/50 border border-slate-600 text-white text-sm
                         focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none"
                    rows={8}
                    placeholder="Share your thoughts and reflections..."
                  />
                )}
              </div>
            )}

            {/* Action Feedback */}
            {actionPrompt && actionSubmitted && (
              <div>
                {/* Show options with correct/incorrect highlighting after submission */}
                {(actionPrompt.type === 'action-selection' || actionPrompt.type === 'multi-select') && actionPrompt.options && (() => {
                  // "All correct" scenario: every option is a valid answer (e.g. Scene 7, 8)
                  const isAllCorrectScenario =
                    actionPrompt.type === 'multi-select' &&
                    !!actionPrompt.correctAnswers &&
                    actionPrompt.options.every(opt => actionPrompt.correctAnswers!.includes(opt));

                  const selectedOptions: string[] = actionPrompt.type === 'multi-select'
                    ? getSelectedActionOptions(actionResponse, actionPrompt)
                    : [];

                  return (
                    <div className="space-y-2 mb-3">
                      {actionPrompt.options.map((option, index) => {
                        const isCorrectOption = actionPrompt.correctAnswers?.includes(option);
                        const wasSelected = actionPrompt.type === 'multi-select'
                          ? selectedOptions.includes(option)
                          : actionResponse === option;

                        let buttonClass = "w-full p-3 text-left rounded-lg border transition-all duration-200 text-sm pointer-events-none ";

                        if (isAllCorrectScenario) {
                          // All options valid: green = user selected, amber = user missed
                          buttonClass += wasSelected
                            ? "bg-green-500/20 border-green-400 text-green-100"
                            : "bg-amber-500/10 border-amber-400/50 text-amber-200";
                        } else {
                          // Standard scenes: preserve what the user actually selected.
                          // Show their choices, then surface the correct answers separately
                          // in the feedback card below.
                          if (wasSelected) {
                            buttonClass += isCorrectOption
                              ? "bg-green-500/20 border-green-400 text-green-100"
                              : "bg-red-500/20 border-red-400 text-red-100";
                          } else {
                            buttonClass += "bg-slate-700/30 border-slate-600 text-gray-400";
                          }
                        }

                        return (
                          <div key={index} className={buttonClass}>
                            <div className="flex items-center gap-2">
                              {actionPrompt.type === 'multi-select' && (
                                <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${isAllCorrectScenario
                                    ? wasSelected
                                      ? 'bg-green-400 border-green-400'
                                      : 'border-amber-400/60 bg-transparent'
                                    : wasSelected
                                      ? isCorrectOption
                                        ? 'bg-green-400 border-green-400'
                                        : 'bg-red-400 border-red-400'
                                      : 'border-slate-500 bg-transparent'
                                  }`}>
                                  {isAllCorrectScenario
                                    ? wasSelected && <Check className="w-3 h-3 text-slate-900" />
                                    : wasSelected && <Check className="w-3 h-3 text-slate-900" />}
                                </div>
                              )}
                              <span className="leading-relaxed flex-1">{option}</span>
                              {/* Right-side icon */}
                              {isAllCorrectScenario ? (
                                wasSelected
                                  ? <CheckCircle className="w-4 h-4 text-green-400 ml-auto flex-shrink-0" />
                                  : <span className="text-[10px] text-amber-400/80 ml-auto flex-shrink-0 font-medium">also correct</span>
                              ) : (
                                <>
                                  {wasSelected && isCorrectOption && <CheckCircle className="w-4 h-4 text-green-400 ml-auto flex-shrink-0" />}
                                  {wasSelected && !isCorrectOption && <X className="w-4 h-4 text-red-400 ml-auto flex-shrink-0" />}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Feedback message */}
                {actionPrompt.explanation && (() => {
                  if (actionPrompt.type === 'reflection') {
                    return (
                      <div className="p-3 rounded-lg border-l-4 shadow-lg animate-fade-in bg-green-500/20 border-green-400 shadow-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-3 h-3 text-green-400" />
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="font-bold text-sm text-green-400">Completed!</span>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-white font-medium mb-1 text-xs">Feedback:</p>
                          <p className="text-gray-200 leading-relaxed text-xs">{actionPrompt.explanation}</p>
                        </div>
                      </div>
                    );
                  }

                  // "All correct" scenario: graduated feedback based on selection count
                  const isAllCorrectScenario =
                    actionPrompt.type === 'multi-select' &&
                    !!actionPrompt.correctAnswers &&
                    !!actionPrompt.options &&
                    actionPrompt.options.every(opt => actionPrompt.correctAnswers!.includes(opt));

                  if (isAllCorrectScenario) {
                    const selectedOptions = getSelectedActionOptions(actionResponse, actionPrompt);
                    const selectedCount = selectedOptions.length;
                    const totalCount = actionPrompt.options!.length;
                    const isPerfect = selectedCount === totalCount;

                    // Graduated label and colour scheme
                    let grade: { label: string; textColor: string; bgClass: string; borderClass: string; shadowClass: string; icon: React.ReactNode };
                    if (isPerfect) {
                      grade = {
                        label: 'Correct!',
                        textColor: 'text-green-400',
                        bgClass: 'bg-green-500/20',
                        borderClass: 'border-green-400',
                        shadowClass: 'shadow-green-500/20',
                        icon: <CheckCircle className="w-4 h-4 text-green-400" />,
                      };
                    } else if (selectedCount >= totalCount * 0.75) {
                      grade = {
                        label: 'Very close!',
                        textColor: 'text-amber-400',
                        bgClass: 'bg-amber-500/15',
                        borderClass: 'border-amber-400',
                        shadowClass: 'shadow-amber-500/20',
                        icon: <CheckCircle className="w-4 h-4 text-amber-400" />,
                      };
                    } else if (selectedCount >= totalCount * 0.5) {
                      grade = {
                        label: 'Close but not quite right',
                        textColor: 'text-amber-400',
                        bgClass: 'bg-amber-500/15',
                        borderClass: 'border-amber-400',
                        shadowClass: 'shadow-amber-500/20',
                        icon: <XCircle className="w-4 h-4 text-amber-400" />,
                      };
                    } else {
                      grade = {
                        label: 'Not quite',
                        textColor: 'text-red-400',
                        bgClass: 'bg-red-500/20',
                        borderClass: 'border-red-400',
                        shadowClass: 'shadow-red-500/20',
                        icon: <XCircle className="w-4 h-4 text-red-400" />,
                      };
                    }

                    return (
                      <div className={`p-3 rounded-lg border-l-4 shadow-lg animate-fade-in ${grade.bgClass} ${grade.borderClass} ${grade.shadowClass}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className={`w-3 h-3 ${grade.textColor}`} />
                          {grade.icon}
                          <span className={`font-bold text-sm ${grade.textColor}`}>{grade.label}</span>
                          {!isPerfect && (
                            <span className="text-xs text-gray-400 ml-1">
                              ({selectedCount}/{totalCount} identified)
                            </span>
                          )}
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-white font-medium mb-1 text-xs">Feedback:</p>
                          <p className="text-gray-200 leading-relaxed text-xs">{actionPrompt.explanation}</p>
                          {!isPerfect && (
                            <div className="mt-2 p-2 rounded bg-green-500/10 border border-green-400/20">
                              <p className="text-green-300 text-xs font-medium">All options are valid interventions.</p>
                              <p className="text-green-200 text-xs mt-0.5">
                                The highlighted options above were also appropriate — select all {totalCount} for a complete response.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Standard single/mixed-correct feedback
                  const selectedOptions = actionPrompt.type === 'multi-select'
                    ? getSelectedActionOptions(actionResponse, actionPrompt)
                    : [];
                  const selectedCorrectCount = actionPrompt.type === 'multi-select'
                    ? selectedOptions.filter(option => actionPrompt.correctAnswers?.includes(option)).length
                    : 0;
                  const isCorrect = actionPrompt.type === 'multi-select'
                    ? Array.isArray(actionPrompt.correctAnswers) &&
                    selectedOptions.length === actionPrompt.correctAnswers.length &&
                    selectedOptions.every(ans => actionPrompt.correctAnswers!.includes(ans)) &&
                    actionPrompt.correctAnswers.every(ans => selectedOptions.includes(ans))
                    : actionPrompt.correctAnswers?.includes(actionResponse as string);
                  const isPartialMultiSelect = actionPrompt.type === 'multi-select' && !isCorrect && selectedCorrectCount > 0;

                  return (
                    <div className={`p-3 rounded-lg border-l-4 shadow-lg animate-fade-in ${isCorrect
                        ? 'bg-green-500/20 border-green-400 shadow-green-500/20'
                        : isPartialMultiSelect
                          ? 'bg-amber-500/15 border-amber-400 shadow-amber-500/20'
                          : 'bg-red-500/20 border-red-400 shadow-red-500/20'
                      }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className={`w-3 h-3 ${isCorrect ? 'text-green-400' : isPartialMultiSelect ? 'text-amber-400' : 'text-red-400'}`} />
                        {isCorrect
                          ? <CheckCircle className="w-4 h-4 text-green-400" />
                          : isPartialMultiSelect
                            ? <CheckCircle className="w-4 h-4 text-amber-400" />
                            : <X className="w-4 h-4 text-red-400" />}
                        <span className={`font-bold text-sm ${isCorrect ? 'text-green-400' : isPartialMultiSelect ? 'text-amber-400' : 'text-red-400'}`}>
                          {isCorrect ? 'Correct!' : isPartialMultiSelect ? 'Close. Almost there.' : 'Incorrect'}
                        </span>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-white font-medium mb-1 text-xs">Feedback:</p>
                        <p className="text-gray-200 leading-relaxed text-xs">{actionPrompt.explanation}</p>
                        {!isCorrect && actionPrompt.correctAnswers && actionPrompt.correctAnswers.length > 0 && (
                          <div className="mt-2 p-2 rounded bg-green-500/10 border border-green-400/20">
                            <p className="text-green-300 text-xs font-medium">Correct Answer{actionPrompt.correctAnswers.length > 1 ? 's' : ''}:</p>
                            <ul className="mt-1 space-y-1 text-green-200 text-xs list-disc list-inside">
                              {actionPrompt.correctAnswers.map((correctAnswer) => (
                                <li key={correctAnswer}>{correctAnswer}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Quiz Questions */}
            {quiz && currentQuestion && (
              <div className="h-full flex flex-col min-h-0">
                <h4 className="text-sm font-medium text-white leading-relaxed">
                  {currentQuestion.question}
                </h4>

                {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                  <div className="mt-3 flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
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
                  <div className="mt-3 flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
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
                              <div className={`w-3 h-3 rounded border transition-all ${isSelected ? 'bg-cyan-400 border-cyan-400' : 'border-slate-500'
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
                  <div className={`mt-3 p-3 rounded-lg border-l-4 animate-fade-in ${(Array.isArray(currentQuestion.correctAnswer) ?
                    (Array.isArray(userAnswers[currentQuestion.id]) &&
                      (userAnswers[currentQuestion.id] as string[]).every(ans => (currentQuestion.correctAnswer as string[]).includes(ans)) &&
                      (currentQuestion.correctAnswer as string[]).every(ans => (userAnswers[currentQuestion.id] as string[]).includes(ans)))
                    : userAnswers[currentQuestion.id] === currentQuestion.correctAnswer)
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
                      <span className={`font-bold text-sm ${(Array.isArray(currentQuestion.correctAnswer) ?
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed bottom section */}
      <div className="flex-shrink-0 space-y-2">
        {/* Action Submit Button */}
        {actionPrompt && !actionSubmitted && (
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
        {!hideCompletionControls && hasDiscussionPrompts && (allQuestionsSubmitted || actionSubmitted) && !showDiscussion && !isSceneCompleted && (
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
        {!hideCompletionControls && !isSceneCompleted && shouldShowCompleteButton && (
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
                className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${index < currentQuestionIndex ? 'bg-green-400' :
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