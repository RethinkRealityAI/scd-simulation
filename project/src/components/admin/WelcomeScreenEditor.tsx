import React, { useState } from 'react';
import { DoorOpen, Save, FileText, Users, GraduationCap } from 'lucide-react';

interface WelcomeScreenEditorProps {
  onSave?: (config: WelcomeConfig) => void;
}

interface WelcomeConfig {
  title: string;
  subtitle: string;
  instructions: string[];
  ageGroups: { value: string; label: string }[];
  educationLevels: { value: string; label: string }[];
}

const WelcomeScreenEditor: React.FC<WelcomeScreenEditorProps> = ({ onSave }) => {
  const [config, setConfig] = useState<WelcomeConfig>({
    title: 'Sickle Cell Disease Simulation',
    subtitle: 'A case-based learning experience focused on bias mitigation and cultural safety',
    instructions: [
      'Complete demographic information',
      'Navigate through realistic clinical scenarios',
      'Answer questions and make clinical decisions',
      'Reflect on bias and cultural considerations'
    ],
    ageGroups: [
      { value: '18-24', label: '18-24' },
      { value: '25-34', label: '25-34' },
      { value: '35-44', label: '35-44' },
      { value: '45-54', label: '45-54' },
      { value: '55+', label: '55+' }
    ],
    educationLevels: [
      { value: 'highschool', label: 'High School' },
      { value: 'undergraduate', label: 'Undergraduate' },
      { value: 'graduate', label: 'Graduate' },
      { value: 'professional', label: 'Professional/Practitioner' }
    ]
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateConfig = <K extends keyof WelcomeConfig>(key: K, value: WelcomeConfig[K]) => {
    setConfig({ ...config, [key]: value });
    setHasChanges(true);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...config.instructions];
    newInstructions[index] = value;
    updateConfig('instructions', newInstructions);
  };

  const handleSave = () => {
    onSave?.(config);
    setHasChanges(false);
    alert('Welcome screen configuration saved!');
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <DoorOpen className="w-6 h-6 text-green-600" />
          Welcome Screen Configuration
        </h2>
        <p className="text-gray-600">Customize the initial welcome screen that learners see before starting the simulation.</p>
      </div>

      {/* Basic Content */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Basic Content
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Main Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => updateConfig('title', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Main simulation title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
            <textarea
              value={config.subtitle}
              onChange={(e) => updateConfig('subtitle', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={2}
              placeholder="Brief description or tagline"
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          Instructions
        </h3>
        
        <div className="space-y-3">
          {config.instructions.map((instruction, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-600 w-8">{index + 1}.</span>
              <input
                type="text"
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder={`Instruction ${index + 1}`}
              />
            </div>
          ))}
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          💡 Instructions guide learners through the simulation process
        </p>
      </div>

      {/* Demographics Configuration */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Demographic Options
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Age Groups</h4>
            <div className="space-y-2">
              {config.ageGroups.map((group, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">{group.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Education Levels</h4>
            <div className="space-y-2">
              {config.educationLevels.map((level, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">{level.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          💡 These options are collected for analytics and demographic reporting
        </p>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          Preview
        </h3>
        
        <div className="bg-white rounded-lg p-8 border-2 border-gray-200">
          <h2 className="text-3xl font-bold text-center mb-2">{config.title}</h2>
          <p className="text-center text-gray-600 mb-6">{config.subtitle}</p>
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Instructions:</h3>
            <ul className="space-y-2">
              {config.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">{index + 1}.</span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium transition-all flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Welcome Screen Configuration
          </button>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreenEditor;

