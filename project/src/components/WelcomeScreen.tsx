import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import WelcomeModal from './WelcomeModal';
import { ArrowRight, Stethoscope, Brain, Target, Clock, Users, Shield, Heart, Scale } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  const [age, setAge] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useSimulation();

  const handleFormSubmit = () => {
    if (!age || !educationLevel) return;
    
    setShowModal(true);
  };

  const handleStartSimulation = () => {
    dispatch({
      type: 'INITIALIZE_USER',
      payload: { age, educationLevel }
    });
    
    navigate('/scene/1');
  };

  return (
    <>
      <div 
        className="h-screen overflow-hidden relative"
        style={{
          backgroundImage: 'url(https://i.ibb.co/BH6c7SRj/Splas.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Enhanced dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/70"></div>

        <div className="relative z-10 h-full flex">
          {/* Left Side - Content */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
              {/* Main Heading */}
              <div className="mb-12">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  Sickle Cell
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Vaso-Occlusive Crisis Care
                  </span>
                  <br />
                  Digital Simulation
                </h1>
                <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                  Enhance your cultural and medical competency when treating youth with sickle cell disease 
                  experiencing vaso-occlusive crises during hospital admission.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20">
                    <Stethoscope className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Interactive Scenarios</h3>
                  <p className="text-gray-300 text-sm">Realistic patient scenarios with comprehensive assessment tools</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Evidence-Based Learning</h3>
                  <p className="text-gray-300 text-sm">Focus on cultural sensitivity and treatment protocols</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20">
                    <Target className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Real-Time Assessment</h3>
                  <p className="text-gray-300 text-sm">Immediate feedback with performance analytics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
            {/* Registration Form */}
            <div className="w-full max-w-md">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-2 text-center">
                  User Details
                </h3>
                <p className="text-gray-300 text-sm text-center mb-6">
                  Please provide your information to begin
                </p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      Age Range
                    </label>
                    <select
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                      required
                    >
                      <option value="" className="bg-slate-800 text-white">Select your age range</option>
                      <option value="18-25" className="bg-slate-800 text-white">18-25 years</option>
                      <option value="26-35" className="bg-slate-800 text-white">26-35 years</option>
                      <option value="36-45" className="bg-slate-800 text-white">36-45 years</option>
                      <option value="46-55" className="bg-slate-800 text-white">46-55 years</option>
                      <option value="56-65" className="bg-slate-800 text-white">56-65 years</option>
                      <option value="65+" className="bg-slate-800 text-white">65+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      Education Level
                    </label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                      required
                    >
                      <option value="" className="bg-slate-800 text-white">Select your education level</option>
                      <option value="nursing-diploma" className="bg-slate-800 text-white">Nursing Diploma</option>
                      <option value="nursing-associate" className="bg-slate-800 text-white">Associate Degree in Nursing</option>
                      <option value="nursing-bachelor" className="bg-slate-800 text-white">Bachelor of Science in Nursing</option>
                      <option value="nursing-master" className="bg-slate-800 text-white">Master of Science in Nursing</option>
                      <option value="md" className="bg-slate-800 text-white">Doctor of Medicine (MD)</option>
                      <option value="do" className="bg-slate-800 text-white">Doctor of Osteopathic Medicine (DO)</option>
                      <option value="resident" className="bg-slate-800 text-white">Medical Resident</option>
                      <option value="fellow" className="bg-slate-800 text-white">Medical Fellow</option>
                      <option value="attending" className="bg-slate-800 text-white">Attending Physician</option>
                      <option value="other" className="bg-slate-800 text-white">Other Healthcare Professional</option>
                    </select>
                  </div>

                  <button
                    onClick={handleFormSubmit}
                    disabled={!age || !educationLevel}
                    className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg
                             disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                             enabled:hover:from-blue-400 enabled:hover:to-purple-400 
                             transition-all duration-300 transform enabled:hover:scale-[1.02] enabled:hover:shadow-xl
                             flex items-center justify-center gap-3"
                  >
                    Begin Simulation
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Enhanced Footer with Data Collection Info */}
              <div className="text-center mt-8 space-y-4">
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <h4 className="text-white font-semibold mb-2 text-sm">Anonymous Data Collection</h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Your responses will be collected anonymously to analyze learning patterns and improve educational content. This research helps identify knowledge gaps and strengthen future training programs for healthcare providers caring for patients with sickle cell disease.
                  </p>
                </div>
                <div className="text-gray-400 text-xs">
                  <p>This simulation is designed for healthcare education and research purposes.</p>
                  <p className="mt-1">All data is anonymized and contributes to improving sickle cell care education.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Modal */}
      <WelcomeModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onStart={handleStartSimulation}
      />
    </>
  );
};

export default WelcomeScreen;