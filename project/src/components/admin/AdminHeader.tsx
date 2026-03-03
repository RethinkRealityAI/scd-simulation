import React from 'react';
import { Building2, Settings, BarChart3, Home, Sparkles, LogOut } from 'lucide-react';
import InstitutionSelector from './InstitutionSelector';
import { SimulationInstance } from '../../hooks/useSimulationInstances';
import { useAuth } from '../../context/AuthContext';

interface AdminHeaderProps {
  selectedInstanceId: string | null;
  selectedInstance: any;
  onInstanceChange: (instanceId: string | null) => void;
  onCreateNew: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  instances: SimulationInstance[];
  loading?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  selectedInstanceId,
  selectedInstance,
  onInstanceChange,
  onCreateNew,
  activeTab,
  onTabChange,
  instances,
  loading = false
}) => {
  const { signOut } = useAuth();

  const tabs = [
    {
      id: 'instances',
      name: 'Instances',
      icon: Building2,
      description: 'Manage institutional simulation instances',
    },
    {
      id: 'scenes',
      name: 'Scenes',
      icon: Settings,
      description: 'Manage scenes, videos, and configuration',
    },
    {
      id: 'welcome',
      name: 'Welcome',
      icon: Home,
      description: 'Customize welcome screen content',
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      description: 'View simulation analytics and reports',
    }
  ];

  return (
    <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/10 to-transparent pointer-events-none" />

      {/* Top Header */}
      <div className="relative px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                SCD Simulation
                <span className="text-indigo-300 ml-2 font-medium text-base">Admin</span>
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">Manage your simulation platform</p>
            </div>
          </div>

          {/* Institution Selector & Auth */}
          <div className="flex items-center gap-2">
            <InstitutionSelector
              selectedInstanceId={selectedInstanceId}
              onInstanceChange={onInstanceChange}
              onCreateNew={onCreateNew}
              instances={instances}
              loading={loading}
            />

            <div className="w-px h-8 bg-slate-700 mx-2"></div>

            <button
              onClick={signOut}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Institution Banner */}
      {selectedInstance && (
        <div
          className="relative mx-8 mb-3 px-4 py-2.5 rounded-lg border backdrop-blur-sm"
          style={{
            backgroundColor: (selectedInstance.branding_config?.primary_color || '#6366f1') + '15',
            borderColor: (selectedInstance.branding_config?.primary_color || '#6366f1') + '30',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: selectedInstance.branding_config?.primary_color || '#6366f1' }}
            />
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300">
                Editing: <span className="font-semibold text-white">{selectedInstance.name}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{selectedInstance.institution_name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="relative px-8 pt-1">
        <nav className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                title={tab.description}
                className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-gray-50 text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{tab.name}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminHeader;
