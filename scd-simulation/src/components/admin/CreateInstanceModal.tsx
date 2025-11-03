import React, { useState } from 'react';
import { X, Building2, Link, Palette, Settings } from 'lucide-react';
import { SimulationInstance } from '../../hooks/useSimulationInstances';

interface CreateInstanceModalProps {
  onClose: () => void;
  onCreate: (instanceData: Partial<SimulationInstance>) => Promise<void>;
}

const CreateInstanceModal: React.FC<CreateInstanceModalProps> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    institution_name: '',
    description: '',
    webhook_url: '',
    webhook_secret: '',
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
    accent_color: '#F59E0B',
    background_color: '#FFFFFF',
    text_color: '#1F2937',
    font_family: 'Inter, sans-serif'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const instanceData: Partial<SimulationInstance> = {
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
        content_config: {
          scene_order: [],
          custom_scenes: [],
          disabled_features: []
        },
        is_active: true,
        requires_approval: false,
        session_timeout_minutes: 120,
        webhook_retry_count: 3,
        webhook_timeout_seconds: 30
      };

      await onCreate(instanceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create instance');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Create Simulation Instance</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Basic Information
            </h3>
            
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
                  placeholder="e.g., University of Toronto Simulation"
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
                  placeholder="e.g., University of Toronto"
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
                placeholder="Optional description for this simulation instance..."
              />
            </div>
          </div>

          {/* Webhook Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Link className="w-5 h-5" />
              Webhook Configuration
            </h3>
            
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
          </div>

          {/* Branding Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Branding Configuration
            </h3>
            
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

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
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
                  Creating...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  Create Instance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInstanceModal;
