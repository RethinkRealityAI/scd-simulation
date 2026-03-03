import React from 'react';
import { X, Maximize2 } from 'lucide-react';
import { SceneData, SceneComponentType, defaultVitalsVisibility } from '../../../data/scenesData';
import { VideoEmbedValue } from '../VideoEmbedInput';
import { COMPONENT_REGISTRY } from './componentRegistry';
import ComponentConfigurator from './ComponentConfigurator';

export interface ComponentEditorModalProps {
  selectedType: SceneComponentType;
  sceneData: SceneData;
  videoEmbed: VideoEmbedValue;
  onSceneDataChange: (field: keyof SceneData, value: SceneData[keyof SceneData]) => void;
  onVitalsChange: (field: keyof SceneData['vitals'], value: SceneData['vitals'][keyof SceneData['vitals']]) => void;
  onVisibilityToggle: (field: keyof typeof defaultVitalsVisibility) => void;
  onVitalColorChange: (field: string, color: string) => void;
  onVideoEmbedChange: (value: VideoEmbedValue) => void;
  onArrayItemAdd: (field: 'clinicalFindings' | 'discussionPrompts') => void;
  onArrayItemRemove: (field: 'clinicalFindings' | 'discussionPrompts', index: number) => void;
  onArrayItemUpdate: (field: 'clinicalFindings' | 'discussionPrompts', index: number, value: string) => void;
  onClose: () => void;
}

const ComponentEditorModal: React.FC<ComponentEditorModalProps> = ({
  selectedType,
  onClose,
  sceneData,
  videoEmbed,
  onSceneDataChange,
  onVitalsChange,
  onVisibilityToggle,
  onVitalColorChange,
  onVideoEmbedChange,
  onArrayItemAdd,
  onArrayItemRemove,
  onArrayItemUpdate,
}) => {
  const def = COMPONENT_REGISTRY[selectedType];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-3xl max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{def.label} — Full Editor</h2>
              <p className="text-xs text-gray-500">Changes apply to the scene immediately</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            title="Close full editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content — ComponentConfigurator fills the modal body */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ComponentConfigurator
            selectedType={selectedType}
            sceneData={sceneData}
            videoEmbed={videoEmbed}
            onSceneDataChange={onSceneDataChange}
            onVitalsChange={onVitalsChange}
            onVisibilityToggle={onVisibilityToggle}
            onVitalColorChange={onVitalColorChange}
            onVideoEmbedChange={onVideoEmbedChange}
            onArrayItemAdd={onArrayItemAdd}
            onArrayItemRemove={onArrayItemRemove}
            onArrayItemUpdate={onArrayItemUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default ComponentEditorModal;
