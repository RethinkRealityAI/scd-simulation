import React, { useState, useCallback } from 'react';
import EnhancedWelcomeScreenEditor from './EnhancedWelcomeScreenEditor';
import AnalyticsDashboard from './AnalyticsDashboard';
import SceneManagementDashboard from './SceneManagementDashboard';
import SimulationInstanceDashboard from './SimulationInstanceDashboard';
import AdminManagementPanel from './AdminManagementPanel';
import AdminAccountPanel from './AdminAccountPanel';
import AdminHeader from './AdminHeader';
import { useSimulationInstances } from '../../hooks/useSimulationInstances';
import CreateInstanceModal from './CreateInstanceModal';
import { CheckCircle, AlertCircle } from 'lucide-react';

type AdminTab = 'instances' | 'scenes' | 'analytics' | 'welcome' | 'admins' | 'account';
type AdminRole = 'super_admin' | 'admin' | 'editor';

const ADMIN_TAB_VALID: AdminTab[] = ['instances', 'scenes', 'analytics', 'welcome', 'admins', 'account'];
const STORAGE_TAB_KEY = 'admin-active-tab';
const STORAGE_INSTANCE_KEY = 'admin-selected-instance';

// Tabs that the editor role cannot access
const EDITOR_RESTRICTED_TABS: AdminTab[] = ['instances', 'admins'];

interface AdminDashboardProps {
  adminRole: AdminRole;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminRole }) => {
  const {
    instances,
    createInstance,
    updateInstance,
    deleteInstance,
    fetchInstances,
    loading,
    error,
  } = useSimulationInstances();

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canAccessTab = (tab: AdminTab): boolean => {
    if (adminRole === 'editor') return !EDITOR_RESTRICTED_TABS.includes(tab);
    return true;
  };

  // Persist activeTab to sessionStorage so it survives refresh
  const [activeTab, _setActiveTab] = useState<AdminTab>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_TAB_KEY);
      if (stored && ADMIN_TAB_VALID.includes(stored as AdminTab)) {
        // Redirect editors away from restricted tabs on load
        if (adminRole === 'editor' && EDITOR_RESTRICTED_TABS.includes(stored as AdminTab)) {
          return 'scenes';
        }
        return stored as AdminTab;
      }
    } catch { /* ignore */ }
    return adminRole === 'editor' ? 'scenes' : 'instances';
  });
  const setActiveTab = useCallback((tab: AdminTab) => {
    if (!canAccessTab(tab)) return;
    _setActiveTab(tab);
    try { sessionStorage.setItem(STORAGE_TAB_KEY, tab); } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminRole]);

  // Persist selectedInstanceId to sessionStorage so it survives refresh
  const [selectedInstanceId, _setSelectedInstanceId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(STORAGE_INSTANCE_KEY) || null;
    } catch { return null; }
  });
  const setSelectedInstanceId = useCallback((id: string | null) => {
    _setSelectedInstanceId(id);
    try {
      if (id) sessionStorage.setItem(STORAGE_INSTANCE_KEY, id);
      else sessionStorage.removeItem(STORAGE_INSTANCE_KEY);
    } catch { /* ignore */ }
  }, []);

  const [showCreateInstanceModal, setShowCreateInstanceModal] = useState(false);

  const selectedInstance = instances.find(instance => instance.id === selectedInstanceId);

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreateNew = () => {
    setShowCreateInstanceModal(true);
  };

  const handleInstanceChange = (instanceId: string | null) => {
    setSelectedInstanceId(instanceId);
  };

  const renderActiveTab = () => {
    if (!canAccessTab(activeTab)) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p className="text-sm">You don't have permission to view this section.</p>
        </div>
      );
    }
    switch (activeTab) {
      case 'instances':
        return (
          <SimulationInstanceDashboard
            instances={instances}
            loading={loading}
            error={error}
            fetchInstances={fetchInstances}
            updateInstance={updateInstance}
            deleteInstance={deleteInstance}
            onCreateNew={handleCreateNew}
          />
        );
      case 'scenes':
        return <SceneManagementDashboard instanceId={selectedInstanceId || undefined} />;
      case 'analytics':
        return <AnalyticsDashboard instanceId={selectedInstanceId || undefined} />;
      case 'welcome':
        return <EnhancedWelcomeScreenEditor instanceId={selectedInstanceId || undefined} />;
      case 'admins':
        return <AdminManagementPanel />;
      case 'account':
        return <AdminAccountPanel />;
      default:
        return (
          <SimulationInstanceDashboard
            instances={instances}
            loading={loading}
            error={error}
            fetchInstances={fetchInstances}
            updateInstance={updateInstance}
            deleteInstance={deleteInstance}
            onCreateNew={handleCreateNew}
          />
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <AdminHeader
        selectedInstanceId={selectedInstanceId}
        selectedInstance={selectedInstance}
        onInstanceChange={handleInstanceChange}
        onCreateNew={handleCreateNew}
        activeTab={activeTab}
        onTabChange={(tab: string) => setActiveTab(tab as AdminTab)}
        instances={instances}
        loading={loading}
        adminRole={adminRole}
      />

      {/* Content area - compact padding */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4">
          {renderActiveTab()}
        </div>
      </div>

      {/* Create Instance Modal */}
      {showCreateInstanceModal && (
        <CreateInstanceModal
          onClose={() => setShowCreateInstanceModal(false)}
          onCreate={async (instanceData) => {
            try {
              const newInstance = await createInstance(instanceData);
              setShowCreateInstanceModal(false);
              if (newInstance?.id) {
                setSelectedInstanceId(newInstance.id);
              }
              setMessage({
                type: 'success',
                text: instanceData.name
                  ? `Instance "${instanceData.name}" created and selected.`
                  : 'Instance created and selected.',
              });
              clearMessage();
            } catch (error) {
              setMessage({ type: 'error', text: 'Failed to create instance' });
              clearMessage();
            }
          }}
        />
      )}

      {/* Toast */}
      {message && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-sm animate-slide-in">
          <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl text-sm font-medium backdrop-blur-sm ${message.type === 'success'
              ? 'bg-slate-900/95 text-white'
              : 'bg-red-600/95 text-white'
            }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-2 text-white/50 hover:text-white transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
