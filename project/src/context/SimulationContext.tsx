import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ScoringCategory, scenes } from '../data/scenesData';

export interface UserResponse {
  questionId: string;
  sceneId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: number;
}

export interface CategoryScore {
  category: ScoringCategory;
  correct: number;
  total: number;
  percentage: number;
}

export interface UserData {
  id: string; // Changed from userId to id to match schema requirements
  age: string;
  educationLevel: string;
  startTime: number;
  responses: UserResponse[];
  currentScene: number;
  totalScenes: number;
  completedScenes: Set<number>;
  categoryScores: CategoryScore[];
}

interface SimulationState {
  userData: UserData;
  isLoading: boolean;
  error: string | null;
}

type SimulationAction =
  | { type: 'INITIALIZE_USER'; payload: { age: string; educationLevel: string } }
  | { type: 'ADD_RESPONSE'; payload: UserResponse }
  | { type: 'SET_CURRENT_SCENE'; payload: number }
  | { type: 'COMPLETE_SCENE'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_SIMULATION' }
  | { type: 'RESET_SCENE_STATE' };

const initialState: SimulationState = {
  userData: {
    id: '',
    age: '',
    educationLevel: '',
    startTime: 0,
    responses: [],
    currentScene: 0,
    totalScenes: 9, // 9 main scenes + 1 completion scene (Scene 10)
    completedScenes: new Set(),
    categoryScores: [],
  },
  isLoading: false,
  error: null,
};

function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'INITIALIZE_USER':
      // Generate random ID automatically (not user ID)
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        ...state,
        userData: {
          ...state.userData,
          id,
          age: action.payload.age,
          educationLevel: action.payload.educationLevel,
          startTime: Date.now(),
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
      console.log('Completing scene:', action.payload, 'New completed scenes:', Array.from(newCompletedScenes));
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
    case 'RESET_SIMULATION':
      return initialState;
    case 'RESET_SCENE_STATE':
      return state;
    default:
      return state;
  }
}

// Helper function to calculate category scores
const calculateCategoryScores = (responses: UserResponse[]): CategoryScore[] => {
  const categoryMap: Record<ScoringCategory, { correct: number; total: number }> = {
    timelyPainManagement: { correct: 0, total: 0 },
    clinicalJudgment: { correct: 0, total: 0 },
    communication: { correct: 0, total: 0 },
    culturalSafety: { correct: 0, total: 0 },
    biasMitigation: { correct: 0, total: 0 },
  };

  // Process each response
  responses.forEach(response => {
    const scene = scenes.find(s => s.id === response.sceneId);
    if (scene?.scoringCategories) {
      scene.scoringCategories.forEach(category => {
        categoryMap[category].total += 1;
        if (response.isCorrect) {
          categoryMap[category].correct += 1;
        }
      });
    }
  });

  // Convert to CategoryScore array
  return Object.entries(categoryMap).map(([category, stats]) => ({
    category: category as ScoringCategory,
    correct: stats.correct,
    total: stats.total,
    percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
  }));
};

const SimulationContext = createContext<{
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
  calculateScore: () => number;
  calculateCategoryScores: () => CategoryScore[];
  sendDataToWebhook: () => Promise<void>;
} | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(simulationReducer, initialState);

  const calculateScore = (): number => {
    const correctResponses = state.userData.responses.filter(r => r.isCorrect).length;
    const totalResponses = state.userData.responses.length;
    return totalResponses > 0 ? Math.round((correctResponses / totalResponses) * 100) : 0;
  };

  const calculateCategoryScoresFunc = (): CategoryScore[] => {
    return calculateCategoryScores(state.userData.responses);
  };

  const sendDataToWebhook = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const completionTime = Date.now() - state.userData.startTime;
      const score = calculateScore();
      const categoryScores = calculateCategoryScoresFunc();
      
      // Ensure all required data points are included for webhook transmission
      const payload = {
        id: state.userData.id, // Using ID instead of userId
        demographics: {
          age: state.userData.age,
          educationLevel: state.userData.educationLevel,
        },
        sessionData: {
          startTime: state.userData.startTime,
          completionTime,
          timestamp: new Date().toISOString(), // Added explicit timestamp
          totalScenes: state.userData.totalScenes,
          completedScenes: Array.from(state.userData.completedScenes),
        },
        // All user answers to each scene question
        responses: state.userData.responses.map(response => ({
          questionId: response.questionId,
          sceneId: response.sceneId,
          answer: response.answer,
          isCorrect: response.isCorrect,
          timeSpent: response.timeSpent,
          timestamp: new Date(response.timestamp).toISOString(),
        })),
        // Category-based scoring
        categoryScores: categoryScores.map(cs => ({
          category: cs.category,
          correct: cs.correct,
          total: cs.total,
          percentage: cs.percentage,
        })),
        finalScore: score,
        submissionTimestamp: new Date().toISOString(), // Final submission timestamp
      };

      // Webhook transmission to specified endpoint
      const response = await fetch('https://hook.us2.make.com/255f21cb3adzdqw4kobc89b981g1jmie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to send data to webhook');
      }

      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error sending data to webhook:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send data. Please try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <SimulationContext.Provider value={{ 
      state, 
      dispatch, 
      calculateScore, 
      calculateCategoryScores: calculateCategoryScoresFunc, 
      sendDataToWebhook 
    }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}