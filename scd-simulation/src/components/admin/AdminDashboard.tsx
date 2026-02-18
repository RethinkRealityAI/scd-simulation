import React, { useState } from 'react';
import EnhancedWelcomeScreenEditor from './EnhancedWelcomeScreenEditor';
import AnalyticsDashboard from './AnalyticsDashboard';
import EnhancedVideoManagement from './EnhancedVideoManagement';
import SceneManagementDashboard from './SceneManagementDashboard';
import SimulationInstanceDashboard from './SimulationInstanceDashboard';
import AdminHeader from './AdminHeader';
import { useSimulationInstances } from '../../hooks/useSimulationInstances';
import CreateInstanceModal from './CreateInstanceModal';
import {
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { instances, createInstance, loading } = useSimulationInstances();

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'instances' | 'videos' | 'analytics' | 'settings' | 'welcome' | 'scene-management'>('instances');
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [showCreateInstanceModal, setShowCreateInstanceModal] = useState(false);

  const selectedInstance = instances.find(instance => instance.id === selectedInstanceId);

  console.log('AdminDashboard rendered. Instances count:', instances.length);

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateNew = () => {
    setShowCreateInstanceModal(true);
  };

  const handleInstanceChange = (instanceId: string | null) => {
    setSelectedInstanceId(instanceId);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'instances':
        return <SimulationInstanceDashboard onClose={() => { }} />;
      case 'videos':
        return (
          <EnhancedVideoManagement
            onMessage={setMessage}
            instanceId={selectedInstanceId || undefined}
          />
        );
      case 'scene-management':
        return (
          <SceneManagementDashboard
            instanceId={selectedInstanceId || undefined}
            instanceName={selectedInstance?.name}
          />
        );
      case 'analytics':
        return <AnalyticsDashboard instanceId={selectedInstanceId || undefined} />;
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-gray-600">Settings dashboard coming soon...</p>
          </div>
        );
      case 'welcome':
        return <EnhancedWelcomeScreenEditor instanceId={selectedInstanceId || undefined} />;
      default:
        return <SimulationInstanceDashboard onClose={() => { }} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Modern Header with Institution Selector */}
      <AdminHeader
        selectedInstanceId={selectedInstanceId}
        selectedInstance={selectedInstance}
        onInstanceChange={handleInstanceChange}
        onCreateNew={handleCreateNew}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        instances={instances}
        loading={loading}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {renderActiveTab()}
        </div>
      </div>

      {/* Create Instance Modal */}
      {showCreateInstanceModal && (
        <CreateInstanceModal
          onClose={() => setShowCreateInstanceModal(false)}
          onCreate={async (instanceData) => {
            try {
              await createInstance(instanceData);
              setShowCreateInstanceModal(false);
              setMessage({ type: 'success', text: 'Instance created successfully!' });
              clearMessage();
            } catch (error) {
              setMessage({ type: 'error', text: 'Failed to create instance' });
              clearMessage();
            }
          }}
        />
      )}

      {/* Message Display */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${message.type === 'success'
          ? 'bg-green-100 border border-green-400 text-green-700'
          : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;