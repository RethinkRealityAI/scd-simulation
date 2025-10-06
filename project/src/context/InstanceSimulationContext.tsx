import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SimulationInstance } from '../hooks/useSimulationInstances';

export interface InstanceUserData {
  id: string;
  educationLevel: string;
  organization: string;
  school: string;
  year: string;
  program: string;
  field: string;
  howHeard: string;
  startTime: number;
  responses: UserResponse[];
  currentScene: number;
  totalScenes: number;
  completedScenes: Set<number>;
  categoryScores: CategoryScore[];
  instanceId: string;
}

export interface UserResponse {
  questionId: string;
  sceneId: number;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: number;
}

export interface CategoryScore {
  category: string;
  correct: number;
  total: number;
  percentage: number;
}

interface InstanceSimulationState {
  userData: InstanceUserData;
  instance: SimulationInstance | null;
  isLoading: boolean;
  error: string | null;
}

type InstanceSimulationAction =
  | { type: 'INITIALIZE_USER'; payload: Partial<InstanceUserData> }
  | { type: 'ADD_RESPONSE'; payload: UserResponse }
  | { type: 'SET_CURRENT_SCENE'; payload: number }
  | { type: 'COMPLETE_SCENE'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INSTANCE'; payload: SimulationInstance }
  | { type: 'RESET_SCENE_STATE' };

const initialState: InstanceSimulationState = {
  userData: {
    id: '',
    educationLevel: '',
    organization: '',
    school: '',
    year: '',
    program: '',
    field: '',
    howHeard: '',
    startTime: 0,
    responses: [],
    currentScene: 0,
    totalScenes: 10,
    completedScenes: new Set(),
    categoryScores: [],
    instanceId: ''
  },
  instance: null,
  isLoading: false,
  error: null,
};

function instanceSimulationReducer(state: InstanceSimulationState, action: InstanceSimulationAction): InstanceSimulationState {
  switch (action.type) {
    case 'INITIALIZE_USER':
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        ...state,
        userData: {
          ...state.userData,
          id,
          educationLevel: action.payload.educationLevel || '',
          organization: action.payload.organization || '',
          school: action.payload.school || '',
          year: action.payload.year || '',
          program: action.payload.program || '',
          field: action.payload.field || '',
          howHeard: action.payload.howHeard || '',
          startTime: Date.now(),
          instanceId: action.payload.instanceId || '',
        },
      };
    case 'ADD_RESPONSE':
      return {
        ...state,
        userData: {
          ...state.userData,
          responses: [...state.userData.responses, action.payload],
        },
      };
    case 'SET_CURRENT_SCENE':
      return {
        ...state,
        userData: {
          ...state.userData,
          currentScene: action.payload,
        },
      };
    case 'COMPLETE_SCENE':
      const newCompletedScenes = new Set([...state.userData.completedScenes, action.payload]);
      return {
        ...state,
        userData: {
          ...state.userData,
          completedScenes: newCompletedScenes,
        },
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_INSTANCE':
      return { ...state, instance: action.payload };
    case 'RESET_SCENE_STATE':
      return {
        ...state,
        userData: {
          ...state.userData,
          currentScene: 0,
          completedScenes: new Set(),
          responses: [],
        },
      };
    default:
      return state;
  }
}

const calculateCategoryScores = (responses: UserResponse[]): CategoryScore[] => {
  const categoryStats: { [key: string]: { correct: number; total: number } } = {};
  
  responses.forEach(response => {
    // Extract category from questionId (assuming format like "scene1_question1_category")
    const category = response.questionId.split('_').pop() || 'general';
    
    if (!categoryStats[category]) {
      categoryStats[category] = { correct: 0, total: 0 };
    }
    
    categoryStats[category].total++;
    if (response.isCorrect) {
      categoryStats[category].correct++;
    }
  });

  return Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    correct: stats.correct,
    total: stats.total,
    percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
  }));
};

const InstanceSimulationContext = createContext<{
  state: InstanceSimulationState;
  dispatch: React.Dispatch<InstanceSimulationAction>;
  calculateScore: () => number;
  calculateCategoryScores: () => CategoryScore[];
  sendDataToWebhook: () => Promise<void>;
  loadInstance: (institutionId: string) => Promise<void>;
} | null>(null);

