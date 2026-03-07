import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, Lightbulb, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface SBAROption {
  id: string;
  text: string;
  category: 'situation' | 'background' | 'assessment' | 'recommendation';
  isCorrect: boolean;
}

interface SBARWordBankProps {
  onComplete: (responses: { [key: string]: string[] }) => void;
  onSubmit: () => void;
  isCompleted: boolean;
}

type SBARCategory = 'situation' | 'background' | 'assessment' | 'recommendation';

const SBARWordBank: React.FC<SBARWordBankProps> = ({ onComplete, onSubmit, isCompleted }) => {
  const [activeStep, setActiveStep] = useState<number>(0); // 0=S, 1=B, 2=A, 3=R
  const [selectedOptions, setSelectedOptions] = useState<{
    situation: string[];
    background: string[];
    assessment: string[];
    recommendation: string[];
  }>({
    situation: [],
    background: [],
    assessment: [],
    recommendation: []
  });

  const [showFeedback, setShowFeedback] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [completionStep, setCompletionStep] = useState(0);

  const sbarOptions: SBAROption[] = [
    // Situation — Correct (3) + Distractors (2)
    { id: 's1', text: '15-year-old Tobiloba Johnson', category: 'situation', isCorrect: true },
    { id: 's2', text: 'Sickle cell disease patient', category: 'situation', isCorrect: true },
    { id: 's3', text: 'Severe pain crisis (9/10)', category: 'situation', isCorrect: true },
    { id: 's4', text: 'First-time emergency visit', category: 'situation', isCorrect: false },
    { id: 's5', text: 'Routine follow-up visit', category: 'situation', isCorrect: false },

    // Background — Correct (3) + Distractors (2)
    { id: 'b1', text: 'Known sickle cell disease', category: 'background', isCorrect: true },
    { id: 'b2', text: 'Previous VOC episodes', category: 'background', isCorrect: true },
    { id: 'b3', text: 'Pain started 2 days ago', category: 'background', isCorrect: true },
    { id: 'b4', text: 'No significant medical history', category: 'background', isCorrect: false },
    { id: 'b5', text: 'Recent surgery', category: 'background', isCorrect: false },

    // Assessment — Correct (3) + Distractors (2)
    { id: 'a1', text: 'HR: 128 bpm (elevated)', category: 'assessment', isCorrect: true },
    { id: 'a2', text: 'Pain remains 9/10 after morphine', category: 'assessment', isCorrect: true },
    { id: 'a3', text: 'Appears withdrawn and guarded', category: 'assessment', isCorrect: true },
    { id: 'a4', text: 'Pain completely resolved', category: 'assessment', isCorrect: false },
    { id: 'a5', text: 'Patient appears comfortable', category: 'assessment', isCorrect: false },

    // Recommendation — Correct (3) + Distractors (2)
    { id: 'r1', text: 'Escalate to attending physician', category: 'recommendation', isCorrect: true },
    { id: 'r2', text: 'Consider additional pain management', category: 'recommendation', isCorrect: true },
    { id: 'r3', text: 'Monitor for complications', category: 'recommendation', isCorrect: true },
    { id: 'r4', text: 'Discharge home immediately', category: 'recommendation', isCorrect: false },
    { id: 'r5', text: 'No further action needed', category: 'recommendation', isCorrect: false },
  ];

  const sbarSections = [
    {
      key: 'situation' as SBARCategory,
      letter: 'S',
      title: 'Situation',
      subtitle: 'What is happening right now?',
      description: 'Identify the patient\'s current condition and the reason for this communication.',
      gradient: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-400/50',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      pillBg: 'bg-blue-500',
      hint: '💡 Focus on patient identity, current condition, and reason for communication',
    },
    {
      key: 'background' as SBARCategory,
      letter: 'B',
      title: 'Background',
      subtitle: 'What led to this situation?',
      description: 'Include relevant medical history and the timeline of the current episode.',
      gradient: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-400/50',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      pillBg: 'bg-green-500',
      hint: '💡 Include relevant medical history and timeline of current episode',
    },
    {
      key: 'assessment' as SBARCategory,
      letter: 'A',
      title: 'Assessment',
      subtitle: 'What do you think the problem is?',
      description: 'Report current vital signs, pain level, and clinical observations.',
      gradient: 'from-yellow-500 to-orange-500',
      borderColor: 'border-yellow-400/50',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-400',
      pillBg: 'bg-yellow-500',
      hint: '💡 Current vital signs, pain level, and clinical observations',
    },
    {
      key: 'recommendation' as SBARCategory,
      letter: 'R',
      title: 'Recommendation',
      subtitle: 'What should be done?',
      description: 'Suggest specific actions and priority level for the incoming team.',
      gradient: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-400/50',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      pillBg: 'bg-purple-500',
      hint: '💡 Specific actions needed and urgency level',
    },
  ];

  const currentSection = sbarSections[activeStep];
  const currentCategory = currentSection.key;
  const categoryOptions = sbarOptions.filter(opt => opt.category === currentCategory);

  const handleOptionSelect = (option: SBAROption) => {
    const category = option.category;
    const isAlreadySelected = selectedOptions[category].includes(option.id);

    if (isAlreadySelected) {
      setSelectedOptions(prev => ({
        ...prev,
        [category]: prev[category].filter(id => id !== option.id),
      }));
    } else {
      if (selectedOptions[category].length < 3) {
        setSelectedOptions(prev => ({
          ...prev,
          [category]: [...prev[category], option.id],
        }));
      }
    }
  };

  const handleNext = () => {
    if (activeStep < 3) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setShowFeedback(true);

    const responses: { [key: string]: string[] } = {};
    Object.entries(selectedOptions).forEach(([category, optionIds]) => {
      responses[category] = optionIds.map(id => {
        const option = sbarOptions.find(opt => opt.id === id);
        return option?.text || '';
      });
    });

    onComplete(responses);

    setTimeout(() => {
      setCompletionStep(1);
      setTimeout(() => {
        setCompletionStep(2);
        setTimeout(() => {
          onSubmit();
        }, 1000);
      }, 500);
    }, 1000);
  };

  const handleReset = () => {
    setSelectedOptions({ situation: [], background: [], assessment: [], recommendation: [] });
    setShowFeedback(false);
    setShowHints(false);
    setCompletionStep(0);
    setActiveStep(0);
  };

  const isOptionSelected = (optionId: string, category: string) => {
    return selectedOptions[category as SBARCategory].includes(optionId);
  };

  const getSelectionFeedback = (optionId: string) => {
    if (!showFeedback) return null;
    const option = sbarOptions.find(opt => opt.id === optionId);
    const isSelected = isOptionSelected(optionId, option?.category || '');
    if (!isSelected) return null;
    return option?.isCorrect ? 'correct' : 'incorrect';
  };

  const getCategoryScore = (category: string) => {
    const selected = selectedOptions[category as SBARCategory];
    const correctSelected = selected.filter(id => sbarOptions.find(opt => opt.id === id)?.isCorrect).length;
    return { correct: correctSelected, total: selected.length };
  };

  const getTotalScore = () => {
    let totalCorrect = 0;
    let totalSelected = 0;
    Object.keys(selectedOptions).forEach(category => {
      const score = getCategoryScore(category);
      totalCorrect += score.correct;
      totalSelected += score.total;
    });
    return { correct: totalCorrect, total: totalSelected };
  };

  const isCurrentStepComplete = selectedOptions[currentCategory].length >= 2;
  const isAllComplete = Object.values(selectedOptions).every(sel => sel.length >= 2);
  const isLastStep = activeStep === 3;

  const totalScore = getTotalScore();
  const scorePercentage = totalScore.total > 0 ? Math.round((totalScore.correct / totalScore.total) * 100) : 0;

  // Completed state
  if (isCompleted && completionStep >= 2) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-6">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-sm border border-green-400/40 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-green-400 mb-2">SBAR Completed!</h3>
          <p className="text-gray-200 text-sm mb-4">
            Score: {totalScore.correct}/{totalScore.total} ({scorePercentage}%)
          </p>
          <div className="p-3 rounded-lg bg-green-500/20 border border-green-400">
            <p className="text-green-100 text-xs">
              Excellent communication using the SBAR framework ensures clear,
              structured handoffs that improve patient safety and care coordination.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg overflow-hidden">
      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-400 to-purple-400 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-white truncate">Conduct SBAR Handoff</h3>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => setShowHints(!showHints)}
              className={`p-1.5 rounded transition-colors ${showHints ? 'bg-yellow-500/30 ring-1 ring-yellow-400/50' : 'bg-yellow-500/20 hover:bg-yellow-500/30'}`}
              title="Toggle hints"
            >
              <Lightbulb className="w-3 h-3 text-yellow-400" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded bg-slate-600/50 hover:bg-slate-600/70 transition-colors"
              title="Reset selections"
            >
              <RotateCcw className="w-3 h-3 text-gray-300" />
            </button>
          </div>
        </div>

        {/* ── Step Progress Timeline ── */}
        <div className="flex items-center justify-between gap-1">
          {sbarSections.map((section, index) => {
            const stepComplete = selectedOptions[section.key].length >= 2;
            const isActive = index === activeStep;
            const isPast = index < activeStep;
            // A step is "done" if it has 2+ selections OR we've moved past it
            const isDone = stepComplete || isPast;

            return (
              <React.Fragment key={section.key}>
                {/* Step circle */}
                <button
                  onClick={() => setActiveStep(index)}
                  className={`relative flex flex-col items-center gap-1 transition-all duration-300 group`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                      ${isActive
                        ? `bg-gradient-to-br ${section.gradient} text-white shadow-lg scale-110 ring-2 ring-white/30`
                        : isDone
                          ? `${section.pillBg} text-white`
                          : 'bg-slate-700/50 text-gray-500'
                      }`}
                  >
                    {isDone && !isActive ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      section.letter
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium transition-all duration-300
                      ${isActive ? section.textColor : isDone ? section.textColor : 'text-gray-500'}`}
                  >
                    {section.title}
                  </span>
                </button>

                {/* Connector line */}
                {index < 3 && (
                  <div className="flex-1 h-0.5 rounded-full mx-0.5 mb-4">
                    <div
                      className={`h-full rounded-full transition-all duration-500
                        ${isDone ? 'bg-gradient-to-r ' + section.gradient : 'bg-slate-700'}`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Active Section Content ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Section Title */}
        <div className={`mb-3 rounded-xl border-2 ${currentSection.borderColor} ${currentSection.bgColor} p-3`}>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${currentSection.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
              {currentSection.letter}
            </div>
            <div className="min-w-0">
              <h4 className={`font-bold text-base ${currentSection.textColor} truncate`}>
                {currentSection.title}
              </h4>
              <p className="text-gray-400 text-xs">{currentSection.subtitle}</p>
            </div>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed mt-1.5">{currentSection.description}</p>
        </div>

        {/* Hint */}
        {showHints && (
          <div className="mb-3 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-400/30">
            <p className="text-yellow-200 text-xs leading-relaxed">{currentSection.hint}</p>
          </div>
        )}

        {/* Selected Items Display */}
        <div className="mb-3 min-h-[2.5rem] p-2.5 rounded-lg bg-slate-800/50 border border-slate-600">
          {selectedOptions[currentCategory].length === 0 ? (
            <p className="text-gray-500 text-xs italic flex items-center h-5">
              Select 2-3 options below…
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selectedOptions[currentCategory].map(optionId => {
                const option = sbarOptions.find(opt => opt.id === optionId);
                const feedback = getSelectionFeedback(optionId);

                return (
                  <div
                    key={optionId}
                    onClick={() => option && handleOptionSelect(option)}
                    className={`px-2.5 py-1 rounded-full text-xs flex items-center gap-1 cursor-pointer transition-all duration-200 ${feedback === 'correct'
                      ? 'bg-green-500/20 border border-green-400 text-green-100'
                      : feedback === 'incorrect'
                        ? 'bg-red-500/20 border border-red-400 text-red-100'
                        : 'bg-cyan-500/20 border border-cyan-400 text-cyan-100 hover:bg-cyan-500/30'
                      }`}
                  >
                    <span className="font-medium">{option?.text}</span>
                    {feedback === 'correct' && <CheckCircle className="w-3 h-3 flex-shrink-0" />}
                    {feedback === 'incorrect' && <XCircle className="w-3 h-3 flex-shrink-0" />}
                    {!feedback && <span className="text-gray-400 ml-0.5">×</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Options */}
        <div className="space-y-1.5">
          {categoryOptions.map(option => {
            const isSelected = isOptionSelected(option.id, currentCategory);
            const feedback = getSelectionFeedback(option.id);
            const canSelect = !isSelected && selectedOptions[currentCategory].length < 3;

            return (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                disabled={!canSelect && !isSelected}
                className={`w-full p-2.5 text-left rounded-lg border transition-all duration-200 text-xs ${isSelected
                  ? feedback === 'correct'
                    ? 'bg-green-500/20 border-green-400 text-green-100 shadow-lg shadow-green-500/20'
                    : feedback === 'incorrect'
                      ? 'bg-red-500/20 border-red-400 text-red-100 shadow-lg shadow-red-500/20'
                      : `${currentSection.bgColor} ${currentSection.borderColor} text-white shadow-md`
                  : canSelect
                    ? 'bg-slate-700/30 border-slate-600 text-gray-200 hover:bg-slate-600/40 hover:border-slate-500 hover:shadow-md'
                    : 'bg-slate-700/20 border-slate-700 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="leading-relaxed font-medium flex-1">{option.text}</span>
                  {feedback === 'correct' && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-green-400" />
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    </div>
                  )}
                  {feedback === 'incorrect' && <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />}
                  {isSelected && !feedback && <CheckCircle className="w-3 h-3 text-cyan-400 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>


        {/* Feedback panel — only shows after submit */}
        {showFeedback && (
          <div className="mt-4 p-3 rounded-lg border-l-4 border-cyan-400 bg-cyan-500/20 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span className="font-bold text-sm text-cyan-400">SBAR Assessment Complete</span>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-white font-medium mb-2 text-xs">Performance Summary:</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {sbarSections.map(section => {
                  const score = getCategoryScore(section.key);
                  return (
                    <div key={section.key} className="flex justify-between text-xs">
                      <span className={section.textColor}>{section.title}:</span>
                      <span className="text-gray-200">{score.correct}/{score.total}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-slate-600 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white font-medium">Overall:</span>
                  <span className={`font-bold ${scorePercentage >= 80 ? 'text-green-400' : scorePercentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {totalScore.correct}/{totalScore.total} ({scorePercentage}%)
                  </span>
                </div>
              </div>
              <p className="text-gray-200 leading-relaxed text-xs mt-2">
                Effective SBAR communication ensures structured handoffs that improve patient safety.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer Navigation ── */}
      <div className="flex-shrink-0 border-t border-white/10 bg-slate-900/40 backdrop-blur-sm px-4 py-3">
        {!showFeedback ? (
          <div className="flex items-center gap-2">
            {/* Back button */}
            {activeStep > 0 && (
              <button
                onClick={handleBack}
                className="px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-gray-300 text-xs font-medium transition-all duration-200 flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Status */}
            <span className="text-gray-400 text-[10px] mr-2">
              {selectedOptions[currentCategory].length}/3 selected
            </span>

            {/* Continue / Submit */}
            {isLastStep && isAllComplete ? (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-xs
                          hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 flex items-center gap-1.5 shadow-lg hover:shadow-xl"
              >
                Submit SBAR
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isCurrentStepComplete}
                className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all duration-200 ${isCurrentStepComplete
                  ? `bg-gradient-to-r ${currentSection.gradient} text-white shadow-lg hover:shadow-xl hover:scale-105`
                  : 'bg-slate-700 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {!isLastStep ? sbarSections[activeStep + 1].title : 'Continue'}
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-full py-2 rounded-lg bg-green-500/20 border border-green-400 text-green-100 font-semibold text-sm flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>SBAR Communication Submitted</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SBARWordBank;