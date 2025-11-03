import React, { useState } from 'react';
import { Edit, Save, X, CheckCircle } from 'lucide-react';

interface SBARData {
  situation: string[];
  background: string[];
  assessment: string[];
  recommendation: string[];
}

interface SBARChartProps {
  data?: SBARData;
  onUpdate?: (newData: SBARData) => void;
  onSBARComplete?: (sbarData: SBARData) => void;
  readOnly?: boolean;
  className?: string;
}

const SBARChart: React.FC<SBARChartProps> = ({ 
  data = {
    situation: [],
    background: [],
    assessment: [],
    recommendation: []
  }, 
  onUpdate, 
  onSBARComplete,
  readOnly = false,
  className = ""
}) => {
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
    if (onSBARComplete) {
      onSBARComplete(editData);
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
    <div className={`w-full h-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden flex flex-col ${className}`}>
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 truncate">
              📊 SBAR Communication Summary
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 truncate">Structured handoff communication for Tobi's care</p>
          </div>
          
          {!readOnly && (
            <div className="flex gap-2 flex-shrink-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-400/30 
                           text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-200 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-400/30 
                             text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-200 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-400/30 
                             text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200 text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable SBAR Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full">
          {sbarSections.map((section) => {
            const items = isEditing ? editData[section.key] : data[section.key];
            
            return (
              <div
                key={section.key}
                className={`${section.bgColor} ${section.borderColor} border rounded-lg p-4 flex flex-col min-h-[200px] max-h-[400px]`}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-lg sm:text-xl flex-shrink-0">{section.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className={`font-bold text-sm sm:text-base ${section.textColor} truncate`}>
                        {section.title}
                      </h4>
                      <p className="text-xs text-gray-400 truncate">{section.subtitle}</p>
                    </div>
                  </div>
                  
                  {isEditing && (
                    <button
                      onClick={() => handleItemAdd(section.key)}
                      className={`text-xs px-2 py-1 ${section.bgColor} ${section.borderColor} border 
                                 ${section.textColor} rounded hover:opacity-80 transition-opacity flex-shrink-0`}
                    >
                      + Add
                    </button>
                  )}
                </div>

                {/* Section Items - Scrollable */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
                  {items.length === 0 ? (
                    <div className="text-sm text-gray-500 italic text-center py-4">
                      No items selected
                    </div>
                  ) : (
                    items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 bg-black/20 rounded p-2 hover:bg-black/30 transition-colors"
                      >
                        <CheckCircle className={`w-4 h-4 ${section.textColor} flex-shrink-0 mt-0.5`} />
                        
                        {isEditing ? (
                          <div className="flex-1 flex gap-2 min-w-0">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => handleItemEdit(section.key, index, e.target.value)}
                              className="flex-1 bg-black/30 border border-white/20 rounded px-2 py-1 
                                       text-sm text-white focus:outline-none focus:border-white/40 min-w-0"
                            />
                            <button
                              onClick={() => handleItemRemove(section.key, index)}
                              className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-200 flex-1 break-words">{item}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Item Count - Fixed at bottom */}
                <div className="mt-3 pt-2 border-t border-white/10 flex-shrink-0">
                  <span className={`text-xs ${section.textColor} font-medium`}>
                    {items.length} item{items.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SBARChart;
