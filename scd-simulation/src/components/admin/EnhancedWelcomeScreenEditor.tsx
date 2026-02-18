import React, { useState, useEffect } from 'react';
import { Building2, Globe, Edit, Eye, Upload, Download, Image, Type, Users, Save, Palette } from 'lucide-react';
import { useWelcomeConfig, WelcomeConfiguration } from '../../hooks/useWelcomeConfig';
import WelcomeScreenPreview from '../WelcomeScreenPreview';

interface EnhancedWelcomeScreenEditorProps {
  instanceId?: string;
}

const EnhancedWelcomeScreenEditor: React.FC<EnhancedWelcomeScreenEditorProps> = ({ instanceId }) => {
  const { config: initialConfig, loading, saveWelcomeConfiguration, refreshConfig } = useWelcomeConfig(instanceId);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [activeSection, setActiveSection] = useState<'visual' | 'content' | 'form'>('visual');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localConfig, setLocalConfig] = useState<WelcomeConfiguration | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (initialConfig) {
      setLocalConfig(initialConfig);
    }
  }, [initialConfig]);

  const updateConfig = (key: keyof WelcomeConfiguration, value: WelcomeConfiguration[keyof WelcomeConfiguration]) => {
    if (!localConfig) return;
    setLocalConfig({ ...localConfig, [key]: value });
    setHasChanges(true);
  };

  const updateNestedConfig = (path: string, value: string | boolean | number) => {
    if (!localConfig) return;

    const parts = path.split('.');

    if (parts.length === 2) {
      const [parent, child] = parts;

      if (parent === 'branding') {
        setLocalConfig({
          ...localConfig,
          branding: { ...localConfig.branding, [child]: value }
        });
      } else if (parent === 'form_fields') {
        // This shouldn't happen with current usage, but handle it
        setLocalConfig({
          ...localConfig,
          [parent]: { ...localConfig[parent], [child]: value }
        });
      }
    } else if (parts.length === 3) {
      const [parent, field, prop] = parts;

      if (parent === 'form_fields') {
        setLocalConfig({
          ...localConfig,
          form_fields: {
            ...localConfig.form_fields,
            [field]: {
              ...localConfig.form_fields[field as keyof typeof localConfig.form_fields],
              [prop]: value
            }
          }
        });
      }
    }

    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!localConfig) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const success = await saveWelcomeConfiguration(localConfig);
      if (success) {
        setHasChanges(false);
        setSaveMessage({ type: 'success', text: 'Configuration saved successfully!' });
        setTimeout(() => setSaveMessage(null), 3000);
        refreshConfig();
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save configuration. Please try again.' });
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      setSaveMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleImport = () => {
    // Placeholder for import functionality
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedConfig = JSON.parse(e.target?.result as string);
            setLocalConfig({ ...importedConfig, instance_id: instanceId });
            setHasChanges(true);
          } catch (error) {
            console.error('Invalid config file', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    if (!localConfig) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localConfig, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "welcome_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (loading && !localConfig) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!localConfig) return null;

  // Use localConfig as config for rendering
  const config = localConfig;

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation with Title and Actions */}
      <div className={`flex items-center justify-between border-b border-gray-200 px-4 py-3 rounded-t-lg ${instanceId ? 'bg-indigo-50/50' : 'bg-gray-50/50'}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
            {instanceId ? (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Instance Config
              </span>
            ) : (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Global Config
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'edit'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              <Edit className="w-4 h-4" />
              Edit Configuration
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'preview'
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
        </div>
      </div>

      {/* Save Message Toast */}
      {saveMessage && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${saveMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
          {saveMessage.type === 'success' ? '✓' : '✗'}
          <span>{saveMessage.text}</span>
        </div>
      )}

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
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${activeSection === 'visual'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Image className="w-4 h-4" />
                  <span className="font-medium">Visual Styling</span>
                </button>
                <button
                  onClick={() => setActiveSection('content')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${activeSection === 'content'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Type className="w-4 h-4" />
                  <span className="font-medium">Content & Text</span>
                </button>
                <button
                  onClick={() => setActiveSection('form')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${activeSection === 'form'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Form Fields</span>
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
                        value={config.branding.background_image || ''}
                        onChange={(e) => updateNestedConfig('branding.background_image', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Form BG Opacity (0-100%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={parseInt(config.form_background_opacity) || 10}
                          onChange={(e) => updateConfig('form_background_opacity', e.target.value)}
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
                          value={parseInt(config.form_border_opacity) || 20}
                          onChange={(e) => updateConfig('form_border_opacity', e.target.value)}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-500">{config.form_border_opacity}%</span>
                      </div>
                    </div>
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
                  </div>
                </div>

                {/* Branding Colors */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-600" />
                    Branding Colors
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                      <input
                        type="text"
                        value={config.branding.primary_color}
                        onChange={(e) => updateNestedConfig('branding.primary_color', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                      <input
                        type="text"
                        value={config.branding.secondary_color}
                        onChange={(e) => updateNestedConfig('branding.secondary_color', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="indigo"
                      />
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
                        value={config.title}
                        onChange={(e) => updateConfig('title', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  Configure labels and field requirements.
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
