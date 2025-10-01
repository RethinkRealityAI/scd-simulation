import React from 'react';
import { Target, Clock, Brain, MessageSquare, Shield, Scale } from 'lucide-react';
import { ScoringCategory } from '../../data/scenesData';

interface ScoringCategoriesEditorProps {
  categories: ScoringCategory[];
  onChange: (categories: ScoringCategory[]) => void;
}

const categoryInfo: Record<ScoringCategory, { icon: React.ReactNode; label: string; color: string }> = {
  timelyPainManagement: {
    icon: <Clock className="w-5 h-5" />,
    label: 'Timely Pain Management',
    color: 'text-orange-600'
  },
  clinicalJudgment: {
    icon: <Brain className="w-5 h-5" />,
    label: 'Clinical Judgment',
    color: 'text-blue-600'
  },
  communication: {
    icon: <MessageSquare className="w-5 h-5" />,
    label: 'Communication',
    color: 'text-green-600'
  },
  culturalSafety: {
    icon: <Shield className="w-5 h-5" />,
    label: 'Cultural Safety',
    color: 'text-purple-600'
  },
  biasMitigation: {
    icon: <Scale className="w-5 h-5" />,
    label: 'Bias Mitigation',
    color: 'text-pink-600'
  }
};

const ScoringCategoriesEditor: React.FC<ScoringCategoriesEditorProps> = ({ categories, onChange }) => {
  const toggleCategory = (category: ScoringCategory) => {
    if (categories.includes(category)) {
      onChange(categories.filter(c => c !== category));
    } else {
      onChange([...categories, category]);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-600" />
        Scoring Categories ({categories.length} selected)
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        Select the competency domains that this scene assesses:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(Object.keys(categoryInfo) as ScoringCategory[]).map((category) => {
          const info = categoryInfo[category];
          const isSelected = categories.includes(category);
          
          return (
            <label
              key={category}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-indigo-100 border-indigo-400 shadow-md'
                  : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleCategory(category)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div className={`${info.color}`}>
                {info.icon}
              </div>
              <span className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                {info.label}
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-indigo-100 border border-indigo-200 rounded-lg">
        <p className="text-sm text-indigo-800">
          💡 <strong>Tip:</strong> Each scene can contribute to multiple competency domains. Select all that apply to ensure comprehensive assessment coverage.
        </p>
      </div>
    </div>
  );
};

export default ScoringCategoriesEditor;

