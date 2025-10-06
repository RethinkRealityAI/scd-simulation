import React, { useState } from 'react';
import { SimulationInstance } from '../../hooks/useSimulationInstances';
import { ChevronDown, Building2, Check, Plus, Settings } from 'lucide-react';

interface InstitutionSelectorProps {
  selectedInstanceId: string | null;
  onInstanceChange: (instanceId: string | null) => void;
  onCreateNew: () => void;
  instances: SimulationInstance[];
  loading?: boolean;
}

const InstitutionSelector: React.FC<InstitutionSelectorProps> = ({
  selectedInstanceId,
  onInstanceChange,
  onCreateNew,
  instances,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedInstance = instances.find(instance => instance.id === selectedInstanceId);

  const filteredInstances = instances.filter(instance =>
    instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instance.institution_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInstanceSelect = (instanceId: string) => {
    onInstanceChange(instanceId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateNew = () => {
    onCreateNew();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Institution Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors min-w-[300px]"
      >
        <div className="flex items-center gap-3 flex-1">
          {selectedInstance ? (
            <>
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedInstance.branding_config?.primary_color || '#3b82f6' }}
              />
              <div className="text-left flex-1">
                <div className="font-medium text-gray-900 truncate">
                  {selectedInstance.name}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {selectedInstance.institution_name}
                </div>
              </div>
            </>
          ) : (
            <>
              <Building2 className="w-5 h-5 text-gray-400" />
              <div className="text-left flex-1">
                <div className="font-medium text-gray-900">Select Institution</div>
                <div className="text-sm text-gray-500">Choose an institution to edit</div>
              </div>
            </>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search institutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Create New Button */}
          <button
            onClick={handleCreateNew}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3 text-blue-600 font-medium"
          >
            <Plus className="w-4 h-4" />
            Create New Institution
          </button>

          {/* Institution List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <div className="text-sm">Loading institutions...</div>
              </div>
            ) : filteredInstances.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="text-sm">
                  {searchTerm ? 'No institutions found matching your search.' : 'No institutions created yet.'}
                </div>
                {!searchTerm && (
                  <div className="text-xs text-gray-400 mt-1">
                    Click "Create New Institution" to get started
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredInstances.map((instance) => (
                  <button
                    key={instance.id}
                    onClick={() => handleInstanceSelect(instance.id)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                      selectedInstanceId === instance.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: instance.branding_config?.primary_color || '#3b82f6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {instance.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {instance.institution_name}
                      </div>
                      {instance.description && (
                        <div className="text-xs text-gray-400 truncate mt-1">
                          {instance.description}
                        </div>
                      )}
                    </div>
                    {selectedInstanceId === instance.id && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default InstitutionSelector;
