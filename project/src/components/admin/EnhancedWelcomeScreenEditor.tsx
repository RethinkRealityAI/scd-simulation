import React, { useState, useEffect } from 'react';
import { 
  DoorOpen, 
  Save, 
  Eye, 
  Edit, 
  Image, 
  Type, 
  Palette, 
  FileText, 
  Users, 
  Database,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2
} from 'lucide-react';
import { useWelcomeConfig, WelcomeConfiguration } from '../../hooks/useWelcomeConfig';
import WelcomeScreenPreview from '../WelcomeScreenPreview';

interface EnhancedWelcomeScreenEditorProps {
  onMessage?: (msg: { type: 'success' | 'error'; text: string }) => void;
}

const EnhancedWelcomeScreenEditor: React.FC<EnhancedWelcomeScreenEditorProps> = ({ onMessage }) => {
  const { 
    config: initialConfig, 
    loading, 
    saveWelcomeConfiguration, 
    exportWelcomeConfiguration,
    importWelcomeConfiguration,
    resetToDefaults 
  } = useWelcomeConfig();
  
  const [config, setConfig] = useState<WelcomeConfiguration>(initialConfig);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [activeSection, setActiveSection] = useState<'visual' | 'content' | 'form' | 'modal'>('visual');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const updateConfig = <K extends keyof WelcomeConfiguration>(key: K, value: WelcomeConfiguration[K]) => {
    setConfig({ ...config, [key]: value });
    setHasChanges(true);
  };

  const updateNestedConfig = (path: string, value: any) => {
    const keys = path.split('.');
    const newConfig = { ...config };
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await saveWelcomeConfiguration(config);
      if (success) {
        setHasChanges(false);
        onMessage?.({ type: 'success', text: 'Welcome screen configuration saved successfully!' });
      } else {
        onMessage?.({ type: 'error', text: 'Failed to save welcome screen configuration.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    const jsonData = await exportWelcomeConfiguration();
    if (jsonData) {
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `welcome-screen-config-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      onMessage?.({ type: 'success', text: 'Configuration exported successfully!' });
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const success = await importWelcomeConfiguration(text);
        if (success) {
          onMessage?.({ type: 'success', text: 'Configuration imported successfully!' });
          setHasChanges(false);
        } else {
          onMessage?.({ type: 'error', text: 'Failed to import configuration.' });
        }
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default configuration? This will discard all unsaved changes.')) {
      resetToDefaults();
      setHasChanges(false);
      onMessage?.({ type: 'success', text: 'Reset to default configuration.' });
    }
  };

  const addFeature = () => {
    const newFeatures = [...config.features, {
      icon: 'Target',
      title: 'New Feature',
      description: 'Feature description',
      color: 'blue'
    }];
    updateConfig('features', newFeatures);
  };

  const updateFeature = (index: number, field: string, value: string) => {
    const newFeatures = [...config.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    updateConfig('features', newFeatures);
  };

  const deleteFeature = (index: number) => {
    const newFeatures = config.features.filter((_, i) => i !== index);
    updateConfig('features', newFeatures);
  };

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation with Title and Actions */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50 px-4 py-3 rounded-t-lg">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'edit'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Edit className="w-4 h-4" />
              Edit Configuration
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'preview'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              Live Preview
            </button>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleImport}
            className="px-3 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-purple-100 text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'edit' ? (
        <div className="grid grid-cols-12 gap-4 flex-1 min-h-0 p-4">
          {/* Section Navigation */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sticky top-0">
              <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Sections</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveSection('visual')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                    activeSection === 'visual'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  <span className="font-medium">Visual Styling</span>
                </button>
                <button
                  onClick={() => setActiveSection('content')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                    activeSection === 'content'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span className="font-medium">Content & Text</span>
                </button>
                <button
                  onClick={() => setActiveSection('form')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                    activeSection === 'form'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Form Fields</span>
                </button>
                <button
                  onClick={() => setActiveSection('modal')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                    activeSection === 'modal'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span className="font-medium">Welcome Modal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section Content */}
          <div className="col-span-9 space-y-4 overflow-y-auto pr-2">
            {/* Visual Styling Section */}
            {activeSection === 'visual' && (
              <>
                {/* Background Settings */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Image className="w-4 h-4 text-blue-600" />
                    Background Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Background Image URL</label>
                      <input
                        type="url"
                        value={config.background_image_url}
                        onChange={(e) => updateConfig('background_image_url', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Blur (0-20px)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={config.background_blur}
                          onChange={(e) => updateConfig('background_blur', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-500">{config.background_blur}px</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Overlay Opacity (0-100%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={config.background_overlay_opacity}
                          onChange={(e) => updateConfig('background_overlay_opacity', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-500">{config.background_overlay_opacity}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Styling */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-600" />
                    Form Styling
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Form Backdrop Blur</label>
                      <select
                        value={config.form_backdrop_blur}
                        onChange={(e) => updateConfig('form_backdrop_blur', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="backdrop-blur-none">None</option>
                        <option value="backdrop-blur-sm">Small</option>
                        <option value="backdrop-blur-md">Medium</option>
                        <option value="backdrop-blur-lg">Large</option>
                        <option value="backdrop-blur-xl">Extra Large</option>
                        <option value="backdrop-blur-2xl">2X Large</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Form BG Opacity (0-100%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={config.form_background_opacity}
                          onChange={(e) => updateConfig('form_background_opacity', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-500">{config.form_background_opacity}%</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Form Border Opacity
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={config.form_border_opacity}
                          onChange={(e) => updateConfig('form_border_opacity', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-500">{config.form_border_opacity}%</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Input Border Opacity
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={config.input_border_opacity}
                          onChange={(e) => updateConfig('input_border_opacity', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-500">{config.input_border_opacity}%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Input Backdrop Blur</label>
                      <select
                        value={config.input_backdrop_blur}
                        onChange={(e) => updateConfig('input_backdrop_blur', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="backdrop-blur-none">None</option>
                        <option value="backdrop-blur-sm">Small</option>
                        <option value="backdrop-blur-md">Medium</option>
                        <option value="backdrop-blur-lg">Large</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Button Gradient (Tailwind classes)</label>
                      <input
                        type="text"
                        value={config.button_gradient}
                        onChange={(e) => updateConfig('button_gradient', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="from-blue-500 to-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Example: from-blue-500 to-purple-500</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Content & Text Section */}
            {activeSection === 'content' && (
              <>
                {/* Main Title & Subtitle */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Type className="w-4 h-4 text-blue-600" />
                    Main Title & Subtitle
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Main Title</label>
                      <input
                        type="text"
                        value={config.main_title}
                        onChange={(e) => updateConfig('main_title', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title Size</label>
                      <select
                        value={config.main_title_size}
                        onChange={(e) => updateConfig('main_title_size', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="text-4xl">Small (4xl)</option>
                        <option value="text-5xl">Medium (5xl)</option>
                        <option value="text-6xl">Large (6xl)</option>
                        <option value="text-7xl">Extra Large (7xl)</option>
                        <option value="text-8xl">2X Large (8xl)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gradient Title Text</label>
                      <input
                        type="text"
                        value={config.gradient_title}
                        onChange={(e) => updateConfig('gradient_title', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gradient Colors (Tailwind)</label>
                      <input
                        type="text"
                        value={config.gradient_colors}
                        onChange={(e) => updateConfig('gradient_colors', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="from-blue-400 via-purple-400 to-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                      <textarea
                        value={config.subtitle}
                        onChange={(e) => updateConfig('subtitle', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle Size</label>
                      <select
                        value={config.subtitle_size}
                        onChange={(e) => updateConfig('subtitle_size', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="text-sm">Small</option>
                        <option value="text-base">Base</option>
                        <option value="text-lg">Large</option>
                        <option value="text-xl">Extra Large</option>
                        <option value="text-2xl">2X Large</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      Features Section
                    </h3>
                    <button
                      onClick={addFeature}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Feature
                    </button>
                  </div>
                  <div className="space-y-4">
                    {config.features.map((feature, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700">Feature {index + 1}</span>
                          <button
                            onClick={() => deleteFeature(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                            <select
                              value={feature.icon}
                              onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            >
                              <option value="Stethoscope">Stethoscope</option>
                              <option value="Brain">Brain</option>
                              <option value="Target">Target</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                            <select
                              value={feature.color}
                              onChange={(e) => updateFeature(index, 'color', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            >
                              <option value="blue">Blue</option>
                              <option value="purple">Purple</option>
                              <option value="cyan">Cyan</option>
                              <option value="green">Green</option>
                              <option value="red">Red</option>
                              <option value="yellow">Yellow</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                          <input
                            type="text"
                            value={feature.title}
                            onChange={(e) => updateFeature(index, 'title', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                          <textarea
                            value={feature.description}
                            onChange={(e) => updateFeature(index, 'description', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Text */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-base font-bold text-gray-900 mb-3">Form Text</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Form Title</label>
                      <input
                        type="text"
                        value={config.form_title}
                        onChange={(e) => updateConfig('form_title', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Form Subtitle</label>
                      <input
                        type="text"
                        value={config.form_subtitle}
                        onChange={(e) => updateConfig('form_subtitle', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                      <input
                        type="text"
                        value={config.button_text}
                        onChange={(e) => updateConfig('button_text', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Data Collection Notice */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-base font-bold text-gray-900 mb-3">Data Collection Notice</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={config.data_collection_title}
                        onChange={(e) => updateConfig('data_collection_title', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Main Text</label>
                      <textarea
                        value={config.data_collection_text}
                        onChange={(e) => updateConfig('data_collection_text', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Form Fields Section */}
            {activeSection === 'form' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Form Fields Configuration
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Configure labels, placeholders, and field requirements. Note: Changing options requires modifying the config directly.
                </p>
                <div className="space-y-6">
                  {Object.entries(config.form_fields).map(([key, field]) => (
                    <div key={key} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3 capitalize">
                        {key.replace(/_/g, ' ')}
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateNestedConfig(`form_fields.${key}.label`, e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        {'placeholder' in field && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder</label>
                            <input
                              type="text"
                              value={field.placeholder}
                              onChange={(e) => updateNestedConfig(`form_fields.${key}.placeholder`, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateNestedConfig(`form_fields.${key}.required`, e.target.checked)}
                            className="rounded"
                          />
                          <label className="text-sm text-gray-700">Required field</label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Section */}
            {activeSection === 'modal' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-600" />
                  Welcome Modal Configuration
                </h3>
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.modal_enabled}
                    onChange={(e) => updateConfig('modal_enabled', e.target.checked)}
                    className="rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">Enable Welcome Modal</label>
                </div>
                <p className="text-sm text-gray-600">
                  Modal configuration is currently managed through code. Advanced modal customization coming soon.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white overflow-hidden flex-1">
          <WelcomeScreenPreview config={config} onExit={() => setActiveTab('edit')} />
        </div>
      )}

      {/* Save Button */}
      {hasChanges && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 font-bold text-lg transition-all flex items-center gap-3 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedWelcomeScreenEditor;

