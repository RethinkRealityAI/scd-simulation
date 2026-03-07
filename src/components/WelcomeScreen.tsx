import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import WelcomeModal from './WelcomeModal';
import { ArrowRight, Stethoscope, Brain, Target } from 'lucide-react';
import { useWelcomeConfig } from '../hooks/useWelcomeConfig';

const iconMap: { [key: string]: any } = {
  Stethoscope,
  Brain,
  Target,
};

const WelcomeScreen: React.FC = () => {
  const { config, loading } = useWelcomeConfig();
  const [userType, setUserType] = useState<'student' | 'professional'>('student');
  const [educationLevel, setEducationLevel] = useState('');
  const [organization, setOrganization] = useState('');
  const [school, setSchool] = useState('');
  const [program, setProgram] = useState('');
  const [field, setField] = useState('');
  const [howHeard, setHowHeard] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useSimulation();

  const isFormValid = () => {
    if (!howHeard) return false;

    if (userType === 'student') {
      return school && educationLevel && program;
    } else {
      return organization && field;
    }
  };

  const handleFormSubmit = () => {
    if (!isFormValid()) return;

    if (config.modal_enabled) {
      setShowModal(true);
    } else {
      handleStartSimulation();
    }
  };

  const handleStartSimulation = () => {
    dispatch({
      type: 'INITIALIZE_USER',
      payload: {
        name: 'Anonymous',
        userType,
        educationLevel: userType === 'student' ? educationLevel : '',
        organization: userType === 'professional' ? organization : '',
        school: userType === 'student' ? school : '',
        year: '',
        program: userType === 'student' ? program : '',
        field: userType === 'professional' ? field : '',
        howHeard
      }
    });

    navigate('/scene/1');
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; icon: string } } = {
      blue: { bg: 'bg-blue-500/20', icon: 'text-blue-400' },
      purple: { bg: 'bg-purple-500/20', icon: 'text-purple-400' },
      cyan: { bg: 'bg-cyan-500/20', icon: 'text-cyan-400' },
      green: { bg: 'bg-green-500/20', icon: 'text-green-400' },
      red: { bg: 'bg-red-500/20', icon: 'text-red-400' },
      yellow: { bg: 'bg-yellow-500/20', icon: 'text-yellow-400' },
    };
    return colorMap[color] || colorMap.blue;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <div
        className="h-screen overflow-hidden relative"
        style={{
          backgroundImage: `url(${config.background_image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: config.background_blur > 0 ? `blur(${config.background_blur}px)` : 'none'
        }}
      >
        {/* Dark overlay with configurable opacity */}
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: config.background_overlay_opacity / 100 }}
        ></div>

        <div className="relative z-10 h-full flex">
          {/* Left Side - Content */}
          <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
            <div className="max-w-2xl w-full">
              {/* Main Heading */}
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  <span className={`bg-gradient-to-r ${config.gradient_colors} bg-clip-text text-transparent`}>
                    Sickle Cell Vaso-occlusive Crisis Care
                  </span>
                  <br />
                  Digital Simulation
                </h1>
                <p className={`${config.subtitle_size} text-gray-200 mb-6 leading-relaxed`}>
                  {config.subtitle}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {config.features.map((feature, index) => {
                  const IconComponent = iconMap[feature.icon] || Target;
                  const colors = getColorClasses(feature.color);
                  return (
                    <div key={index} className="text-center">
                      <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center mx-auto mb-2 backdrop-blur-sm border border-white/20`}>
                        <IconComponent className={`w-5 h-5 ${colors.icon}`} />
                      </div>
                      <h3 className="text-white font-semibold mb-1 text-sm">{feature.title}</h3>
                      <p className="text-gray-300 text-xs">{feature.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Research Purpose Text */}
              <div className="text-gray-400 text-xs text-center mt-12 px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                {config.data_collection_footer.map((text, index) => (
                  <p key={index} className={index > 0 ? 'mt-1' : ''}>{text}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Registration */}
          <div className="flex-1 flex flex-col items-center p-4 lg:p-6 relative overflow-y-auto">
            {/* Registration Form */}
            <div className="w-full max-w-lg m-auto">
              <div
                className={`bg-white/${config.form_background_opacity} ${config.form_backdrop_blur} rounded-2xl p-4 md:p-6 border border-white/${config.form_border_opacity} shadow-2xl`}
              >
                <h3 className="text-xl font-bold text-white mb-1 text-center">
                  {config.form_title}
                </h3>
                <p className="text-gray-300 text-sm text-center mb-4">
                  {config.form_subtitle}
                </p>

                {/* User Type Tabs */}
                <div className="flex p-1 bg-white/5 backdrop-blur-lg rounded-xl mb-4 border border-white/10">
                  <button
                    onClick={() => setUserType('student')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${userType === 'student'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    Student
                  </button>
                  <button
                    onClick={() => setUserType('professional')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${userType === 'professional'
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    Professional
                  </button>
                </div>

                <div className="space-y-3">
                  {userType === 'student' ? (
                    <>
                      {/* Student Fields */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          School <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                          placeholder="Enter your school"
                          className={`w-full p-2 rounded-lg bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Education Level <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={educationLevel}
                          onChange={(e) => setEducationLevel(e.target.value)}
                          className={`w-full p-2 rounded-lg bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer`}
                          required
                        >
                          <option value="" className="bg-slate-800 text-white">Select your education level</option>
                          {config.form_fields.education_level.options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-slate-800 text-white">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Program <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={program}
                          onChange={(e) => setProgram(e.target.value)}
                          placeholder="Enter your program"
                          className={`w-full p-2 rounded-lg bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Professional Fields */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Organization <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="Enter your organization"
                          className={`w-full p-2 rounded-lg bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Field of Work <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={field}
                          onChange={(e) => setField(e.target.value)}
                          placeholder="Enter your field of work"
                          className={`w-full p-2 rounded-lg bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Common Field: How Heard */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      How did you hear about this simulation? <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={howHeard}
                      onChange={(e) => setHowHeard(e.target.value)}
                      className={`w-full p-2 rounded-lg bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer`}
                      required
                    >
                      <option value="" className="bg-slate-800 text-white">Select an option</option>
                      {config.form_fields.how_heard.options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-slate-800 text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit Button - Full Width */}
                <div className="mt-4">
                  <button
                    onClick={handleFormSubmit}
                    disabled={!isFormValid()}
                    className={`w-full py-2.5 px-6 rounded-lg bg-gradient-to-r ${config.button_gradient} text-white font-semibold text-base
                             disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                             enabled:hover:from-blue-400 enabled:hover:to-purple-400 
                             transition-all duration-300 transform enabled:hover:scale-[1.02] enabled:hover:shadow-lg
                             flex items-center justify-center gap-2`}
                  >
                    {config.button_text}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Data Collection Footer */}
              <div className="text-center mt-4 space-y-2">
                <div className="p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <h4 className="text-white font-semibold mb-2 text-sm">{config.data_collection_title}</h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    {config.data_collection_text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Modal */}
      {config.modal_enabled && (
        <WelcomeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onStart={handleStartSimulation}
        />
      )}
    </>
  );
};

export default WelcomeScreen;