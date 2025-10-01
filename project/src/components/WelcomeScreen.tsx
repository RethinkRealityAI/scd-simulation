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
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
              {/* Main Heading */}
              <div className="mb-12">
                <h1 className={`${config.main_title_size} md:${config.main_title_size} font-bold text-white mb-6 leading-tight`}>
                  {config.main_title}
                  <br />
                  <span className={`bg-gradient-to-r ${config.gradient_colors} bg-clip-text text-transparent`}>
                    {config.gradient_title}
                  </span>
                  <br />
                  Digital Simulation
                </h1>
                <p className={`${config.subtitle_size} text-gray-200 mb-8 leading-relaxed`}>
                  {config.subtitle}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {config.features.map((feature, index) => {
                  const IconComponent = iconMap[feature.icon] || Target;
                  const colors = getColorClasses(feature.color);
                  return (
                    <div key={index} className="text-center">
                      <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20`}>
                        <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                      <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-300 text-sm">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side - Registration */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
            {/* Registration Form */}
            <div className="w-full max-w-4xl">
              <div 
                className={`bg-white/${config.form_background_opacity} ${config.form_backdrop_blur} rounded-3xl p-8 border border-white/${config.form_border_opacity} shadow-2xl`}
              >
                <h3 className="text-2xl font-bold text-white mb-2 text-center">
                  {config.form_title}
                </h3>
                <p className="text-gray-300 text-sm text-center mb-8">
                  {config.form_subtitle}
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        {config.form_fields.education_level.label}
                        {config.form_fields.education_level.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <select
                        value={educationLevel}
                        onChange={(e) => setEducationLevel(e.target.value)}
                        className={`w-full p-3 rounded-2xl bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer`}
                        required={config.form_fields.education_level.required}
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
                      <label className="block text-sm font-medium text-white mb-3">
                        {config.form_fields.organization.label}
                        {config.form_fields.organization.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder={config.form_fields.organization.placeholder}
                        className={`w-full p-3 rounded-2xl bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                        required={config.form_fields.organization.required}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        {config.form_fields.school.label}
                        {config.form_fields.school.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <input
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder={config.form_fields.school.placeholder}
                        className={`w-full p-3 rounded-2xl bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                        required={config.form_fields.school.required}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        {config.form_fields.year.label}
                        {config.form_fields.year.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className={`w-full p-3 rounded-2xl bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer`}
                        required={config.form_fields.year.required}
                      >
                        <option value="" className="bg-slate-800 text-white">Select your year</option>
                        {config.form_fields.year.options.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-slate-800 text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        {config.form_fields.program.label}
                        {config.form_fields.program.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <input
                        type="text"
                        value={program}
                        onChange={(e) => setProgram(e.target.value)}
                        placeholder={config.form_fields.program.placeholder}
                        className={`w-full p-3 rounded-2xl bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                        required={config.form_fields.program.required}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        {config.form_fields.field.label}
                        {config.form_fields.field.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <input
                        type="text"
                        value={field}
                        onChange={(e) => setField(e.target.value)}
                        placeholder={config.form_fields.field.placeholder}
                        className={`w-full p-3 rounded-2xl bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                        required={config.form_fields.field.required}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        {config.form_fields.how_heard.label}
                        {config.form_fields.how_heard.required && <span className="text-red-400 ml-1">*</span>}
                      </label>
                      <select
                        value={howHeard}
                        onChange={(e) => setHowHeard(e.target.value)}
                        className={`w-full p-3 rounded-2xl bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer`}
                        required={config.form_fields.how_heard.required}
                      >
                        <option value="" className="bg-slate-800 text-white">Select how you heard about this</option>
                        {config.form_fields.how_heard.options.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-slate-800 text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button - Full Width */}
                <div className="mt-8">
                  <button
                    onClick={handleFormSubmit}
                    disabled={!isFormValid()}
                    className={`w-full py-4 px-8 rounded-2xl bg-gradient-to-r ${config.button_gradient} text-white font-semibold text-lg
                             disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                             enabled:hover:from-blue-400 enabled:hover:to-purple-400 
                             transition-all duration-300 transform enabled:hover:scale-[1.02] enabled:hover:shadow-xl
                             flex items-center justify-center gap-3`}
                  >
                    {config.button_text}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Data Collection Footer */}
              <div className="text-center mt-8 space-y-4">
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
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
    </>
  );
};

export default WelcomeScreen;