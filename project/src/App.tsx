import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import SimulationScene from './components/SimulationScene';
import ResultsScreen from './components/ResultsScreen';
import AdminDashboard from './components/admin/AdminDashboard';
import InstanceSimulation from './components/InstanceSimulation';
import { SimulationProvider } from './context/SimulationContext';
import { InstanceSimulationProvider } from './context/InstanceSimulationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLogin from './components/admin/AdminLogin';

const AdminRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="h-screen overflow-hidden">
          <Routes>
            {/* Main simulation routes */}
            <Route path="/" element={
              <SimulationProvider>
                <WelcomeScreen />
              </SimulationProvider>
            } />
            <Route path="/scene/:sceneId" element={
              <SimulationProvider>
                <SimulationScene />
              </SimulationProvider>
            } />
            <Route path="/completion" element={
              <SimulationProvider>
                <ResultsScreen />
              </SimulationProvider>
            } />

            {/* Instance-specific simulation routes */}
            <Route path="/sim/:institutionId/*" element={
              <InstanceSimulationProvider>
                <InstanceSimulation />
              </InstanceSimulationProvider>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;