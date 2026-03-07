/**
 * ResultsScreen — redirects the base simulation completion route to SimulationCompleteScreen.
 * SimulationCompleteScreen auto-reads from SimulationContext.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import SimulationCompleteScreen from './SimulationCompleteScreen';

const ResultsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useSimulation();

  const handleRestart = () => {
    dispatch({ type: 'RESET_SIMULATION' });
    navigate('/');
  };

  return (
    <div
      className="h-screen overflow-hidden relative"
      style={{
        backgroundImage: 'url(https://i.ibb.co/BH6c7SRj/Splas.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 h-full">
        <SimulationCompleteScreen onRestart={handleRestart} />
      </div>
    </div>
  );
};

export default ResultsScreen;