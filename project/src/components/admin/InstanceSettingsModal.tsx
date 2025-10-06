import React, { useState, useEffect } from 'react';
import { X, Building2, Link, Palette, Settings, Save, RefreshCw } from 'lucide-react';
import { SimulationInstance } from '../../hooks/useSimulationInstances';

interface InstanceSettingsModalProps {
  instance: SimulationInstance;
  onClose: () => void;
  onSave: (id: string, updates: Partial<SimulationInstance>) => Promise<void>;
}

const InstanceSettingsModal: React.FC<InstanceSettingsModalProps> = ({ 
  instance, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    name: instance.name,
    institution_name: instance.institution_name,
    description: instance.description || '',
    webhook_url: instance.webhook_url || '',
    webhook_secret: instance.webhook_secret || '',
    primary_color: instance.branding_config.primary_color,
    secondary_color: instance.branding_config.secondary_color,
    accent_color: instance.branding_config.accent_color,
    background_color: instance.branding_config.background_color,
    text_color: instance.branding_config.text_color,
    font_family: instance.branding_config.font_family,
    is_active: instance.is_active,
    requires_approval: instance.requires_approval,
    max_sessions_per_day: instance.max_sessions_per_day || '',
    session_timeout_minutes: instance.session_timeout_minutes,
    webhook_retry_count: instance.webhook_retry_count,
    webhook_timeout_seconds: instance.webhook_timeout_seconds
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'webhook' | 'branding' | 'advanced'>('basic');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updates: Partial<SimulationInstance> = {
        name: formData.name,
        institution_name: formData.institution_name,
        description: formData.description || undefined,
        webhook_url: formData.webhook_url || undefined,
        webhook_secret: formData.webhook_secret || undefined,
        branding_config: {
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          accent_color: formData.accent_color,
          background_color: formData.background_color,
          text_color: formData.text_color,
          font_family: formData.font_family
        },
        is_active: formData.is_active,
        requires_approval: formData.requires_approval,
        max_sessions_per_day: formData.max_sessions_per_day ? parseInt(formData.max_sessions_per_day.toString()) : undefined,
        session_timeout_minutes: formData.session_timeout_minutes,
        webhook_retry_count: formData.webhook_retry_count,
        webhook_timeout_seconds: formData.webhook_timeout_seconds
      };

      await onSave(instance.id, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update instance');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateShareableLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/sim/${instance.institution_id}`;
  };

  const generateQRCode = () => {
    const link = generateShareableLink();
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Instance Settings</h2>
              <p className="text-sm text-gray-600">{instance.institution_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'basic', label: 'Basic Info', icon: Building2 },
            { id: 'webhook', label: 'Webhook', icon: Link },
            { id: 'branding', label: 'Branding', icon: Palette },
            { id: 'advanced', label: 'Advanced', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instance Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.institution_name}
                    onChange={(e) => handleInputChange('institution_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Shareable Link</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generateShareableLink()}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generateShareableLink())}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    Copy
                  </button>
                </div>
                
                <div className="mt-3">
                  <h4 className="font-medium text-gray-900 mb-2">QR Code</h4>
                  <div className="flex items-center gap-4">
                    <img 
                      src={generateQRCode()} 
                      alt="QR Code" 
                      className="w-24 h-24 border border-gray-300 rounded-lg"
                    />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Students can scan this QR code to access the simulation
                      </p>
                      <a
                        href={generateQRCode()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Download QR Code
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Webhook Tab */}
          {activeTab === 'webhook' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={formData.webhook_url}
                  onChange={(e) => handleInputChange('webhook_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://your-institution.com/webhook"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Completion data will be sent to this URL when students finish the simulation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Secret
                </label>
                <input
                  type="password"
                  value={formData.webhook_secret}
                  onChange={(e) => handleInputChange('webhook_secret', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional secret for webhook authentication"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retry Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.webhook_retry_count}
                    onChange={(e) => handleInputChange('webhook_retry_count', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={formData.webhook_timeout_seconds}
                    onChange={(e) => handleInputChange('webhook_timeout_seconds', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.accent_color}
                      onChange={(e) => handleInputChange('accent_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => handleInputChange('background_color', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.background_color}
                      onChange={(e) => handleInputChange('background_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.text_color}
                      onChange={(e) => handleInputChange('text_color', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.text_color}
                      onChange={(e) => handleInputChange('text_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    value={formData.font_family}
                    onChange={(e) => handleInputChange('font_family', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Inter, sans-serif">Inter</option>
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="Open Sans, sans-serif">Open Sans</option>
                    <option value="Lato, sans-serif">Lato</option>
                    <option value="Poppins, sans-serif">Poppins</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Instance is active</span>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.requires_approval}
                    onChange={(e) => handleInputChange('requires_approval', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Requires approval</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Sessions Per Day
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_sessions_per_day}
                  onChange={(e) => handleInputChange('max_sessions_per_day', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="30"
                  max="480"
                  value={formData.session_timeout_minutes}
                  onChange={(e) => handleInputChange('session_timeout_minutes', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
        </form>
      </div>
    </div>
  );
};

export default InstanceSettingsModal;
