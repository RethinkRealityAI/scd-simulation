import React, { useState } from 'react';
import {
  Plus,
  Building2,
  Link,
  Settings,
  BarChart3,
  Copy,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Key,
  Shield,
  Eye,
  EyeOff,
  X,
  Calendar,
  Hash,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SimulationInstance, useAccessTokens, AccessToken } from '../../hooks/useSimulationInstances';
import InstanceSettingsModal from './InstanceSettingsModal';
import InstanceAnalyticsModal from './InstanceAnalyticsModal';
import ConfirmDialog from './ConfirmDialog';

interface SimulationInstanceDashboardProps {
  instances: SimulationInstance[];
  loading: boolean;
  error: string | null;
  fetchInstances: () => Promise<void>;
  updateInstance: (id: string, updates: Partial<SimulationInstance>) => Promise<SimulationInstance>;
  deleteInstance: (id: string) => Promise<void>;
  onCreateNew: () => void;
}

const useToast = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const show = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };
  return { toast, show };
};

// ─── Generate Token Modal ─────────────────────────────────────────────────────
interface GenerateTokenModalProps {
  instances: SimulationInstance[];
  onClose: () => void;
  onGenerate: (instanceId: string, name: string, description: string, expiresAt: string, maxUses: number | undefined) => Promise<void>;
}

