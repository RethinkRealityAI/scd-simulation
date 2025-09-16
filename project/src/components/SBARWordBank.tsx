import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, Lightbulb, ArrowRight, Sparkles } from 'lucide-react';

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

const SBARWordBank: React.FC<SBARWordBankProps> = ({ onComplete, onSubmit, isCompleted }) => {
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
    // Situation - Correct Options
    { id: 's1', text: '15-year-old Tobiloba Johnson', category: 'situation', isCorrect: true },
    { id: 's2', text: 'Sickle cell disease patient', category: 'situation', isCorrect: true },
    { id: 's3', text: 'Severe pain crisis (9/10)', category: 'situation', isCorrect: true },
    { id: 's4', text: 'Requesting pain reassessment', category: 'situation', isCorrect: true },
    
    // Situation - Distractors
    { id: 's5', text: 'First-time emergency visit', category: 'situation', isCorrect: false },
    { id: 's6', text: 'Requesting discharge', category: 'situation', isCorrect: false },
    { id: 's7', text: 'Routine follow-up visit', category: 'situation', isCorrect: false },

    // Background - Correct Options
    { id: 'b1', text: 'Known sickle cell disease', category: 'background', isCorrect: true },
    { id: 'b2', text: 'Previous VOC episodes', category: 'background', isCorrect: true },
    { id: 'b3', text: 'Pain started 2 days ago', category: 'background', isCorrect: true },
    { id: 'b4', text: 'Mother reports worsening pain', category: 'background', isCorrect: true },
    
    // Background - Distractors
    { id: 'b5', text: 'No significant medical history', category: 'background', isCorrect: false },
    { id: 'b6', text: 'Recent surgery', category: 'background', isCorrect: false },
    { id: 'b7', text: 'New diagnosis today', category: 'background', isCorrect: false },

    // Assessment - Correct Options
    { id: 'a1', text: 'HR: 128 bpm (elevated)', category: 'assessment', isCorrect: true },
    { id: 'a2', text: 'Pain remains 9/10 after morphine', category: 'assessment', isCorrect: true },
    { id: 'a3', text: 'Appears withdrawn and guarded', category: 'assessment', isCorrect: true },
    { id: 'a4', text: 'Dry mucous membranes noted', category: 'assessment', isCorrect: true },
    
    // Assessment - Distractors
    { id: 'a5', text: 'Pain completely resolved', category: 'assessment', isCorrect: false },
    { id: 'a6', text: 'Normal vital signs', category: 'assessment', isCorrect: false },
    { id: 'a7', text: 'Patient appears comfortable', category: 'assessment', isCorrect: false },

    // Recommendation - Correct Options
    { id: 'r1', text: 'Escalate to attending physician', category: 'recommendation', isCorrect: true },
    { id: 'r2', text: 'Consider additional pain management', category: 'recommendation', isCorrect: true },
    { id: 'r3', text: 'Monitor for complications', category: 'recommendation', isCorrect: true },
    { id: 'r4', text: 'Reassess pain in 15 minutes', category: 'recommendation', isCorrect: true },
    
    // Recommendation - Distractors
    { id: 'r5', text: 'Discharge home immediately', category: 'recommendation', isCorrect: false },
    { id: 'r6', text: 'Reduce pain medication', category: 'recommendation', isCorrect: false },
    { id: 'r7', text: 'No further action needed', category: 'recommendation', isCorrect: false },
  ];

  const sbarSections = [
    {
      key: 'situation' as const,
      title: 'Situation',
      subtitle: 'What is happening right now?',
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400'
    },
    {
      key: 'background' as const,
      title: 'Background',
      subtitle: 'What led to this situation?',
      color: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-400',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400'
    },
    {
      key: 'assessment' as const,
      title: 'Assessment',
      subtitle: 'What do you think the problem is?',
      color: 'from-yellow-500 to-orange-500',
      borderColor: 'border-yellow-400',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-400'
    },
    {
      key: 'recommendation' as const,
      title: 'Recommendation',
      subtitle: 'What should be done?',
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-400',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400'
    }
  ];

  const handleOptionSelect = (option: SBAROption) => {
    const category = option.category;
    const isAlreadySelected = selectedOptions[category].includes(option.id);
    
    if (isAlreadySelected) {
      // Remove if already selected
      setSelectedOptions(prev => ({
        ...prev,
        [category]: prev[category].filter(id => id !== option.id)
      }));
    } else {
      // Add to selection (limit to 3 per category)
      if (selectedOptions[category].length < 3) {
        setSelectedOptions(prev => ({
          ...prev,
          [category]: [...prev[category], option.id]
        }));
      }
    }
  };

  const handleSubmit = () => {
    setShowFeedback(true);
    
    // Convert selections to text for parent component
    const responses: { [key: string]: string[] } = {};
    Object.entries(selectedOptions).forEach(([category, optionIds]) => {
      responses[category] = optionIds.map(id => {
        const option = sbarOptions.find(opt => opt.id === id);
        return option?.text || '';
      });
    });
    
    onComplete(responses);
    
    // Trigger completion animation
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
    setSelectedOptions({
      situation: [],
      background: [],
      assessment: [],
      recommendation: []
    });
    setShowFeedback(false);
    setShowHints(false);
    setCompletionStep(0);
  };

  const getOptionsByCategory = (category: string) => {
    return sbarOptions.filter(option => option.category === category);
  };

  const isOptionSelected = (optionId: string, category: string) => {
    return selectedOptions[category as keyof typeof selectedOptions].includes(optionId);
  };

  const getSelectionFeedback = (optionId: string, category: string) => {
    if (!showFeedback) return null;
    
    const option = sbarOptions.find(opt => opt.id === optionId);
    const isSelected = isOptionSelected(optionId, category);
    
    if (!isSelected) return null;
    
    return option?.isCorrect ? 'correct' : 'incorrect';
  };

  const getCategoryScore = (category: string) => {
    const selected = selectedOptions[category as keyof typeof selectedOptions];
    const correctSelected = selected.filter(id => {
      const option = sbarOptions.find(opt => opt.id === id);
      return option?.isCorrect;
    }).length;
    
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

  const isReadyToSubmit = () => {
    return Object.values(selectedOptions).every(selections => selections.length >= 2);
  };

  const totalScore = getTotalScore();
  const scorePercentage = totalScore.total > 0 ? Math.round((totalScore.correct / totalScore.total) * 100) : 0;

  if (isCompleted && completionStep >= 2) {
    return (
      <div className="p-4 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 h-full flex flex-col items-center justify-center">
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
    <div className="p-3 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-400 to-purple-400"></div>
          <h3 className="text-sm font-semibold text-white">Interactive SBAR</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowHints(!showHints)}
            className="p-1 rounded bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors"
          >
            <Lightbulb className="w-3 h-3 text-yellow-400" />
          </button>
          <button
            onClick={handleReset}
            className="p-1 rounded bg-slate-600/50 hover:bg-slate-600/70 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-3 p-2 rounded-lg bg-slate-800/40 border border-cyan-400/20 flex-shrink-0">
        <p className="text-gray-200 text-xs leading-relaxed">
          Select 2-3 appropriate options for each SBAR section. Click items to add/remove them.
        </p>
      </div>

      {/* SBAR Sections */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {sbarSections.map((section) => {
          const categoryOptions = getOptionsByCategory(section.key);
          const score = getCategoryScore(section.key);
          const isComplete = selectedOptions[section.key].length >= 2;
          
          return (
            <div key={section.key} className={`rounded-lg border-2 transition-all duration-300 ${
              isComplete ? section.borderColor : 'border-slate-600'
            } ${section.bgColor} p-3`}>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className={`font-bold text-sm ${section.textColor}`}>
                    {section.title}
                  </h4>
                  <p className="text-gray-300 text-xs">{section.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  {showFeedback && (
                    <div className="text-xs">
                      <span className="text-green-400">{score.correct}</span>
                      <span className="text-gray-400">/{score.total}</span>
                    </div>
                  )}
                  {isComplete && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </div>

              {/* Selected Items Display */}
              <div className="mb-2 min-h-[2rem] p-2 rounded bg-slate-800/50 border border-slate-600">
                {selectedOptions[section.key].length === 0 ? (
                  <p className="text-gray-500 text-xs italic">Select items below...</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedOptions[section.key].map((optionId) => {
                      const option = sbarOptions.find(opt => opt.id === optionId);
                      const feedback = getSelectionFeedback(optionId, section.key);
                      
                      return (
                        <div
                          key={optionId}
                          className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-all duration-200 ${
                            feedback === 'correct' 
                              ? 'bg-green-500/20 border border-green-400 text-green-100'
                              : feedback === 'incorrect'
                              ? 'bg-red-500/20 border border-red-400 text-red-100'
                              : 'bg-cyan-500/20 border border-cyan-400 text-cyan-100'
                          }`}
                        >
                          <span>{option?.text}</span>
                          {feedback === 'correct' && <CheckCircle className="w-3 h-3" />}
                          {feedback === 'incorrect' && <XCircle className="w-3 h-3" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Hint */}
              {showHints && (
                <div className="mb-2 p-2 rounded bg-yellow-500/10 border border-yellow-400/30">
                  <p className="text-yellow-200 text-xs">
                    {section.key === 'situation' && 'Focus on patient identity, current condition, and reason for communication'}
                    {section.key === 'background' && 'Include relevant medical history and timeline of current episode'}
                    {section.key === 'assessment' && 'Current vital signs, pain level, and clinical observations'}
                    {section.key === 'recommendation' && 'Specific actions needed and urgency level'}
                  </p>
                </div>
              )}

              {/* Available Options */}
              <div className="grid grid-cols-1 gap-1">
                {categoryOptions.map((option) => {
                  const isSelected = isOptionSelected(option.id, section.key);
                  const feedback = getSelectionFeedback(option.id, section.key);
                  const canSelect = !isSelected && selectedOptions[section.key].length < 3;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option)}
                      disabled={!canSelect && !isSelected}
                      className={`p-2 text-left rounded border transition-all duration-200 text-xs ${
                        isSelected
                          ? feedback === 'correct'
                            ? 'bg-green-500/20 border-green-400 text-green-100'
                            : feedback === 'incorrect'
                            ? 'bg-red-500/20 border-red-400 text-red-100'
                            : 'bg-cyan-500/20 border-cyan-400 text-cyan-100'
                          : canSelect
                          ? 'bg-slate-700/30 border-slate-600 text-gray-200 hover:bg-slate-600/40 hover:border-slate-500'
                          : 'bg-slate-700/20 border-slate-700 text-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="leading-relaxed">{option.text}</span>
                        {feedback === 'correct' && (
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-green-400" />
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          </div>
                        )}
                        {feedback === 'incorrect' && (
                          <XCircle className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback Section */}
      {showFeedback && (
        <div className="mb-3 p-3 rounded-lg border-l-4 border-cyan-400 bg-cyan-500/20 animate-fade-in flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-sm text-cyan-400">SBAR Assessment Complete</span>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-white font-medium mb-2 text-xs">Performance Summary:</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {sbarSections.map((section) => {
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
              Your selections demonstrate understanding of critical information needed for care coordination.
            </p>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mb-3 flex-shrink-0">
        <div className="flex justify-between text-xs text-gray-300 mb-1">
          <span>Progress</span>
          <span>{Object.values(selectedOptions).reduce((acc, arr) => acc + arr.length, 0)}/12 selected</span>
        </div>
        <div className="flex gap-1">
          {sbarSections.map((section) => {
            const progress = selectedOptions[section.key].length;
            const maxProgress = 3;
            
            return (
              <div key={section.key} className="flex-1 space-y-1">
                <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${section.color} transition-all duration-500`}
                    style={{ width: `${(progress / maxProgress) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex-shrink-0">
        {!showFeedback ? (
          <button
            onClick={handleSubmit}
            disabled={!isReadyToSubmit()}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm
                     disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:opacity-50
                     enabled:hover:from-cyan-400 enabled:hover:to-blue-400 transition-all duration-200 
                     flex items-center justify-center gap-2"
          >
            Submit SBAR
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <div className="w-full py-2 px-3 rounded-lg bg-green-500/20 border border-green-400 text-green-100 font-semibold text-sm
                        flex items-center justify-center gap-2">
            <CheckCircle className="w-3 h-3" />
            SBAR Submitted
          </div>
        )}
      </div>
    </div>
  );
};

export default SBARWordBank;