import React, { useState } from 'react';
import { Edit, Save, X, CheckCircle } from 'lucide-react';

interface SBARData {
  situation: string[];
  background: string[];
  assessment: string[];
  recommendation: string[];
}

interface SBARChartProps {
  data: SBARData;
  onUpdate?: (newData: SBARData) => void;
  readOnly?: boolean;
}

const SBARChart: React.FC<SBARChartProps> = ({ data, onUpdate, readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<SBARData>(data);

  const sbarSections = [
    {
      key: 'situation' as keyof SBARData,
      title: 'SITUATION',
      subtitle: 'Current Status',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-400',
      textColor: 'text-blue-400',
      icon: '📍'
    },
    {
      key: 'background' as keyof SBARData,
      title: 'BACKGROUND',
      subtitle: 'Relevant History',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-400',
      textColor: 'text-green-400',
      icon: '📋'
    },
    {
      key: 'assessment' as keyof SBARData,
      title: 'ASSESSMENT',
      subtitle: 'Clinical Findings',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-400',
      textColor: 'text-yellow-400',
      icon: '🔍'
    },
    {
      key: 'recommendation' as keyof SBARData,
      title: 'RECOMMENDATION',
      subtitle: 'Proposed Actions',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-400',
      textColor: 'text-purple-400',
      icon: '💡'
    }
  ];

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(data);
    setIsEditing(false);
  };

  const handleItemEdit = (section: keyof SBARData, index: number, newValue: string) => {
    setEditData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => i === index ? newValue : item)
    }));
  };

  const handleItemRemove = (section: keyof SBARData, index: number) => {
    setEditData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const handleItemAdd = (section: keyof SBARData) => {
    setEditData(prev => ({
      ...prev,
      [section]: [...prev[section], 'New item']
    }));
  };

  return (
    <div className="w-full h-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            📊 SBAR Communication Summary
          </h3>
          <p className="text-sm text-gray-400">Structured handoff communication for Tobi's care</p>
        </div>
        
        {!readOnly && (
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-400/30 
                         text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-200"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-400/30 
                           text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-400/30 
                           text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SBAR Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
        {sbarSections.map((section) => {
          const items = isEditing ? editData[section.key] : data[section.key];
          
          return (
            <div
              key={section.key}
              className={`${section.bgColor} ${section.borderColor} border rounded-lg p-3 flex flex-col min-h-0`}
            >
              {/* Section Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{section.icon}</span>
                  <div>
                    <h4 className={`font-bold text-sm ${section.textColor}`}>
                      {section.title}
                    </h4>
                    <p className="text-xs text-gray-400">{section.subtitle}</p>
                  </div>
                </div>
                
                {isEditing && (
                  <button
                    onClick={() => handleItemAdd(section.key)}
                    className={`text-xs px-2 py-1 ${section.bgColor} ${section.borderColor} border 
                               ${section.textColor} rounded hover:opacity-80 transition-opacity`}
                  >
                    + Add
                  </button>
                )}
              </div>

              {/* Section Items */}
              <div className="space-y-1 flex-1 min-h-0 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="text-sm text-gray-500 italic">No items selected</div>
                ) : (
                  items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 bg-black/20 rounded p-1.5"
                    >
                      <CheckCircle className={`w-4 h-4 ${section.textColor} flex-shrink-0 mt-0.5`} />
                      
                      {isEditing ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemEdit(section.key, index, e.target.value)}
                            className="flex-1 bg-black/30 border border-white/20 rounded px-2 py-1 
                                     text-sm text-white focus:outline-none focus:border-white/40"
                          />
                          <button
                            onClick={() => handleItemRemove(section.key, index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-200 flex-1">{item}</span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Item Count */}
              <div className="mt-2 pt-1 border-t border-white/10 flex-shrink-0">
                <span className={`text-xs ${section.textColor} font-medium`}>
                  {items.length} item{items.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SBARChart;
