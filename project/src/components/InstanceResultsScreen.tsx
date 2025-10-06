import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstanceSimulation } from '../context/InstanceSimulationContext';
import CompletionResults from './CompletionResults';
import { 
  CheckCircle, 
  Clock, 
  Award, 
  TrendingUp, 
  Download, 
  Share2,
  RotateCcw,
  Home,
  BarChart3,
  FileText,
  Users,
  Calendar,
  Target,
  Brain,
  Stethoscope
} from 'lucide-react';

const InstanceResultsScreen: React.FC = () => {
  const { institutionId } = useParams<{ institutionId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useInstanceSimulation();
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Apply instance-specific branding
  useEffect(() => {
    if (state.instance?.branding_config) {
      const branding = state.instance.branding_config;
      
      // Apply CSS custom properties
      const root = document.documentElement;
      root.style.setProperty('--primary-color', branding.primary_color);
      root.style.setProperty('--secondary-color', branding.secondary_color);
      root.style.setProperty('--accent-color', branding.accent_color);
      root.style.setProperty('--background-color', branding.background_color);
      root.style.setProperty('--text-color', branding.text_color);
      root.style.setProperty('--font-family', branding.font_family);

      // Apply custom CSS if provided
      if (branding.custom_css) {
        const styleId = 'instance-custom-css';
        let existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = branding.custom_css;
        document.head.appendChild(style);
      }
    }
  }, [state.instance]);

  // Calculate simulation statistics
  const totalScenes = state.userData.totalScenes;
  const completedScenes = state.userData.completedScenes.size;
  const completionRate = totalScenes > 0 ? (completedScenes / totalScenes) * 100 : 0;
  const totalTimeSpent = Array.from(state.userData.completedScenes).reduce((total, sceneId) => {
    const sceneData = state.sessionData.find(s => s.scene_id === sceneId);
    return total + (sceneData?.time_spent || 0);
  }, 0);

  // Calculate average quiz score
  const quizScores = Array.from(state.userData.completedScenes).map(sceneId => {
    const sceneData = state.sessionData.find(s => s.scene_id === sceneId);
    return sceneData?.quiz_score || 0;
  });
  const averageQuizScore = quizScores.length > 0 
    ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length 
    : 0;

  // Calculate SBAR completion rate
  const sbarCompleted = state.sessionData.filter(s => s.sbar_completed).length;
  const sbarCompletionRate = completedScenes > 0 ? (sbarCompleted / completedScenes) * 100 : 0;

  const handleSubmitResults = async () => {
    setIsSubmitting(true);
    setSubmissionStatus('idle');

    try {
      // Create comprehensive results data
      const resultsData = {
        institution_id: state.instance?.institution_id,
        instance_id: state.instance?.id,
        user_data: {
          education_level: state.userData.educationLevel,
          organization: state.userData.organization,
          school: state.userData.school,
          year: state.userData.year,
          program: state.userData.program,
          field: state.userData.field,
          how_heard: state.userData.howHeard
        },
        simulation_results: {
          total_scenes: totalScenes,
          completed_scenes: completedScenes,
          completion_rate: completionRate,
          total_time_spent: totalTimeSpent,
          average_quiz_score: averageQuizScore,
          sbar_completion_rate: sbarCompletionRate,
          session_data: state.sessionData
        },
        timestamp: new Date().toISOString(),
        completion_date: new Date().toISOString()
      };

      // Send to instance-specific webhook if configured
      if (state.instance?.webhook_url) {
        try {
          const response = await fetch(state.instance.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': state.instance.webhook_secret ? `Bearer ${state.instance.webhook_secret}` : '',
            },
            body: JSON.stringify(resultsData),
          });

          if (!response.ok) {
            throw new Error(`Webhook failed: ${response.status}`);
          }

          console.log('Results sent to instance webhook successfully');
          setSubmissionStatus('success');
        } catch (error) {
          console.error('Failed to send results to instance webhook:', error);
          setSubmissionStatus('error');
        }
      } else {
        // Store locally if no webhook configured
        dispatch({
          type: 'STORE_SESSION_DATA',
          payload: resultsData,
        });
        setSubmissionStatus('success');
      }
    } catch (error) {
      console.error('Failed to submit results:', error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestartSimulation = () => {
    dispatch({ type: 'RESET_SIMULATION' });
    navigate(`/sim/${institutionId}`);
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  if (!state.instance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Simulation Not Found</h2>
          <p className="text-gray-600">The simulation instance you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: state.instance.branding_config.background_color || '#f8fafc',
        color: state.instance.branding_config.text_color || '#1f2937',
        fontFamily: state.instance.branding_config.font_family || 'Inter, sans-serif'
      }}
    >
      {/* Instance-specific header */}
      <div 
        className="bg-white shadow-sm border-b border-gray-200"
        style={{ 
          backgroundColor: state.instance.branding_config.primary_color + '10',
          borderColor: state.instance.branding_config.primary_color + '20'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {state.instance.branding_config.logo_url && (
                <img 
                  src={state.instance.branding_config.logo_url} 
                  alt={state.instance.institution_name}
                  className="h-8 w-auto"
                />
              )}
              <div>
                <h1 
                  className="text-lg font-semibold"
                  style={{ color: state.instance.branding_config.primary_color }}
                >
                  {state.instance.name} - Simulation Complete
                </h1>
                <p className="text-sm text-gray-600">{state.instance.institution_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleReturnHome}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Home className="w-4 h-4" />
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: state.instance.branding_config.primary_color }}
          >
            Simulation Complete!
          </h1>
          <p className="text-lg text-gray-600">
            Congratulations on completing the {state.instance.name} simulation
          </p>
        </div>

        {/* Results Summary */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{completionRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {completedScenes} of {totalScenes} scenes completed
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor(totalTimeSpent / 60000)}:{(Math.floor(totalTimeSpent / 1000) % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Time spent in simulation</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quiz Score</p>
                <p className="text-2xl font-bold text-gray-900">{averageQuizScore.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Average quiz performance</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SBAR Completion</p>
                <p className="text-2xl font-bold text-gray-900">{sbarCompletionRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Stethoscope className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Communication exercises</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={handleSubmitResults}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{
              backgroundColor: state.instance.branding_config.primary_color,
              background: `linear-gradient(135deg, ${state.instance.branding_config.primary_color}, ${state.instance.branding_config.secondary_color})`
            }}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting Results...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Submit Results
              </>
            )}
          </button>

          <button
            onClick={() => setShowDetailedResults(!showDetailedResults)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700
                     hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            {showDetailedResults ? 'Hide' : 'Show'} Detailed Results
          </button>

          <button
            onClick={handleRestartSimulation}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700
                     hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Simulation
          </button>
        </div>

        {/* Submission Status */}
        {submissionStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">Results submitted successfully!</p>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Your simulation results have been sent to {state.instance.institution_name}.
            </p>
          </div>
        )}

        {submissionStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 text-red-600">⚠</div>
              <p className="text-red-800 font-medium">Failed to submit results</p>
            </div>
            <p className="text-red-700 text-sm mt-1">
              There was an error submitting your results. Please try again or contact support.
            </p>
          </div>
        )}

        {/* Detailed Results */}
        {showDetailedResults && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
            <CompletionResults 
              userData={state.userData}
              sessionData={state.sessionData}
              totalScenes={totalScenes}
            />
          </div>
        )}

        {/* Institution Information */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Simulation Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Institution</h4>
              <p className="text-gray-600">{state.instance.institution_name}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Simulation</h4>
              <p className="text-gray-600">{state.instance.name}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Completion Date</h4>
              <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Session ID</h4>
              <p className="text-gray-600 font-mono text-sm">{state.instance.institution_id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstanceResultsScreen;
