import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import SimulationScene from './components/SimulationScene';
import ResultsScreen from './components/ResultsScreen';
import AdminDashboard from './components/admin/AdminDashboard';
import InstanceSimulation from './components/InstanceSimulation';
import { SimulationProvider } from './context/SimulationContext';
import { InstanceSimulationProvider } from './context/InstanceSimulationContext';

function App() {
  return (
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
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;