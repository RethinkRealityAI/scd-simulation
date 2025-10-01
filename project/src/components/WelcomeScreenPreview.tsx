import React, { useState } from 'react';
import { ArrowRight, Stethoscope, Brain, Target, X } from 'lucide-react';
import { WelcomeConfiguration } from '../hooks/useWelcomeConfig';

interface WelcomeScreenPreviewProps {
  config: WelcomeConfiguration;
  onExit?: () => void;
}

const iconMap: { [key: string]: any } = {
  Stethoscope,
  Brain,
  Target,
};

const WelcomeScreenPreview: React.FC<WelcomeScreenPreviewProps> = ({ config, onExit }) => {
  const [formData, setFormData] = useState({
    educationLevel: '',
    organization: '',
    school: '',
    year: '',
    program: '',
    field: '',
    howHeard: ''
  });

  const isFormValid = () => {
    return (
      (!config.form_fields.education_level.required || formData.educationLevel) &&
      (!config.form_fields.organization.required || formData.organization) &&
      (!config.form_fields.school.required || formData.school) &&
      (!config.form_fields.year.required || formData.year) &&
      (!config.form_fields.program.required || formData.program) &&
      (!config.form_fields.field.required || formData.field) &&
      (!config.form_fields.how_heard.required || formData.howHeard)
    );
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

  return (
    <div 
      className="relative h-full w-full overflow-auto"
      style={{
        backgroundImage: `url(${config.background_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: config.background_blur > 0 ? `blur(${config.background_blur}px)` : 'none'
      }}
    >
      {/* Optional Exit Button (contained within preview) */}
      {onExit && (
        <button
          onClick={onExit}
          className="absolute top-3 right-3 z-20 px-3 py-2 rounded-md bg-black/60 text-white hover:bg-black/70 transition-colors flex items-center gap-2 text-sm"
        >
          <X className="w-4 h-4" />
          Exit Preview
        </button>
      )}

      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black z-0"
        style={{ opacity: config.background_overlay_opacity / 100 }}
      ></div>

      <div className="relative z-10 h-full flex p-8">
        {/* Left Side - Content */}
        <div className="flex-1 flex items-center justify-center">
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
        <div className="flex-1 flex flex-col items-center justify-center">
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
                  {/* Education Level */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      {config.form_fields.education_level.label}
                      {config.form_fields.education_level.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <select
                      value={formData.educationLevel}
                      onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
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

                  {/* Organization */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      {config.form_fields.organization.label}
                      {config.form_fields.organization.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder={config.form_fields.organization.placeholder}
                      className={`w-full p-3 rounded-2xl bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                      required={config.form_fields.organization.required}
                    />
                  </div>

                  {/* School */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      {config.form_fields.school.label}
                      {config.form_fields.school.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.school}
                      onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      placeholder={config.form_fields.school.placeholder}
                      className={`w-full p-3 rounded-2xl bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                      required={config.form_fields.school.required}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      {config.form_fields.year.label}
                      {config.form_fields.year.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
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

                  {/* Program */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      {config.form_fields.program.label}
                      {config.form_fields.program.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      placeholder={config.form_fields.program.placeholder}
                      className={`w-full p-3 rounded-2xl bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                      required={config.form_fields.program.required}
                    />
                  </div>

                  {/* Field */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      {config.form_fields.field.label}
                      {config.form_fields.field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.field}
                      onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                      placeholder={config.form_fields.field.placeholder}
                      className={`w-full p-3 rounded-2xl bg-white/${config.form_background_opacity} ${config.input_backdrop_blur} border border-white/${config.input_border_opacity} text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                      required={config.form_fields.field.required}
                    />
                  </div>

                  {/* How Heard */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      {config.form_fields.how_heard.label}
                      {config.form_fields.how_heard.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <select
                      value={formData.howHeard}
                      onChange={(e) => setFormData({ ...formData, howHeard: e.target.value })}
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

              {/* Submit Button */}
              <div className="mt-8">
                <button
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
  );
};

export default WelcomeScreenPreview;

