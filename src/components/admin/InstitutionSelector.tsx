import React, { useState, useRef, useEffect } from 'react';
import { SimulationInstance } from '../../hooks/useSimulationInstances';
import { ChevronDown, Building2, Check, Plus, Search } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedInstance = instances.find(instance => instance.id === selectedInstanceId);

  const filteredInstances = instances.filter(instance =>
    instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instance.institution_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleInstanceSelect = (instanceId: string | null) => {
    onInstanceChange(instanceId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateNew = () => {
    onCreateNew();
    setIsOpen(false);
  };

  return (
    <div className="relative flex-shrink-0" ref={containerRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-md bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors text-xs min-w-[180px] max-w-[240px]"
      >
        {selectedInstance ? (
          <>
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedInstance.branding_config?.primary_color || '#3b82f6' }}
            />
            <span className="text-slate-200 truncate flex-1 text-left font-medium">
              {selectedInstance.name}
            </span>
          </>
        ) : (
          <>
            <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="text-slate-400 flex-1 text-left">Select Instance</span>
          </>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Glassmorphic Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 w-72 rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-white/5">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Search className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search instances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          {/* Create New */}
          <button
            onClick={handleCreateNew}
            className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition-colors border-b border-white/5"
          >
            <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Plus className="w-3 h-3" />
            </div>
            Create New Instance
          </button>

          {/* Base Config */}
          <button
            onClick={() => handleInstanceSelect(null)}
            className={`w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-white/5 transition-colors border-b border-white/5 ${
              selectedInstanceId === null ? 'bg-blue-500/10' : ''
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-slate-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-200 truncate">Base Configuration</div>
              <div className="text-[10px] text-slate-500 truncate">Global defaults</div>
            </div>
            {selectedInstanceId === null && <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
          </button>

          {/* Instance List */}
          <div className="max-h-52 overflow-y-auto overscroll-contain">
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-5 h-5 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-1.5" />
                <span className="text-[10px] text-slate-500">Loading...</span>
              </div>
            ) : filteredInstances.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                {searchTerm ? 'No matches found.' : 'No instances yet.'}
              </div>
            ) : (
              filteredInstances.map((instance) => (
                <button
                  key={instance.id}
                  onClick={() => handleInstanceSelect(instance.id)}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-white/5 transition-colors ${
                    selectedInstanceId === instance.id ? 'bg-blue-500/10' : ''
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: instance.branding_config?.primary_color || '#3b82f6' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">{instance.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{instance.institution_name}</div>
                  </div>
                  {!instance.is_active && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full flex-shrink-0">Off</span>
                  )}
                  {selectedInstanceId === instance.id && <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionSelector;
