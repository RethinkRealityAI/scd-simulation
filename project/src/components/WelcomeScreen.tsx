import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import WelcomeModal from './WelcomeModal';
import { ArrowRight, Stethoscope, Brain, Target, Clock, Users, Shield, Heart, Scale } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  const [educationLevel, setEducationLevel] = useState('');
  const [organization, setOrganization] = useState('');
  const [school, setSchool] = useState('');
  const [year, setYear] = useState('');
  const [program, setProgram] = useState('');
  const [field, setField] = useState('');
  const [howHeard, setHowHeard] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useSimulation();

  const handleFormSubmit = () => {
    if (!educationLevel || !organization || !school || !year || !program || !field || !howHeard) return;
    
    setShowModal(true);
  };

  const handleStartSimulation = () => {
    dispatch({
      type: 'INITIALIZE_USER',
      payload: { 
        educationLevel, 
        organization, 
        school, 
        year, 
        program, 
        field, 
        howHeard 
      }
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
            <div className="w-full max-w-4xl">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-2 text-center">
                  User Details
                </h3>
                <p className="text-gray-300 text-sm text-center mb-8">
                  Please provide your information to begin
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        Education Level
                      </label>
                      <select
                        value={educationLevel}
                        onChange={(e) => setEducationLevel(e.target.value)}
                        className="w-full p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
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

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        Organization
                      </label>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Enter your organization"
                        className="w-full p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        School
                      </label>
                      <input
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="Enter your school"
                        className="w-full p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        Year
                      </label>
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                        required
                      >
                        <option value="" className="bg-slate-800 text-white">Select your year</option>
                        <option value="1st-year" className="bg-slate-800 text-white">1st Year</option>
                        <option value="2nd-year" className="bg-slate-800 text-white">2nd Year</option>
                        <option value="3rd-year" className="bg-slate-800 text-white">3rd Year</option>
                        <option value="4th-year" className="bg-slate-800 text-white">4th Year</option>
                        <option value="5th-year" className="bg-slate-800 text-white">5th Year</option>
                        <option value="graduate" className="bg-slate-800 text-white">Graduate</option>
                        <option value="post-graduate" className="bg-slate-800 text-white">Post-Graduate</option>
                        <option value="professional" className="bg-slate-800 text-white">Professional</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        Program
                      </label>
                      <input
                        type="text"
                        value={program}
                        onChange={(e) => setProgram(e.target.value)}
                        placeholder="Enter your program"
                        className="w-full p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        Field
                      </label>
                      <input
                        type="text"
                        value={field}
                        onChange={(e) => setField(e.target.value)}
                        placeholder="Enter your field of study/work"
                        className="w-full p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        How did you hear about this simulation?
                      </label>
                      <select
                        value={howHeard}
                        onChange={(e) => setHowHeard(e.target.value)}
                        className="w-full p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                        required
                      >
                        <option value="" className="bg-slate-800 text-white">Select how you heard about this</option>
                        <option value="social-media" className="bg-slate-800 text-white">Social Media</option>
                        <option value="email" className="bg-slate-800 text-white">Email</option>
                        <option value="colleague" className="bg-slate-800 text-white">Colleague/Friend</option>
                        <option value="instructor" className="bg-slate-800 text-white">Instructor/Professor</option>
                        <option value="conference" className="bg-slate-800 text-white">Conference/Event</option>
                        <option value="website" className="bg-slate-800 text-white">Website</option>
                        <option value="search-engine" className="bg-slate-800 text-white">Search Engine</option>
                        <option value="other" className="bg-slate-800 text-white">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button - Full Width */}
                <div className="mt-8">
                  <button
                    onClick={handleFormSubmit}
                    disabled={!educationLevel || !organization || !school || !year || !program || !field || !howHeard}
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
                  <h4 className="text-white font-semibold mb-2 text-sm">Data Collection</h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Within the digital simulation, participant responses will be collected and analysed to see how learners engage with different scenarios and decision points. This information will help highlight common misunderstandings, strengths, and areas where additional guidance is needed. The insights gained will be used to refine the simulation and guide future educational initiatives focused on sickle cell awareness and support.
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