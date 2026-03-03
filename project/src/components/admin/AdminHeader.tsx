import React from 'react';
import { Building2, Settings, BarChart3, Home, LogOut, Users, Sparkles } from 'lucide-react';
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
    { id: 'instances', name: 'Instances', icon: Building2 },
    { id: 'scenes', name: 'Scenes', icon: Settings },
    { id: 'welcome', name: 'Welcome', icon: Home },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'admins', name: 'Admins', icon: Users },
  ];

  return (
    <header className="bg-slate-900 text-white flex-shrink-0">
      <div className="flex items-center h-12 px-4 gap-3">
        {/* Logo / Title */}
        <div className="flex items-center gap-2 flex-shrink-0 mr-1">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
            SCD Sim <span className="text-blue-400 font-medium">Admin</span>
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-700 flex-shrink-0" />

        {/* Nav Tabs - inline */}
        <nav className="flex items-center gap-0.5 flex-shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{tab.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Active instance indicator (inline, no separate row) */}
        {selectedInstance && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-600/15 border border-blue-500/20 flex-shrink-0 max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
              style={{ backgroundColor: selectedInstance.branding_config?.primary_color || '#3b82f6' }}
            />
            <span className="text-xs text-blue-300 truncate">
              {selectedInstance.name}
            </span>
          </div>
        )}

        {/* Instance selector */}
        <InstitutionSelector
          selectedInstanceId={selectedInstanceId}
          onInstanceChange={onInstanceChange}
          onCreateNew={onCreateNew}
          instances={instances}
          loading={loading}
        />

        {/* Divider */}
        <div className="w-px h-5 bg-slate-700 flex-shrink-0" />

        {/* Sign out */}
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors flex-shrink-0"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