const GenerateTokenModal: React.FC<GenerateTokenModalProps> = ({ instances, onClose, onGenerate }) => {
  const [instanceId, setInstanceId] = useState(instances[0]?.id || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Token name is required'); return; }
    if (!instanceId) { setError('Please select an instance'); return; }
    try {
      setLoading(true);
      setError(null);
      await onGenerate(instanceId, name.trim(), description.trim(), expiresAt, maxUses ? parseInt(maxUses) : undefined);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Key className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Generate Access Token</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800 text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Instance *</label>
            <select
              value={instanceId}
              onChange={e => setInstanceId(e.target.value)}
              className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {instances.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name} — {inst.institution_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Token Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Spring 2026 Cohort"
              className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional note"
              className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expires On</label>
              <input
                type="date"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Uses</label>
              <input
                type="number"
                value={maxUses}
                onChange={e => setMaxUses(e.target.value)}
                placeholder="Unlimited"
                min="1"
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Token Row ──────────────────────────────────────────────────────────────────
interface TokenRowProps {
  token: AccessToken;
  instanceName: string;
  institutionId: string;
  onCopy: (text: string, label: string) => void;
  onRevoke: (token: AccessToken) => void;
}

const TokenRow: React.FC<TokenRowProps> = ({ token, instanceName, institutionId, onCopy, onRevoke }) => {
  const [showToken, setShowToken] = useState(false);
  const shareUrl = `${window.location.origin}/sim/${institutionId}?token=${token.token}`;
  const isExpired = token.expires_at ? new Date(token.expires_at) < new Date() : false;
  const isExhausted = token.max_uses ? token.current_uses >= token.max_uses : false;
  const isEffectivelyActive = token.is_active && !isExpired && !isExhausted;

  return (
    <div className={`bg-white border rounded-xl p-3.5 transition-shadow hover:shadow-md ${isEffectivelyActive ? 'border-gray-200' : 'border-red-100 bg-red-50/30'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-semibold text-sm text-gray-900 truncate">{token.name}</h4>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              isEffectivelyActive ? 'bg-green-100 text-green-700' : isExpired ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-600'
            }`}>
              {isExpired ? 'Expired' : isExhausted ? 'Exhausted' : !token.is_active ? 'Revoked' : 'Active'}
            </span>
          </div>

          <p className="text-[10px] text-gray-500 mb-1.5">{instanceName}</p>

          <div className="flex items-center gap-1 mb-2 bg-gray-50 rounded-lg p-1.5 font-mono text-[10px]">
            <span className="flex-1 truncate text-gray-600">
              {showToken ? token.token : '\u2022'.repeat(Math.min(token.token.length, 20))}
            </span>
            <button onClick={() => setShowToken(v => !v)} className="text-gray-400 hover:text-gray-600 p-0.5" title={showToken ? 'Hide' : 'Show'}>
              {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
            <button onClick={() => onCopy(token.token, 'Token')} className="text-gray-400 hover:text-gray-600 p-0.5" title="Copy token">
              <Copy className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Hash className="w-2.5 h-2.5" />
              {token.current_uses}{token.max_uses ? `/${token.max_uses}` : ''} uses
            </span>
            {token.expires_at && (
              <span className={`flex items-center gap-1 ${isExpired ? 'text-red-500' : ''}`}>
                <Calendar className="w-2.5 h-2.5" />
                {new Date(token.expires_at).toLocaleDateString()}
              </span>
            )}
            {token.last_used_at && (
              <span className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {new Date(token.last_used_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={() => onCopy(shareUrl, 'Share URL')}
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[10px] font-medium transition-colors"
          >
            <Link className="w-3 h-3" />
            Copy Link
          </button>
          <button
            onClick={() => onRevoke(token)}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-medium transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Revoke
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const SimulationInstanceDashboard: React.FC<SimulationInstanceDashboardProps> = ({
  instances,
  loading,
  error,
  fetchInstances,
  updateInstance,
  deleteInstance,
  onCreateNew,
}) => {
  const { tokens, loading: tokensLoading, generateToken, deleteToken, fetchTokens } = useAccessTokens();
  const { toast, show: showToast } = useToast();

  const [selectedInstance, setSelectedInstance] = useState<SimulationInstance | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showGenerateTokenModal, setShowGenerateTokenModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'instances' | 'tokens'>('instances');
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; confirmLabel: string; onConfirm: () => void } | null>(null);

  const baseInstance: SimulationInstance = {
    id: 'base-instance',
    name: 'Base Application Default',
    institution_name: 'Root Configuration',
    institution_id: 'default',
    description: 'Default configuration when no specific instance is selected.',
    is_active: true,
    requires_approval: false,
    webhook_retry_count: 0,
    webhook_timeout_seconds: 30,
    session_timeout_minutes: 60,
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    branding_config: { primary_color: '#000000', secondary_color: '#000000', accent_color: '#000000', background_color: '#ffffff', text_color: '#000000', font_family: 'Inter' },
    content_config: { scene_order: [], custom_scenes: [], disabled_features: [] }
  };

  const allInstances = [baseInstance, ...instances];

  const handleUpdateInstance = async (id: string, updates: Partial<SimulationInstance>) => {
    try {
      await updateInstance(id, updates);
      setShowSettingsModal(false);
      setSelectedInstance(null);
      showToast('Instance updated');
    } catch {
      showToast('Failed to update instance', 'error');
    }
  };

  const handleDeleteInstance = (instance: SimulationInstance) => {
    setConfirmDialog({
      title: 'Delete Instance',
      message: `Are you sure you want to delete "${instance.name}"? This will permanently remove the instance and all associated data.`,
      confirmLabel: 'Delete Instance',
      onConfirm: async () => {
        setConfirmDialog(null);
        try { await deleteInstance(instance.id); showToast('Instance deleted'); }
        catch { showToast('Failed to delete instance', 'error'); }
      },
    });
  };

  const handleGenerateToken = async (instanceId: string, name: string, description: string, expiresAt: string, maxUses?: number) => {
    const token = await generateToken(instanceId, name, description);
    if (expiresAt || maxUses) {
      await supabase.from('instance_access_tokens').update({ expires_at: expiresAt || null, max_uses: maxUses ?? null }).eq('id', token.id);
      await fetchTokens();
    }
    showToast('Access token generated');
  };

  const handleRevokeToken = (token: AccessToken) => {
    setConfirmDialog({
      title: 'Revoke Token',
      message: `Revoke "${token.name}"? Any links using this token will stop working immediately.`,
      confirmLabel: 'Revoke Token',
      onConfirm: async () => {
        setConfirmDialog(null);
        try { await deleteToken(token.id); showToast('Token revoked'); }
        catch { showToast('Failed to revoke token', 'error'); }
      },
    });
  };

  const copyToClipboard = (text: string, label = 'Link') => {
    navigator.clipboard.writeText(text).then(() => showToast(`${label} copied`)).catch(() => showToast('Failed to copy', 'error'));
  };

  const generateShareableLink = (institutionId: string) => `${window.location.origin}/sim/${institutionId}`;
  const generateQRCodeUrl = (institutionId: string) => {
    const link = generateShareableLink(institutionId);
    return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(link)}&bgcolor=ffffff&color=1e3a5f&qzone=1`;
  };
  const getInstanceById = (id: string) => allInstances.find(inst => inst.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button onClick={fetchInstances} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1.5 mx-auto">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-medium ${
          toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {toast.message}
        </div>
      )}

      {/* Compact header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white rounded-t-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Simulation Instances</h2>
            <p className="text-[10px] text-gray-500">Manage institutional simulation instances</p>
          </div>
        </div>
        <button
          onClick={onCreateNew}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Instance
        </button>
      </div>

      {/* Compact stats strip */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-100 bg-gray-50/50 text-[10px] text-gray-500 flex-shrink-0 flex-wrap">
        {[
          { label: 'Total', value: instances.length, color: 'text-blue-600' },
          { label: 'Active', value: instances.filter(i => i.is_active).length, color: 'text-emerald-600' },
          { label: 'Webhooks', value: instances.filter(i => i.webhook_url).length, color: 'text-purple-600' },
          { label: 'Tokens', value: tokens.length, color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <span key={label} className="flex items-center gap-1">
            <span className={`text-sm font-bold ${color}`}>{value}</span>
            {label}
          </span>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
        {[
          { id: 'instances' as const, icon: Building2, label: 'Instances', count: instances.length },
          { id: 'tokens' as const, icon: Key, label: 'Tokens', count: tokens.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">

        {/* Instances Tab */}
        {activeTab === 'instances' && (
          <div>
            {instances.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-gray-700 mb-1">No instances yet</h3>
                <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">Create your first instance to deploy a branded simulation.</p>
                <button onClick={onCreateNew} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                  Create First Instance
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {allInstances.map((instance) => {
                  const isBase = instance.id === 'base-instance';
                  const shareLink = generateShareableLink(instance.institution_id);
                  const qrUrl = generateQRCodeUrl(instance.institution_id);

                  return (
                    <div
                      key={instance.id}
                      className={`bg-white rounded-xl border hover:shadow-md transition-all flex flex-col overflow-hidden ${
                        isBase ? 'border-gray-200 opacity-75' : 'border-gray-200'
                      }`}
                    >
                      {/* Accent bar */}
                      <div
                        className="h-1 w-full"
                        style={{ background: isBase ? '#9ca3af' : (instance.branding_config.primary_color || '#3b82f6') }}
                      />

                      <div className="p-4 flex flex-col flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h3 className="text-sm font-bold text-gray-900 truncate">{instance.name}</h3>
                              {isBase && <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">System</span>}
                            </div>
                            <p className="text-[10px] text-gray-500 truncate">{instance.institution_name}</p>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                            instance.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                          }`}>
                            {instance.is_active ? 'Active' : 'Off'}
                          </span>
                        </div>

                        {instance.description && (
                          <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">{instance.description}</p>
                        )}

                        {/* Tags */}
                        <div className="flex items-center gap-1 mb-3 flex-wrap">
                          {instance.webhook_url && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 flex items-center gap-0.5">
                              <Link className="w-2 h-2" /> Webhook
                            </span>
                          )}
                          {instance.requires_approval && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-yellow-50 text-yellow-600 rounded-full border border-yellow-100 flex items-center gap-0.5">
                              <Shield className="w-2 h-2" /> Approval
                            </span>
                          )}
                        </div>

                        {/* Shareable link */}
                        {!isBase && (
                          <div className="flex gap-2.5 mb-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                            <img src={qrUrl} alt="QR" className="w-12 h-12 rounded-md flex-shrink-0 border border-gray-200" loading="lazy" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-semibold text-gray-500 mb-0.5">Share Link</p>
                              <a href={shareLink} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 hover:underline truncate block font-mono mb-1.5">{shareLink}</a>
                              <div className="flex gap-1">
                                <button onClick={() => copyToClipboard(shareLink, 'Link')} className="flex items-center gap-0.5 px-2 py-0.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded text-[10px]">
                                  <Copy className="w-2.5 h-2.5" /> Copy
                                </button>
                                <a href={shareLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 px-2 py-0.5 bg-blue-600 text-white hover:bg-blue-700 rounded text-[10px]">
                                  <ExternalLink className="w-2.5 h-2.5" /> Open
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        {isBase && (
                          <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-[10px] text-gray-500">Base simulation at <span className="font-mono font-medium">/</span></p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 mt-auto">
                          {!isBase && (
                            <button
                              onClick={() => { setSelectedInstance(instance); setShowSettingsModal(true); }}
                              className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-1 text-[10px] font-medium transition-colors"
                            >
                              <Settings className="w-3 h-3" /> Settings
                            </button>
                          )}
                          <button
                            onClick={() => { setSelectedInstance(instance); setShowAnalyticsModal(true); }}
                            className="flex-1 px-2 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1 text-[10px] font-medium transition-colors"
                          >
                            <BarChart3 className="w-3 h-3" /> Analytics
                          </button>
                          {!isBase && (
                            <button
                              onClick={() => handleDeleteInstance(instance)}
                              className="px-2 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tokens Tab */}
        {activeTab === 'tokens' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Access Tokens</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Generate tokens to share instances with controlled access.</p>
              </div>
              <button
                onClick={() => setShowGenerateTokenModal(true)}
                disabled={instances.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 text-xs font-medium transition-colors"
              >
                <Key className="w-3.5 h-3.5" /> Generate
              </button>
            </div>

            {instances.length === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Create an instance first.
              </div>
            )}

            {tokensLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                <Key className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-gray-600 mb-1">No tokens yet</h4>
                <p className="text-[10px] text-gray-400 max-w-xs mx-auto">Generate a token to create a shareable link.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tokens.map(token => {
                  const inst = getInstanceById(token.instance_id);
                  return (
                    <TokenRow
                      key={token.id}
                      token={token}
                      instanceName={inst?.name || 'Unknown'}
                      institutionId={inst?.institution_id || ''}
                      onCopy={copyToClipboard}
                      onRevoke={handleRevokeToken}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showSettingsModal && selectedInstance && (
        <InstanceSettingsModal
          instance={selectedInstance}
          onClose={() => { setShowSettingsModal(false); setSelectedInstance(null); }}
          onSave={handleUpdateInstance}
        />
      )}
      {showAnalyticsModal && selectedInstance && (
        <InstanceAnalyticsModal
          instance={selectedInstance}
          onClose={() => { setShowAnalyticsModal(false); setSelectedInstance(null); }}
        />
      )}
      {showGenerateTokenModal && (
        <GenerateTokenModal instances={instances} onClose={() => setShowGenerateTokenModal(false)} onGenerate={handleGenerateToken} />
      )}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          variant="danger"
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
};

export default SimulationInstanceDashboard;
