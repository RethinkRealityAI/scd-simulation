import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Routes, Route } from 'react-router-dom';
import { useInstanceSimulation } from '../context/InstanceSimulationContext';
import { SimulationProvider } from '../context/SimulationContext';
import InstanceWelcomeScreen from './InstanceWelcomeScreen';
import InstanceSimulationScene from './InstanceSimulationScene';
import InstanceResultsScreen from './InstanceResultsScreen';
import { AlertCircle, Loader2 } from 'lucide-react';

const InstanceSimulation: React.FC = () => {
  const { institutionId } = useParams<{ institutionId: string }>();
  const navigate = useNavigate();
  const { state, dispatch, loadInstance } = useInstanceSimulation();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (institutionId && !initialized) {
      loadInstance(institutionId).then(() => {
        setInitialized(true);
      });
    }
  }, [institutionId, initialized, loadInstance]);

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

  if (state.isLoading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Simulation</h2>
          <p className="text-gray-600">Please wait while we load your simulation instance...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Simulation Not Found</h2>
          <p className="text-gray-600 mb-4">
            The simulation instance you're looking for doesn't exist or is not active.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!state.instance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading simulation instance...</p>
        </div>
      </div>
    );
  }

  // Render the instance-specific simulation with routing
  return (
    <SimulationProvider>
      <Routes>
        {/* Welcome screen - default route */}
        <Route path="/" element={<InstanceWelcomeScreen />} />
        
        {/* Scene routes */}
        <Route path="/scene/:sceneId" element={<InstanceSimulationScene />} />
        
        {/* Completion route */}
        <Route path="/completion" element={<InstanceResultsScreen />} />
      </Routes>
    </SimulationProvider>
  );
};

export default InstanceSimulation;