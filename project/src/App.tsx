import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import SimulationScene from './components/SimulationScene';
import ResultsScreen from './components/ResultsScreen';
import VideoUploadAdmin from './components/VideoUploadAdmin';
import { SimulationProvider } from './context/SimulationContext';

function App() {
  return (
    <SimulationProvider>
      <Router>
        <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/scene/:sceneId" element={<SimulationScene />} />
            <Route path="/completion" element={<ResultsScreen />} />
            <Route path="/admin/videos" element={<VideoUploadAdmin />} />
          </Routes>
        </div>
      </Router>
    </SimulationProvider>
  );
}

export default App;