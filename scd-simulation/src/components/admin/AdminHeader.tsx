import React from 'react';
import { Building2, Settings, Users, BarChart3, Video, FileText, Palette, Home } from 'lucide-react';
import InstitutionSelector from './InstitutionSelector';
import { SimulationInstance } from '../../hooks/useSimulationInstances';

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
  const tabs = [
    {
      id: 'instances',
      name: 'Simulation Instances',
      icon: Building2,
      description: 'Manage institutional simulation instances',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'videos',
      name: 'Videos',
      icon: Video,
      description: 'Manage simulation videos and content',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'scenes',
      name: 'Scene List',
      icon: FileText,
      description: 'View and manage simulation scenes',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'scene-management',
      name: 'Scene Management',
      icon: Settings,
      description: 'Advanced scene configuration',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      description: 'View simulation analytics and reports',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      description: 'System settings and configuration',
      color: 'from-gray-500 to-slate-500'
    },
    {
      id: 'welcome',
      name: 'Welcome Screen',
      icon: Home,
      description: 'Customize welcome screen content',
      color: 'from-teal-500 to-blue-500'
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Top Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-gray-600">Manage your simulation platform</p>
          </div>
          
          {/* Institution Selector */}
          <div className="flex items-center gap-4">
            <InstitutionSelector
              selectedInstanceId={selectedInstanceId}
              onInstanceChange={onInstanceChange}
              onCreateNew={onCreateNew}
              instances={instances}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Institution Banner */}
      {selectedInstance && (
        <div 
          className="px-6 py-3 border-t"
          style={{ 
            backgroundColor: selectedInstance.branding_config?.primary_color + '10',
            borderColor: selectedInstance.branding_config?.primary_color + '20'
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selectedInstance.branding_config?.primary_color }}
            />
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Editing: <span className="font-semibold">{selectedInstance.name}</span>
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">{selectedInstance.institution_name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="px-6">
        <nav className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-white border-t-2 border-l-2 border-r-2 border-gray-200 text-gray-900 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminHeader;
