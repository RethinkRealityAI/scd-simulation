import { SceneComponentType, SceneComponentLayout } from '../../../data/scenesData';

export interface ComponentDefinition {
  type: SceneComponentType;
  label: string;
  description: string;
  icon: string;
  defaultLayout: Omit<SceneComponentLayout, 'id' | 'type' | 'enabled'>;
  minW: number;
  minH: number;
  maxW?: number;
  maxH?: number;
  singleton: boolean;
  dataField?: string;
  /** If true the component is a legacy alias and should not appear in the palette. */
  hidden?: boolean;
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
    defaultLayout: { x: 0, y: 2, w: 3, h: 8, minW: 2, minH: 5 },
    minW: 2,
    minH: 5,
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
  'interactive-panel': {
    type: 'interactive-panel',
    label: 'Interactive Panel',
    description: 'Quiz, action prompts, SBAR, discussion — all in one sequential flow',
    icon: 'HelpCircle',
    defaultLayout: { x: 9, y: 2, w: 3, h: 8, minW: 3, minH: 4 },
    minW: 3,
    minH: 4,
    singleton: true,
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
  // Legacy aliases — kept for backward compat, hidden from palette
  'quiz-panel': {
    type: 'quiz-panel',
    label: 'Quiz Panel',
    description: '(Legacy) Use Interactive Panel instead',
    icon: 'HelpCircle',
    defaultLayout: { x: 9, y: 2, w: 3, h: 8, minW: 3, minH: 4 },
    minW: 3,
    minH: 4,
    singleton: true,
    dataField: 'quiz',
    hidden: true,
  },
  'action-prompt': {
    type: 'action-prompt',
    label: 'Action Prompt',
    description: '(Legacy) Use Interactive Panel instead',
    icon: 'MessageSquare',
    defaultLayout: { x: 9, y: 2, w: 3, h: 8, minW: 3, minH: 4 },
    minW: 3,
    minH: 4,
    singleton: true,
    dataField: 'actionPrompt',
    hidden: true,
  },
};

/** Ordered list for display in the palette (excludes hidden/legacy entries) */
export const COMPONENT_ORDER: SceneComponentType[] = [
  'scene-header',
  'vitals-monitor',
  'video-player',
  'clinical-findings',
  'interactive-panel',
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
