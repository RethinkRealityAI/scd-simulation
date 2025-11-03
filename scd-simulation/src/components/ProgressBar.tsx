import React, { useState } from 'react';
import { Check, Heart, Brain, MessageSquare, Shield, Scale } from 'lucide-react';
import { scenes } from '../data/scenesData';

interface ProgressBarProps {
  current: number;
  total: number;
  completedScenes: Set<number>;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, completedScenes }) => {
  const [hoveredScene, setHoveredScene] = useState<number | null>(null);

  // Category icon mapping
  const categoryIcons = {
    timelyPainManagement: Heart,
    clinicalJudgment: Brain,
    communication: MessageSquare,
    culturalSafety: Shield,
    biasMitigation: Scale,
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-white">Progress</span>
        <span className="text-xs text-gray-300">
          {completedScenes.size}/{total}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: total }, (_, index) => {
          const sceneNumber = index + 1;
          const scene = scenes[index];
          const isCompleted = completedScenes.has(sceneNumber);
          const isCurrent = sceneNumber === current;
          const isAccessible = sceneNumber <= Math.max(current, Math.max(...Array.from(completedScenes)) + 1);

          return (
            <React.Fragment key={sceneNumber}>
              <div 
                className="flex flex-col items-center relative"
                onMouseEnter={() => setHoveredScene(sceneNumber)}
                onMouseLeave={() => setHoveredScene(null)}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    isCompleted
                      ? 'bg-green-500 text-white shadow-sm shadow-green-500/30'
                      : isCurrent
                      ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/30 animate-pulse'
                      : isAccessible
                      ? 'bg-slate-600 text-gray-300 border border-slate-500 hover:bg-slate-500'
                      : 'bg-slate-700 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <span className="text-xs font-semibold">{sceneNumber}</span>
                  )}
                </div>
                
                {/* Tooltip */}
                {hoveredScene === sceneNumber && scene && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-slate-800 text-white text-xs rounded-lg p-2 shadow-xl border border-slate-600 max-w-48">
                      <div className="font-semibold mb-1">{scene.title}</div>
                      <div className="text-gray-300 text-xs leading-tight">{scene.description}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {index < total - 1 && (
                <div
                  className={`flex-1 h-0.5 rounded-full transition-all duration-300 mx-0.5 ${
                    completedScenes.has(sceneNumber) ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-slate-600'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;