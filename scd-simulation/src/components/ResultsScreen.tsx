import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { Trophy, Target, Clock, Users, BarChart3, RefreshCw, Download, ExternalLink, BookOpen, Award, TrendingUp, CheckCircle, AlertCircle, Heart, Brain, MessageSquare, Shield, Scale } from 'lucide-react';

const ResultsScreen: React.FC = () => {
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
      description: 'Recognition and addressing of clinical bias',
      icon: Scale,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-400/30'
    }
  };

  const handleRestart = () => {
    dispatch({ type: 'RESET_SIMULATION' });
    navigate('/');
  };


  const resources = [
    {
      title: 'Sickle Cell Disease: Pathophysiology and Treatment',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3172721/',
      description: 'Comprehensive review of SCD mechanisms and therapeutic approaches'
    },
    {
      title: 'Emergency Management of Vaso-Occlusive Crisis',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4938685/',
      description: 'Evidence-based guidelines for acute crisis management'
    },
    {
      title: 'Cultural Competency in Sickle Cell Care',
      url: 'https://bmcemergmed.biomedcentral.com/articles/10.1186/s12873-025-01192-1',
      description: 'Addressing bias and improving patient outcomes through cultural awareness'
    }
  ];

  // Animation sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      if (animationStep < 4) {
        setAnimationStep(animationStep + 1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [animationStep]);

  return (
    <div className="min-h-screen overflow-auto relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 p-3 max-w-6xl mx-auto py-6">
        {/* Header with Animation */}
        <div className={`text-center mb-4 transition-all duration-1000 ${animationStep >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-400/30">
              <Trophy className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Simulation Completed!
          </h1>
          <p className="text-gray-300 text-base max-w-2xl mx-auto">
            You have successfully completed the sickle cell crisis management simulation
          </p>
        </div>

        {/* Main Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          {/* Overall Performance */}
          <div className={`lg:col-span-2 transition-all duration-1000 delay-300 ${animationStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="text-center mb-4">
                <div className="flex justify-center mb-2">
                  <PerformanceIcon className={`w-10 h-10 ${performance.color}`} />
                </div>
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(score)} animate-pulse`}>
                  {score}%
                </div>
                <div className={`text-xl font-semibold mb-2 ${performance.color}`}>
                  {performance.level}
                </div>
                <p className="text-gray-300 text-sm max-w-md mx-auto">
                  {performance.description}
                </p>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
                <div className="text-center">
                  <Target className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">
                    {state.userData.responses.filter(r => r.isCorrect).length}
                  </div>
                  <div className="text-xs text-gray-400">Correct Answers</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    of {state.userData.responses.length} total
                  </div>
                </div>
                
                <div className="text-center">
                  <Clock className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">
                    {formatTime(completionTime)}
                  </div>
                  <div className="text-xs text-gray-400">Total Time</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Avg: {Math.round(completionTime / state.userData.completedScenes.size / 60000)}m per scene
                  </div>
                </div>
                
                <div className="text-center">
                  <BarChart3 className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-white">
                    {state.userData.completedScenes.size}
                  </div>
                  <div className="text-xs text-gray-400">Scenes Completed</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {Math.round((state.userData.completedScenes.size / state.userData.totalScenes) * 100)}% completion
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Session Info & Data Submission */}
          <div className="space-y-3">
            {/* Session Details */}
            <div className={`transition-all duration-1000 delay-500 ${animationStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Session Details
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Session ID:</span>
                    <span className="text-gray-200 font-mono text-xs">
                      {state.userData.id.slice(-8)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Age Range:</span>
                    <span className="text-gray-200">{state.userData.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Education:</span>
                    <span className="text-gray-200">{state.userData.educationLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Start Time:</span>
                    <span className="text-gray-200">
                      {new Date(state.userData.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Questions Answered:</span>
                    <span className="text-gray-200">{state.userData.responses.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className={`transition-all duration-1000 delay-700 ${animationStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Data Automatically Saved
                </h3>
                <p className="text-xs text-gray-300 mb-3">
                  Your performance data has been automatically collected to help improve sickle cell disease education.
                </p>
                
                {/* Quick Actions */}
                <div className="space-y-2">
                  <button
                    onClick={handleRestart}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white
                             hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 
                             flex items-center justify-center gap-2 text-xs font-semibold"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Simulation Again
                  </button>
                  
                  <button
                    onClick={() => window.print()}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white
                             hover:from-purple-400 hover:to-pink-400 transition-all duration-200 
                             flex items-center justify-center gap-2 text-xs"
                  >
                    <Download className="w-4 h-4" />
                    Save Certificate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category-Based Scoring */}
        <div className={`mb-3 transition-all duration-1000 delay-900 ${animationStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h3 className="text-sm font-semibold text-white mb-3 text-center">Performance by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {categoryScores.map((categoryScore, index) => {
              const config = categoryConfig[categoryScore.category];
              const CategoryIcon = config.icon;
              
              return (
                <div
                  key={categoryScore.category}
                  className={`p-3 rounded-lg transition-all duration-500 transform hover:scale-105 ${config.bgColor} border ${config.borderColor}`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CategoryIcon className={`w-4 h-4 ${config.color}`} />
                    <h4 className="text-white font-semibold text-xs">{config.label}</h4>
                  </div>
                  
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-lg font-bold ${getScoreColor(categoryScore.percentage)}`}>
                      {categoryScore.percentage}%
                    </span>
                    <span className="text-xs text-gray-300">
                      {categoryScore.correct}/{categoryScore.total}
                    </span>
                  </div>
                  
                  <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden mb-2">
                    <div 
                      className={`h-full transition-all duration-1000 ${getScoreColor(categoryScore.percentage).replace('text-', 'bg-')}`}
                      style={{ width: `${categoryScore.percentage}%` }}
                    />
                  </div>
                  
                  <p className="text-gray-300 text-xs leading-tight">{config.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Learning Insights & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          <div className="p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Learning Insights
            </h3>
            <div className="space-y-2">
              {/* Performance-based recommendations */}
              {categoryScores.map((categoryScore, index) => {
                const config = categoryConfig[categoryScore.category];
                const CategoryIcon = config.icon;
                let recommendation = '';
                let recommendationColor = '';
                
                if (categoryScore.percentage >= 80) {
                  recommendation = `Excellent ${config.label.toLowerCase()} skills demonstrated!`;
                  recommendationColor = 'text-green-400';
                } else if (categoryScore.percentage >= 60) {
                  recommendation = `Good foundation in ${config.label.toLowerCase()}. Consider additional practice.`;
                  recommendationColor = 'text-yellow-400';
                } else {
                  recommendation = `Focus on improving ${config.label.toLowerCase()} competencies.`;
                  recommendationColor = 'text-red-400';
                }
                
                return (
                  <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-slate-800/30">
                    <CategoryIcon className={`w-4 h-4 ${config.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <h4 className="text-white font-semibold text-xs mb-0.5">{config.label}</h4>
                      <p className={`text-xs leading-tight ${recommendationColor}`}>
                        {recommendation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Key Metrics
            </h3>
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-slate-800/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-300 text-xs">Overall Performance</span>
                  <span className={`font-bold text-sm ${getScoreColor(score)}`}>{score}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-2000 ${getScoreColor(score).replace('text-', 'bg-')}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
              
              {/* Strongest and Weakest Areas */}
              {(() => {
                const sortedCategories = [...categoryScores].sort((a, b) => b.percentage - a.percentage);
                const strongest = sortedCategories[0];
                const weakest = sortedCategories[sortedCategories.length - 1];
                
                return (
                  <>
                    {strongest && strongest.total > 0 && (
                      <div className="p-2 rounded-lg bg-green-500/10 border border-green-400/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-3 h-3 text-green-400" />
                          <span className="text-green-300 text-xs font-semibold">Strongest Area</span>
                        </div>
                        <p className="text-green-100 text-xs">
                          {categoryConfig[strongest.category]?.label} ({strongest.percentage}%)
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
                          {categoryConfig[weakest.category]?.label} ({weakest.percentage}%)
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="p-2 rounded-lg bg-slate-800/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-300 text-xs">Completion Time</span>
                  <span className="text-blue-400 font-bold text-xs">
                    {formatTime(completionTime)}
                  </span>
                </div>
                <p className="text-gray-400 text-xs">
                  {completionTime < 1200000 ? 'Efficient completion time' : 
                   completionTime < 1800000 ? 'Good pacing throughout' : 
                   'Thorough consideration of each scenario'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Resources */}
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-white mb-2 text-center flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            Continue Your Learning
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
            {resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300 transform hover:scale-102 group"
              >
                <div className="flex items-start gap-1.5 mb-0.5">
                  <ExternalLink className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5 group-hover:text-cyan-300 transition-colors" />
                  <h4 className="text-white font-semibold text-xs leading-tight group-hover:text-cyan-100 transition-colors">
                    {resource.title}
                  </h4>
                </div>
                <p className="text-gray-300 text-xs leading-tight group-hover:text-gray-200 transition-colors">
                  {resource.description}
                </p>
              </a>
            ))}
          </div>
        </div>


        {/* Footer Note */}
        <div className="text-center p-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10">
          <p className="text-gray-300 text-xs">
            This simulation is designed for healthcare education purposes. All data collected is anonymous and used for research to improve sickle cell disease care.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;