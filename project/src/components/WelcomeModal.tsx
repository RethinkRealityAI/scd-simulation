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
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 backdrop-blur-sm border border-cyan-400/40 flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-base font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Pediatric Emergency Department Simulation
            </h3>
            <p className="text-gray-200 text-xs leading-relaxed">
              Managing Vaso-Occlusive Crisis in a Patient with Sickle Cell Disease
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10">
            <p className="text-gray-100 text-xs leading-relaxed">
              In this interactive experience, you will guide the clinical care of <strong className="text-cyan-400">Tobiloba Johnson</strong>, 
              a 15-year-old boy with sickle cell disease presenting with severe pain.
            </p>
          </div>
          
          {/* Learning Objectives */}
          <div className="p-3 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2 text-xs">
              <Target className="w-3 h-3 text-cyan-400" />
              Learning Objectives
            </h4>
            <div className="space-y-1">
              {[
                'Recognize clinical symptoms of vaso-occlusive crisis (VOC) and possible acute chest syndrome (ACS)',
                'Assign interprofessional roles and coordinate care',
                'Provide timely and evidence-based pain management',
                'Communicate effectively with cultural humility',
                'Identify and mitigate clinical bias and stigma in SCD care'
              ].map((objective, index) => (
                <div key={index} className="flex items-start gap-1.5">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span className="text-gray-200 text-xs leading-tight">{objective}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "How Assessment Works",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 backdrop-blur-sm border border-purple-400/40 flex items-center justify-center">
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              Interactive Assessment System
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-cyan-500/20">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h4 className="text-white font-semibold text-sm">Quiz Questions</h4>
              </div>
              <p className="text-gray-300 text-xs">
                Answer multiple-choice questions based on clinical scenarios. 
                Receive immediate feedback with detailed explanations.
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-purple-500/20">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-5 h-5 text-purple-400" />
                <h4 className="text-white font-semibold text-sm">Discussion Prompts</h4>
              </div>
              <p className="text-gray-300 text-xs">
                Reflect on critical thinking questions designed to deepen 
                your understanding of cultural competency and clinical judgment.
              </p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-cyan-400/30">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-cyan-400" />
              Assessment Flow
            </h4>
            <div className="space-y-1 text-xs text-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <span>Watch the scene video and review patient vitals</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <span>Answer quiz questions with immediate feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <span>Engage with discussion prompts for deeper learning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <span>Complete the scene to unlock the next scenario</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Interactive Features",
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-sm border border-green-400/40 flex items-center justify-center">
              <Play className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              Multimedia Learning Experience
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-blue-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center">
                  <Play className="w-4 h-4 text-blue-400" />
                </div>
                <h4 className="text-white font-semibold text-sm">Video Scenarios</h4>
              </div>
              <p className="text-gray-300 text-xs">
                Watch short video clips and animations of clinical scenarios as they unfold.
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-green-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-400" />
                </div>
                <h4 className="text-white font-semibold text-sm">Character Audio</h4>
              </div>
              <p className="text-gray-300 text-xs">
                Click on character avatars to hear their dialogue and gain deeper insights into patient interactions.
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-cyan-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-cyan-500/30 flex items-center justify-center">
                  <Target className="w-4 h-4 text-cyan-400" />
                </div>
                <h4 className="text-white font-semibold text-sm">Real-Time Vitals</h4>
              </div>
              <p className="text-gray-300 text-xs">
                Monitor patient vital signs that change throughout the simulation to inform your clinical decisions.
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
      
      {/* Modal - Optimized for viewport */}
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 backdrop-blur-sm border border-cyan-400/40 flex items-center justify-center">
                <Brain className="w-5 h-5 text-cyan-400" />
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

          {/* Progress Bar */}
          <div className="px-6 py-3">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                    index <= currentStep ? 'bg-cyan-400' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[300px]">
            <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">{steps[currentStep].title}</h3>
              {steps[currentStep].content}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 rounded-lg bg-slate-700/50 text-white disabled:opacity-50 disabled:cursor-not-allowed
                       enabled:hover:bg-slate-600/50 transition-all duration-200 flex items-center gap-2 text-base"
            >
              Previous
            </button>

            <div className="flex gap-4">
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white
                           hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 flex items-center gap-2 text-base"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg
                           hover:from-green-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-110
                           flex items-center gap-3 shadow-2xl shadow-green-500/40 hover:shadow-green-400/60
                           animate-pulse hover:animate-none border-2 border-green-400/50 hover:border-green-300
                           relative overflow-hidden group"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Play className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Begin Simulation</span>
                  {/* Tech-style border animation */}
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" style={{ padding: '2px' }}>
                    <div className="w-full h-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500" />
                  </div>
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