export function InstanceSimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(instanceSimulationReducer, initialState);

  const calculateScore = (): number => {
    const correctResponses = state.userData.responses.filter(r => r.isCorrect).length;
    const totalResponses = state.userData.responses.length;
    return totalResponses > 0 ? Math.round((correctResponses / totalResponses) * 100) : 0;
  };

  const calculateCategoryScoresFunc = (): CategoryScore[] => {
    return calculateCategoryScores(state.userData.responses);
  };

  const loadInstance = useCallback(async (institutionId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { data, error } = await supabase
        .from('simulation_instances')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      dispatch({ type: 'SET_INSTANCE', payload: data });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error loading instance:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load simulation instance' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const sendDataToWebhook = async (): Promise<void> => {
    if (!state.instance) {
      console.error('No instance loaded');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const completionTime = Date.now() - state.userData.startTime;
      const score = calculateScore();
      const categoryScores = calculateCategoryScoresFunc();
      
      const payload = {
        instance_id: state.instance.id,
        institution_id: state.instance.institution_id,
        session_id: state.userData.id,
        demographics: {
          educationLevel: state.userData.educationLevel,
          organization: state.userData.organization,
          school: state.userData.school,
          year: state.userData.year,
          program: state.userData.program,
          field: state.userData.field,
          howHeard: state.userData.howHeard,
        },
        sessionData: {
          startTime: state.userData.startTime,
          completionTime,
          timestamp: new Date().toISOString(),
          totalScenes: state.userData.totalScenes,
          completedScenes: Array.from(state.userData.completedScenes),
        },
        responses: state.userData.responses.map(response => ({
          questionId: response.questionId,
          sceneId: response.sceneId,
          answer: response.answer,
          isCorrect: response.isCorrect,
          timeSpent: response.timeSpent,
          timestamp: new Date(response.timestamp).toISOString(),
        })),
        categoryScores: categoryScores.map(cs => ({
          category: cs.category,
          correct: cs.correct,
          total: cs.total,
          percentage: cs.percentage,
        })),
        finalScore: score,
        submissionTimestamp: new Date().toISOString(),
      };

      // Save to instance-specific session data
      try {
        const dbPayload = {
          instance_id: state.instance.id,
          session_id: payload.session_id,
          user_demographics: payload.demographics,
          responses: payload.responses,
          category_scores: categoryScores.reduce((acc, cs) => {
            acc[cs.category] = cs.percentage;
            return acc;
          }, {} as Record<string, number>),
          final_score: payload.finalScore,
          completion_time: payload.sessionData.completionTime,
          completed_scenes: payload.sessionData.completedScenes,
          start_time: new Date(payload.sessionData.startTime).toISOString(),
          completion_time: new Date().toISOString(),
          submission_timestamp: payload.submissionTimestamp
        };
        
        const { error: dbError } = await supabase
          .from('instance_session_data')
          .insert(dbPayload);

        if (dbError) {
          console.error('Error saving to instance session data:', dbError);
        } else {
          console.log('Successfully saved to instance session data');
        }
      } catch (dbError) {
        console.error('Error saving to instance session data:', dbError);
      }

      // Send to webhook if configured
      if (state.instance.webhook_url) {
        try {
          const webhookPayload = {
            ...payload,
            webhook_secret: state.instance.webhook_secret
          };

          const response = await fetch(state.instance.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(state.instance.webhook_secret && {
                'Authorization': `Bearer ${state.instance.webhook_secret}`
              })
            },
            body: JSON.stringify(webhookPayload),
          });

          if (!response.ok) {
            throw new Error(`Webhook failed with status: ${response.status}`);
          }

          console.log('Successfully sent data to webhook');
        } catch (webhookError) {
          console.error('Error sending to webhook:', webhookError);
          // Don't throw here - we still want to save to database
        }
      }

      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error sending data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send data. Please try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <InstanceSimulationContext.Provider
      value={{
        state,
        dispatch,
        calculateScore,
        calculateCategoryScores: calculateCategoryScoresFunc,
        sendDataToWebhook,
        loadInstance
      }}
    >
      {children}
    </InstanceSimulationContext.Provider>
  );
}

export function useInstanceSimulation() {
  const context = useContext(InstanceSimulationContext);
  if (!context) {
    throw new Error('useInstanceSimulation must be used within an InstanceSimulationProvider');
  }
  return context;
}
