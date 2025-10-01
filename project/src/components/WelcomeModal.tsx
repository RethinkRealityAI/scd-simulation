import React, { useState, useEffect } from 'react';
import { X, Play, Users, Brain, Target, Clock, CheckCircle, MessageCircle, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onStart }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      title: "Welcome to the Simulation",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <p className="text-cyan-400 text-xl font-bold mb-3">Pediatric Emergency Department</p>
            <p className="text-gray-300 text-base leading-relaxed">
              Guide the clinical care of <strong className="text-cyan-400">Tobiloba Johnson</strong>, 
              a 15-year-old with sickle cell disease presenting with vaso-occlusive crisis
            </p>
          </div>
          
          {/* Learning Objectives - Emphasized and Larger */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border-2 border-cyan-400/40">
            <h4 className="text-white font-bold mb-5 flex items-center gap-3 text-xl">
              <Target className="w-6 h-6 text-cyan-400" />
              Learning Objectives
            </h4>
            <div className="space-y-4">
              {[
                'Recognize clinical symptoms of vaso-occlusive crisis (VOC) and possible acute chest syndrome (ACS)',
                'Assign interprofessional roles and coordinate care',
                'Provide timely and evidence-based pain management',
                'Communicate effectively with cultural humility',
                'Identify and mitigate clinical bias and stigma in SCD care'
              ].map((objective, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-100 text-base leading-relaxed font-medium">{objective}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Interactive Assessment",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border-2 border-cyan-500/30">
              <div className="flex items-center gap-4 mb-4">
                <CheckCircle className="w-7 h-7 text-green-400" />
                <h4 className="text-white font-bold text-lg">Quiz Questions</h4>
              </div>
              <p className="text-gray-300 text-base leading-relaxed">
                Answer multiple-choice questions with immediate feedback and detailed explanations.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border-2 border-purple-500/30">
              <div className="flex items-center gap-4 mb-4">
                <MessageCircle className="w-7 h-7 text-purple-400" />
                <h4 className="text-white font-bold text-lg">Discussion Prompts</h4>
              </div>
              <p className="text-gray-300 text-base leading-relaxed">
                Reflect on critical thinking questions to deepen your understanding of cultural competency.
              </p>
            </div>
          </div>
          
          <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 backdrop-blur-sm border-2 border-cyan-400/40">
            <h4 className="text-white font-bold mb-5 flex items-center gap-3 text-xl">
              <Target className="w-6 h-6 text-cyan-400" />
              Assessment Flow
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-base text-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="font-medium">Watch videos & review vitals</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="font-medium">Answer quiz questions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="font-medium">Engage with prompts</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="font-medium">Complete & unlock next</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Multimedia Experience",
      content: (
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-white/5 backdrop-blur-sm border-2 border-blue-500/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center">
                  <Play className="w-4 h-4 text-blue-400" />
                </div>
                <h4 className="text-white font-bold text-base">Video Scenarios</h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Watch clinical scenarios unfold through video clips and animations.
              </p>
            </div>
            
            <div className="p-5 rounded-xl bg-white/5 backdrop-blur-sm border-2 border-green-500/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500/30 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-green-400" />
                </div>
                <h4 className="text-white font-bold text-base">Character Audio</h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Click on character avatars to hear dialogue and gain deeper insights.
              </p>
            </div>
            
            <div className="p-5 rounded-xl bg-white/5 backdrop-blur-sm border-2 border-cyan-500/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/30 flex items-center justify-center">
                  <Target className="w-4 h-4 text-cyan-400" />
                </div>
                <h4 className="text-white font-bold text-base">Real-Time Vitals</h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Monitor patient vital signs that change throughout the simulation.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleStart = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onStart();
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Fits viewport without scrolling */}
      <div className="relative w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 backdrop-blur-sm border border-cyan-400/40 flex items-center justify-center">
                <Brain className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Simulation Guide</h2>
                <p className="text-gray-400 text-sm">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar - Minimal */}
          <div className="px-6 py-2 flex-shrink-0">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${
                    index <= currentStep ? 'bg-cyan-400' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content - Scrollable if needed */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-8 text-center">{steps[currentStep].title}</h3>
              {steps[currentStep].content}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 flex-shrink-0">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-5 py-2.5 rounded-lg bg-slate-700/50 text-white disabled:opacity-50 disabled:cursor-not-allowed
                       enabled:hover:bg-slate-600/50 transition-all duration-200 flex items-center gap-2 text-base font-medium"
            >
              Previous
            </button>

            <div className="flex gap-4">
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white
                           hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 flex items-center gap-2 text-base font-medium"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg
                           hover:from-green-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-105
                           flex items-center gap-3 shadow-2xl shadow-green-500/40 hover:shadow-green-400/60
                           animate-pulse hover:animate-none border-2 border-green-400/50 hover:border-green-300
                           relative overflow-hidden group"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Play className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Begin Simulation</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;