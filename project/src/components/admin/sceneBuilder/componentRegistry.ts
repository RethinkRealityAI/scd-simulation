import { SceneComponentType, SceneComponentLayout } from '../../../data/scenesData';

export interface ComponentDefinition {
  type: SceneComponentType;
  label: string;
  description: string;
  icon: string; // lucide icon name (used as string key)
  defaultLayout: Omit<SceneComponentLayout, 'id' | 'type' | 'enabled'>;
  /** Minimum dimensions in grid units */
  minW: number;
  minH: number;
  maxW?: number;
  maxH?: number;
  /** Whether this component can coexist with another component of this type */
  singleton: boolean;
  /** What scene data field this component depends on (undefined = always available) */
  dataField?: string;
}

export const COMPONENT_REGISTRY: Record<SceneComponentType, ComponentDefinition> = {
  'scene-header': {
    type: 'scene-header',
    label: 'Scene Header',
    description: 'Title and description displayed at the top of the scene',
    icon: 'FileText',
    defaultLayout: { x: 0, y: 0, w: 12, h: 2, minW: 4, minH: 1, maxH: 3 },
    minW: 4,
    minH: 1,
    maxH: 3,
    singleton: true,
  },
  'vitals-monitor': {
    type: 'vitals-monitor',
    label: 'Health Diagnostics',
    description: 'Patient vitals monitor (HR, BP, SpO₂, temp, pain, etc.)',
    icon: 'Activity',
    defaultLayout: { x: 0, y: 2, w: 3, h: 8, minW: 2, minH: 4 },
    minW: 2,
    minH: 4,
    singleton: true,
  },
  'video-player': {
    type: 'video-player',
    label: 'Video Player',
    description: 'Scene video or interactive iframe embed',
    icon: 'Play',
    defaultLayout: { x: 3, y: 2, w: 6, h: 6, minW: 3, minH: 3 },
    minW: 3,
    minH: 3,
    singleton: true,
    dataField: 'videoUrl',
  },
  'clinical-findings': {
    type: 'clinical-findings',
    label: 'Clinical Findings',
    description: 'Bullet-point list of clinical observations for the scene',
    icon: 'Stethoscope',
    defaultLayout: { x: 3, y: 8, w: 6, h: 2, minW: 2, minH: 1 },
    minW: 2,
    minH: 1,
    singleton: true,
    dataField: 'clinicalFindings',
  },
  'quiz-panel': {
    type: 'quiz-panel',
    label: 'Quiz Panel',
    description: 'Knowledge-check questions for this scene',
    icon: 'HelpCircle',
    defaultLayout: { x: 9, y: 2, w: 3, h: 8, minW: 2, minH: 3 },
    minW: 2,
    minH: 3,
    singleton: true,
    dataField: 'quiz',
  },
  'action-prompt': {
    type: 'action-prompt',
    label: 'Action Prompt',
    description: 'Clinical decision activity (action-select, SBAR, reflection)',
    icon: 'MessageSquare',
    defaultLayout: { x: 9, y: 2, w: 3, h: 8, minW: 2, minH: 3 },
    minW: 2,
    minH: 3,
    singleton: true,
    dataField: 'actionPrompt',
  },
  'audio-player': {
    type: 'audio-player',
    label: 'Character Audio',
    description: 'Audio dialogue players associated with the scene',
    icon: 'Volume2',
    defaultLayout: { x: 3, y: 8, w: 6, h: 2, minW: 3, minH: 1 },
    minW: 3,
    minH: 1,
    singleton: true,
  },
};

/** Ordered list for display in the palette */
export const COMPONENT_ORDER: SceneComponentType[] = [
  'scene-header',
  'vitals-monitor',
  'video-player',
  'clinical-findings',
  'quiz-panel',
  'action-prompt',
  'audio-player',
];

export function getDefaultLayout(type: SceneComponentType): SceneComponentLayout {
  const def = COMPONENT_REGISTRY[type];
  return {
    id: type,
    type,
    enabled: true,
    ...def.defaultLayout,
    minW: def.minW,
    minH: def.minH,
    ...(def.maxW ? { maxW: def.maxW } : {}),
    ...(def.maxH ? { maxH: def.maxH } : {}),
  };
}
