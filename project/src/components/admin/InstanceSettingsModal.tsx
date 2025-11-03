import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, AlertCircle, CheckCircle, Palette, Globe, Shield } from 'lucide-react';
import { SimulationInstance } from '../../hooks/useSimulationInstances';

interface InstanceSettingsModalProps {
  instance: SimulationInstance;
  onClose: () => void;
  onSave: (id: string, updates: Partial<SimulationInstance>) => Promise<void>;
}

const InstanceSettingsModal: React.FC<InstanceSettingsModalProps> = ({ instance, onClose, onSave }) => {
  const [editedInstance, setEditedInstance] = useState<SimulationInstance>(instance);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'branding' | 'webhook' | 'content'>('basic');

  useEffect(() => {
    setEditedInstance(instance);
  }, [instance]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await onSave(instance.id, editedInstance);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save instance settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SimulationInstance, value: any) => {
    setEditedInstance(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBrandingChange = (field: keyof SimulationInstance['branding_config'], value: any) => {
    setEditedInstance(prev => ({
      ...prev,
      branding_config: {
        ...prev.branding_config,
        [field]: value
      }
    }));
  };

  const handleContentChange = (field: keyof SimulationInstance['content_config'], value: any) => {
    setEditedInstance(prev => ({
      ...prev,
      content_config: {
        ...prev.content_config,
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Instance Settings</h2>
              <p className="text-blue-100 mt-1">{instance.name} - {instance.institution_name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-1 p-4">
            {[
              { id: 'basic', label: 'Basic Info', icon: '⚙️' },
              { id: 'branding', label: 'Branding', icon: '🎨' },
              { id: 'webhook', label: 'Webhook', icon: '🔗' },
              { id: 'content', label: 'Content', icon: '📄' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instance Name</label>
                  <input
                    type="text"
                    value={editedInstance.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
                  <input
                    type="text"
                    value={editedInstance.institution_name}
                    onChange={(e) => handleInputChange('institution_name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editedInstance.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={editedInstance.session_timeout_minutes}
                    onChange={(e) => handleInputChange('session_timeout_minutes', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="5"
                    max="480"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Sessions Per Day</label>
                  <input
                    type="number"
                    value={editedInstance.max_sessions_per_day || ''}
                    onChange={(e) => handleInputChange('max_sessions_per_day', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editedInstance.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editedInstance.requires_approval}
                      onChange={(e) => handleInputChange('requires_approval', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Requires Approval</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editedInstance.branding_config.primary_color}
                      onChange={(e) => handleBrandingChange('primary_color', e.target.value)}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editedInstance.branding_config.primary_color}
                      onChange={(e) => handleBrandingChange('primary_color', e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editedInstance.branding_config.secondary_color}
                      onChange={(e) => handleBrandingChange('secondary_color', e.target.value)}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editedInstance.branding_config.secondary_color}
                      onChange={(e) => handleBrandingChange('secondary_color', e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editedInstance.branding_config.accent_color}
                      onChange={(e) => handleBrandingChange('accent_color', e.target.value)}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editedInstance.branding_config.accent_color}
                      onChange={(e) => handleBrandingChange('accent_color', e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editedInstance.branding_config.background_color}
                      onChange={(e) => handleBrandingChange('background_color', e.target.value)}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editedInstance.branding_config.background_color}
                      onChange={(e) => handleBrandingChange('background_color', e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editedInstance.branding_config.text_color}
                      onChange={(e) => handleBrandingChange('text_color', e.target.value)}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editedInstance.branding_config.text_color}
                      onChange={(e) => handleBrandingChange('text_color', e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                  <select
                    value={editedInstance.branding_config.font_family}
                    onChange={(e) => handleBrandingChange('font_family', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input
                  type="url"
                  value={editedInstance.branding_config.logo_url || ''}
                  onChange={(e) => handleBrandingChange('logo_url', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS</label>
                <textarea
                  value={editedInstance.branding_config.custom_css || ''}
                  onChange={(e) => handleBrandingChange('custom_css', e.target.value)}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                  placeholder="/* Custom CSS styles */"
                />
              </div>
            </div>
          )}

          {/* Webhook Tab */}
          {activeTab === 'webhook' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                <input
                  type="url"
                  value={editedInstance.webhook_url || ''}
                  onChange={(e) => handleInputChange('webhook_url', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/webhook"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Secret</label>
                <input
                  type="password"
                  value={editedInstance.webhook_secret || ''}
                  onChange={(e) => handleInputChange('webhook_secret', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Secret key for webhook authentication"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Retry Count</label>
                  <input
                    type="number"
                    value={editedInstance.webhook_retry_count}
                    onChange={(e) => handleInputChange('webhook_retry_count', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (seconds)</label>
                  <input
                    type="number"
                    value={editedInstance.webhook_timeout_seconds}
                    onChange={(e) => handleInputChange('webhook_timeout_seconds', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="5"
                    max="300"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Webhook Payload Format</h4>
                <p className="text-sm text-blue-800 mb-2">
                  The webhook will receive a POST request with the following JSON structure:
                </p>
                <pre className="text-xs text-blue-700 bg-blue-100 p-2 rounded overflow-x-auto">
{`{
  "instance_id": "uuid",
  "institution_id": "string",
  "session_id": "string",
  "demographics": { ... },
  "sessionData": { ... },
  "responses": [ ... ],
  "categoryScores": [ ... ],
  "finalScore": 85,
  "submissionTimestamp": "2024-01-01T00:00:00Z"
}`}
                </pre>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Content configuration is complex and requires JSON editing. 
                  Advanced content management will be added in a future update.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scene Order</label>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Current scene order:</p>
                  <div className="flex flex-wrap gap-2">
                    {(editedInstance.content_config.scene_order || []).map((sceneId, index) => (
                      <span key={sceneId} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {index + 1}. Scene {sceneId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Disabled Features</label>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Currently disabled features:</p>
                  <div className="flex flex-wrap gap-2">
                    {(editedInstance.content_config.disabled_features || []).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstanceSettingsModal;