import React, { useState } from 'react';
import EnhancedWelcomeScreenEditor from './EnhancedWelcomeScreenEditor';
import AnalyticsDashboard from './AnalyticsDashboard';
import SceneManagementDashboard from './SceneManagementDashboard';
import SimulationInstanceDashboard from './SimulationInstanceDashboard';
import AdminHeader from './AdminHeader';
import { useSimulationInstances } from '../../hooks/useSimulationInstances';
import CreateInstanceModal from './CreateInstanceModal';
import { CheckCircle, AlertCircle } from 'lucide-react';

type AdminTab = 'instances' | 'scenes' | 'analytics' | 'welcome';

const AdminDashboard: React.FC = () => {
  const { instances, createInstance, loading } = useSimulationInstances();

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('instances');
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [showCreateInstanceModal, setShowCreateInstanceModal] = useState(false);

  const selectedInstance = instances.find(instance => instance.id === selectedInstanceId);

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
      case 'scenes':
        return <SceneManagementDashboard instanceId={selectedInstanceId || undefined} />;
      case 'analytics':
        return <AnalyticsDashboard instanceId={selectedInstanceId || undefined} />;
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
        onTabChange={(tab: string) => setActiveTab(tab as AdminTab)}
        instances={instances}
        loading={loading}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6">
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

      {/* Toast Notification */}
      {message && (
        <div className="fixed top-6 right-6 z-50 max-w-sm animate-slide-in">
          <div className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-sm transition-all duration-300 ${message.type === 'success'
            ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
            : 'bg-red-50/95 border-red-200 text-red-800'
            }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                {message.type === 'success' ? 'Success' : 'Error'}
              </p>
              <p className="text-xs mt-0.5 opacity-80">{message.text}</p>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
            >
              <span className="sr-only">Close</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;