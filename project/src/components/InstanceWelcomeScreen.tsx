import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstanceSimulation } from '../context/InstanceSimulationContext';
import WelcomeModal from './WelcomeModal';
import { ArrowRight, Stethoscope, Brain, Target, Shield, Users, Award } from 'lucide-react';
import { useWelcomeConfig } from '../hooks/useWelcomeConfig';

const iconMap: { [key: string]: any } = {
  Stethoscope,
  Brain,
  Target,
  Shield,
  Users,
  Award,
};

const InstanceWelcomeScreen: React.FC = () => {
  const { state, dispatch } = useInstanceSimulation();
  const { config, loading } = useWelcomeConfig();

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
  const [educationLevel, setEducationLevel] = useState('');
  const [organization, setOrganization] = useState('');
  const [school, setSchool] = useState('');
  const [year, setYear] = useState('');
  const [program, setProgram] = useState('');
  const [field, setField] = useState('');
  const [howHeard, setHowHeard] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

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

  const isFormValid = () => {
    return (
      (!config.form_fields.education_level.required || educationLevel) &&
      (!config.form_fields.organization.required || organization) &&
      (!config.form_fields.school.required || school) &&
      (!config.form_fields.year.required || year) &&
      (!config.form_fields.program.required || program) &&
      (!config.form_fields.field.required || field) &&
      (!config.form_fields.how_heard.required || howHeard)
    );
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
        educationLevel, 
        organization, 
        school, 
        year, 
        program, 
        field, 
        howHeard,
        instanceId: state.instance?.id || ''
      }
    });
    
    navigate(`/sim/${state.instance?.institution_id}/scene/1`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading simulation...</p>
        </div>
      </div>
    );
  }

  if (!state.instance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Simulation Not Found</h2>
          <p className="text-gray-600">The simulation instance you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
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
              <h1 className={`${config.main_title_size} md:${config.main_title_size} font-bold text-white mb-4 leading-tight`}>
                {config.main_title}
                <br />
                <span className={`bg-gradient-to-r ${config.gradient_colors} bg-clip-text text-transparent`}>
                  {config.gradient_title}
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
                const Icon = iconMap[feature.icon] || Stethoscope;
                const colors = getColorClasses(feature.color);
                return (
                  <div key={index} className="text-center">
                    <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center mx-auto mb-2 backdrop-blur-sm border border-white/20`}>
                      <Icon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    <h3 className="text-white font-semibold mb-1 text-sm">{feature.title}</h3>
                    <p className="text-gray-300 text-xs">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 relative">
          {/* Registration Form */}
          <div className="w-full max-w-xl">
            <div 
              className={`bg-white/${config.form_background_opacity} ${config.form_backdrop_blur} rounded-2xl p-6 border border-white/${config.form_border_opacity} shadow-2xl`}
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{config.form_title}</h3>
                <p className="text-gray-300 text-sm">{config.form_subtitle}</p>
              </div>

              <div className="space-y-6">
                {/* Form Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {config.form_fields.education_level.required && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          {config.form_fields.education_level.label}*
                        </label>
                        <select
                          value={educationLevel}
                          onChange={(e) => setEducationLevel(e.target.value)}
                          className={`w-full p-2 rounded-lg bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer`}
                        >
                          <option value="" className="bg-slate-800 text-white">Select your education level</option>
                          {config.form_fields.education_level.options.map((option, index) => (
                            <option key={index} value={option.value} className="bg-slate-800 text-white">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {config.form_fields.organization.required && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          {config.form_fields.organization.label}*
                        </label>
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder={config.form_fields.organization.placeholder}
                          className={`w-full p-2 rounded-lg bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                        />
                      </div>
                    )}

                    {config.form_fields.school.required && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          {config.form_fields.school.label}*
                        </label>
                        <input
                          type="text"
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                          placeholder={config.form_fields.school.placeholder}
                          className={`w-full p-2 rounded-lg bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {config.form_fields.year.required && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          {config.form_fields.year.label}*
                        </label>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className={`w-full p-2 rounded-lg bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer`}
                        >
                          <option value="" className="bg-slate-800 text-white">Select your year</option>
                          {config.form_fields.year.options.map((option, index) => (
                            <option key={index} value={option.value} className="bg-slate-800 text-white">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {config.form_fields.program.required && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          {config.form_fields.program.label}*
                        </label>
                        <input
                          type="text"
                          value={program}
                          onChange={(e) => setProgram(e.target.value)}
                          placeholder={config.form_fields.program.placeholder}
                          className={`w-full p-2 rounded-lg bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                        />
                      </div>
                    )}

                    {config.form_fields.field.required && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          {config.form_fields.field.label}*
                        </label>
                        <input
                          type="text"
                          value={field}
                          onChange={(e) => setField(e.target.value)}
                          placeholder={config.form_fields.field.placeholder}
                          className={`w-full p-2 rounded-lg bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                        />
                      </div>
                    )}

                    {config.form_fields.how_heard.required && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          {config.form_fields.how_heard.label}*
                        </label>
                        <select
                          value={howHeard}
                          onChange={(e) => setHowHeard(e.target.value)}
                          className={`w-full p-2 rounded-lg bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer`}
                        >
                          <option value="" className="bg-slate-800 text-white">Select how you heard about this</option>
                          {config.form_fields.how_heard.options.map((option, index) => (
                            <option key={index} value={option.value} className="bg-slate-800 text-white">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    onClick={handleFormSubmit}
                    disabled={!isFormValid()}
                    className={`w-full py-3 px-6 rounded-lg bg-gradient-to-r ${config.button_gradient} text-white font-semibold text-base
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
              <div className="text-center mt-6 space-y-3">
                <div className="p-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                  <h4 className="text-white font-semibold mb-2 text-sm">{config.data_collection_title}</h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    {config.data_collection_text}
                  </p>
                </div>
                <div className="text-gray-400 text-xs">
                  {config.data_collection_footer.map((text, index) => (
                    <p key={index} className={index > 0 ? 'mt-1' : ''}>{text}</p>
                  ))}
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
    </div>
  );
};

export default InstanceWelcomeScreen;