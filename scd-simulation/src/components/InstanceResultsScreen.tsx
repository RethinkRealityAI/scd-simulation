import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import CompletionResults from './CompletionResults';

const InstanceResultsScreen: React.FC = () => {
  const { state } = useSimulation();

  if (!state.instance) {
    return <div>No instance data available.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Simulation Results</h2>
        <p className="text-gray-600">Review your performance and simulation details.</p>
      </div>

      <CompletionResults />

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
  );
};

export default InstanceResultsScreen;
