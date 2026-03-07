import React from 'react';
import {
  Activity,
  Play,
  HelpCircle,
  MessageSquare,
  Stethoscope,
  Volume2,
  FileText,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
} from 'lucide-react';
import { SceneComponentLayout, SceneComponentType, SceneData } from '../../../data/scenesData';
import { COMPONENT_REGISTRY, COMPONENT_ORDER, getDefaultLayout } from './componentRegistry';

interface ComponentPaletteProps {
  sceneData: SceneData;
  components: SceneComponentLayout[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onToggleComponent: (id: string) => void;
  onAddComponent: (type: SceneComponentType) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Activity,
  Play,
  HelpCircle,
  MessageSquare,
  Stethoscope,
  Volume2,
  FileText,
};

const TYPE_COLORS: Record<SceneComponentType, string> = {
  'scene-header': 'bg-purple-500',
  'vitals-monitor': 'bg-cyan-500',
  'video-player': 'bg-orange-500',
  'clinical-findings': 'bg-green-500',
  'interactive-panel': 'bg-blue-500',
  'quiz-panel': 'bg-blue-500',
  'action-prompt': 'bg-pink-500',
  'audio-player': 'bg-sky-500',
};

function ComponentPalette({
  sceneData,
  components,
  selectedComponentId,
  onSelectComponent,
  onToggleComponent,
  onAddComponent,
}: ComponentPaletteProps) {
  const [layoutOpen, setLayoutOpen] = React.useState(true);

  const getComponentByType = (type: SceneComponentType) =>
    components.find(c => c.type === type);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Components</h3>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">Toggle to show/hide on canvas</p>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {/* Section: Layout */}
        <button
          onClick={() => setLayoutOpen(v => !v)}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">All Components</span>
          {layoutOpen ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
        </button>

        {layoutOpen && COMPONENT_ORDER.map(type => {
          const def = COMPONENT_REGISTRY[type];
          const comp = getComponentByType(type);
          const isEnabled = comp?.enabled ?? false;
          const isPresent = !!comp;
          const isSelected = selectedComponentId === comp?.id;
          const Icon = ICON_MAP[def.icon] || FileText;

          return (
            <div
              key={type}
              onClick={() => {
                if (isPresent && isEnabled) {
                  onSelectComponent(comp.id);
                } else if (!isPresent) {
                  onAddComponent(type);
                } else {
                  onToggleComponent(comp.id);
                }
              }}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                ${isSelected
                  ? 'bg-blue-500/20 border border-blue-400/40'
                  : isEnabled
                    ? 'bg-white/5 border border-white/10 hover:border-blue-400/30 hover:bg-blue-500/10'
                    : 'bg-white/5 border border-white/5 opacity-50 hover:opacity-70'
                }
              `}
            >
              {/* Icon */}
              <div className={`w-8 h-8 rounded-lg ${TYPE_COLORS[type]} flex items-center justify-center flex-shrink-0 ${isEnabled ? 'opacity-100' : 'opacity-50'}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>

              {/* Label + description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-blue-300' : 'text-gray-200'}`}>
                    {def.label}
                  </span>
                  {isSelected && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded-full leading-none font-medium">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-tight truncate mt-0.5">{def.description}</p>
              </div>

              {/* Toggle switch */}
              <div
                onClick={e => {
                  e.stopPropagation();
                  if (isPresent) {
                    onToggleComponent(comp.id);
                  } else {
                    onAddComponent(type);
                  }
                }}
                className="flex-shrink-0"
              >
                {isPresent ? (
                  <div
                    className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${isEnabled ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                    />
                  </div>
                ) : (
                  <button
                    className="w-6 h-6 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                    title="Add component"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div className="flex-shrink-0 px-4 py-2.5 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {components.filter(c => c.enabled).length} of {components.length} active
          </span>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 text-green-400" />
            <span className="text-green-400 font-medium">Live preview</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComponentPalette;
