import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { Trophy, Target, Clock, RefreshCw, Award, TrendingUp, CheckCircle, AlertCircle, Heart, Brain, MessageSquare, Shield, Share2 } from 'lucide-react';

const CompletionResults: React.FC = () => {
  const navigate = useNavigate();
  const { state, calculateScore, calculateCategoryScores, dispatch } = useSimulation();
  const [animationStep, setAnimationStep] = useState(0);

  const score = calculateScore();
  const completionTime = state.userData.responses.length > 0 
    ? Date.now() - state.userData.startTime 
    : 0;

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { 
      level: 'Excellent', 
      description: 'Outstanding understanding of sickle cell crisis management',
      icon: Award,
      color: 'text-green-400'
    };
    if (score >= 80) return { 
      level: 'Very Good', 
      description: 'Strong grasp of key concepts and protocols',
      icon: Trophy,
      color: 'text-blue-400'
    };
    if (score >= 70) return { 
      level: 'Good', 
      description: 'Solid foundation with room for improvement',
      icon: Target,
      color: 'text-cyan-400'
    };
    if (score >= 60) return { 
      level: 'Satisfactory', 
      description: 'Basic understanding, additional training recommended',
      icon: TrendingUp,
      color: 'text-yellow-400'
    };
    return { 
      level: 'Needs Improvement', 
      description: 'Further education and practice strongly recommended',
      icon: AlertCircle,
      color: 'text-red-400'
    };
  };

  const performance = getPerformanceLevel(score);
  const PerformanceIcon = performance.icon;

  // Get category scores
  const categoryScores = calculateCategoryScores();

  // Category display configuration
  const categoryConfig = {
    timelyPainManagement: {
      label: 'Timely Pain Management',
      description: 'Rapid assessment and appropriate pain interventions',
      icon: Heart,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-400/30'
    },
    clinicalJudgment: {
      label: 'Clinical Judgment',
      description: 'Evidence-based decision making and risk assessment',
      icon: Brain,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-400/30'
    },
    communication: {
      label: 'Communication',
      description: 'Effective interprofessional and patient communication',
      icon: MessageSquare,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-400/30'
    },
    culturalSafety: {
      label: 'Cultural Safety',
      description: 'Culturally responsive and respectful care delivery',
      icon: Shield,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-400/30'
    },
    biasMitigation: {
      label: 'Bias Mitigation',
      description: 'Recognition and addressing of healthcare biases',
      icon: Shield,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-400/30'
    }
  };

  const handleRestart = () => {
    dispatch({ type: 'RESET_SIMULATION' });
    navigate('/welcome');
  };


  // Animation sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStep(prev => Math.min(prev + 1, 4));
    }, 500);
    return () => clearTimeout(timer);
  }, [animationStep]);

  // Find strongest and weakest categories
  const strongest = categoryScores.reduce((prev, current) => 
    (current.percentage > prev.percentage) ? current : prev, categoryScores[0]);
  const weakest = categoryScores.reduce((prev, current) => 
    (current.percentage < prev.percentage) ? current : prev, categoryScores[0]);

  return (
    <>
      <div className="space-y-3">
        {/* Header with Animation */}
        <div className={`text-center transition-all duration-1000 ${animationStep >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex justify-center mb-2">
            <div className="p-2 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-400/30">
              <Trophy className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">
            Simulation Completed!
          </h2>
          <p className="text-gray-300 text-xs">
            You have successfully completed the sickle cell crisis management simulation
          </p>
        </div>

        {/* Overall Performance */}
        <div className={`transition-all duration-1000 delay-300 ${animationStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="text-center mb-3">
              <div className="flex justify-center mb-1">
                <PerformanceIcon className={`w-6 h-6 ${performance.color}`} />
              </div>
              <div className={`text-2xl font-bold mb-1 ${getScoreColor(score)} animate-pulse`}>
                {score}%
              </div>
              <div className="text-white font-semibold text-base mb-1">
                {performance.level}
              </div>
              <p className="text-gray-300 text-xs">
                {performance.description}
              </p>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {categoryScores.map((categoryScore, index) => {
                const config = categoryConfig[categoryScore.category as keyof typeof categoryConfig];
                if (!config) return null;

                const CategoryIcon = config.icon;
                return (
                  <div
                    key={categoryScore.category}
                    className={`p-2 rounded-lg transition-all duration-500 transform hover:scale-105 ${config.bgColor} border ${config.borderColor}`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryIcon className={`w-3 h-3 ${config.color}`} />
                      <h4 className="text-white font-semibold text-xs">{config.label}</h4>
                    </div>
                    
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold ${getScoreColor(categoryScore.percentage)}`}>
                        {categoryScore.percentage}%
                      </span>
                      <span className="text-xs text-gray-300">
                        {categoryScore.correct}/{categoryScore.total}
                      </span>
                    </div>
                    
                    <div className="w-full h-1 rounded-full bg-slate-700 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${getScoreColor(categoryScore.percentage).replace('text-', 'bg-')}`}
                        style={{ width: `${categoryScore.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Key Metrics & Time */}
        <div className={`transition-all duration-1000 delay-500 ${animationStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Key Metrics
            </h3>
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-slate-800/30">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs">Completion Time</span>
                  <span className="text-cyan-400 font-bold text-sm">{formatTime(completionTime)}</span>
                </div>
              </div>

              {/* Strongest/Weakest Areas */}
              {strongest && strongest.total > 0 && (
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-400/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-3 h-3 text-green-400" />
                    <span className="text-green-300 text-xs font-semibold">Strongest Area</span>
                  </div>
                  <p className="text-green-100 text-xs">
                    {categoryConfig[strongest.category as keyof typeof categoryConfig]?.label} ({strongest.percentage}%)
                  </p>
                </div>
              )}
              
              {weakest && weakest.total > 0 && weakest.percentage < 80 && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-400/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-300 text-xs font-semibold">Focus Area</span>
                  </div>
                  <p className="text-amber-100 text-xs">
                    {categoryConfig[weakest.category as keyof typeof categoryConfig]?.label} ({weakest.percentage}%)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>


      </div>

    </>
  );
};

export default CompletionResults;
