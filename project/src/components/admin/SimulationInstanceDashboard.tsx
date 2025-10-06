import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Building2, 
  Link, 
  QrCode, 
  Settings, 
  BarChart3, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useSimulationInstances, useAccessTokens, SimulationInstance, AccessToken } from '../../hooks/useSimulationInstances';
import CreateInstanceModal from './CreateInstanceModal';
import InstanceSettingsModal from './InstanceSettingsModal';
import InstanceAnalyticsModal from './InstanceAnalyticsModal';

interface SimulationInstanceDashboardProps {
  onClose?: () => void;
}

const SimulationInstanceDashboard: React.FC<SimulationInstanceDashboardProps> = ({ onClose }) => {
  const { 
    instances, 
    loading, 
    error, 
    fetchInstances, 
    createInstance, 
    updateInstance, 
    deleteInstance 
  } = useSimulationInstances();
  
  const [selectedInstance, setSelectedInstance] = useState<SimulationInstance | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'instances' | 'tokens'>('instances');

  const handleCreateInstance = async (instanceData: Partial<SimulationInstance>) => {
    try {
      await createInstance(instanceData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create instance:', error);
    }
  };

  const handleUpdateInstance = async (id: string, updates: Partial<SimulationInstance>) => {
    try {
      await updateInstance(id, updates);
      setShowSettingsModal(false);
      setSelectedInstance(null);
    } catch (error) {
      console.error('Failed to update instance:', error);
    }
  };

  const handleDeleteInstance = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this simulation instance? This action cannot be undone.')) {
      try {
        await deleteInstance(id);
      } catch (error) {
        console.error('Failed to delete instance:', error);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const generateShareableLink = (institutionId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/sim/${institutionId}`;
  };

  const generateQRCode = (institutionId: string) => {
    const link = generateShareableLink(institutionId);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchInstances}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50 px-4 py-3 rounded-t-lg">
        <div className="flex items-center gap-4">
          <Building2 className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Simulation Instances</h2>
            <p className="text-sm text-gray-600">Manage institutional simulation instances</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Instance
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50/50">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{instances.length}</div>
              <div className="text-sm text-gray-600">Total Instances</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {instances.filter(i => i.is_active).length}
              </div>
              <div className="text-sm text-gray-600">Active Instances</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Link className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {instances.filter(i => i.webhook_url).length}
              </div>
              <div className="text-sm text-gray-600">With Webhooks</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {instances.filter(i => i.requires_approval).length}
              </div>
              <div className="text-sm text-gray-600">Require Approval</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('instances')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${
            activeTab === 'instances'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building2 className="w-4 h-4 mr-2 inline" />
          Instances ({instances.length})
        </button>
        <button
          onClick={() => setActiveTab('tokens')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${
            activeTab === 'tokens'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Link className="w-4 h-4 mr-2 inline" />
          Access Tokens
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'instances' ? (
          <div className="space-y-4">
            {instances.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No simulation instances</h3>
                <p className="text-gray-600 mb-4">Create your first simulation instance to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Create First Instance
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {instances.map((instance) => (
                  <div key={instance.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{instance.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{instance.institution_name}</p>
                        <p className="text-xs text-gray-500">ID: {instance.institution_id}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {instance.is_active ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>

                    {instance.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{instance.description}</p>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        instance.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {instance.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {instance.webhook_url && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Webhook
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedInstance(instance);
                          setShowSettingsModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedInstance(instance);
                          setShowAnalyticsModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Share Link</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(generateShareableLink(instance.institution_id))}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">QR Code</span>
                        <a
                          href={generateQRCode(instance.institution_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-500" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-12">
              <Link className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Tokens</h3>
              <p className="text-gray-600 mb-4">Manage access tokens for simulation instances</p>
              <p className="text-sm text-gray-500">This feature will be implemented in the next phase</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateInstanceModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateInstance}
        />
      )}

      {showSettingsModal && selectedInstance && (
        <InstanceSettingsModal
          instance={selectedInstance}
          onClose={() => {
            setShowSettingsModal(false);
            setSelectedInstance(null);
          }}
          onSave={handleUpdateInstance}
        />
      )}

      {showAnalyticsModal && selectedInstance && (
        <InstanceAnalyticsModal
          instance={selectedInstance}
          onClose={() => {
            setShowAnalyticsModal(false);
            setSelectedInstance(null);
          }}
        />
      )}
    </div>
  );
};

export default SimulationInstanceDashboard;
