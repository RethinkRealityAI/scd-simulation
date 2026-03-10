import React, { useEffect, useState, useCallback } from 'react';
import {
  UserPlus,
  Users,
  Trash2,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  ShieldCheck,
  Shield,
  Pencil,
  Check,
  AlertCircle,
  X,
  Crown,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminRole = 'super_admin' | 'admin' | 'editor';

interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_META: Record<AdminRole, { label: string; icon: React.FC<any>; color: string; description: string }> = {
  super_admin: {
    label: 'Super Admin',
    icon: Crown,
    color: 'text-amber-700 bg-amber-100 border-amber-200',
    description: 'Full access, can manage other admins',
  },
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    color: 'text-blue-700 bg-blue-100 border-blue-200',
    description: 'Full access to all platform features',
  },
  editor: {
    label: 'Editor',
    icon: Pencil,
    color: 'text-purple-700 bg-purple-100 border-purple-200',
    description: 'Content editing, read-only management',
  },
};

const randomIndex = (max: number): number => {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0] % max;
  }
  return Math.floor(Math.random() * max);
};

const generatePassword = (): string => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%';
  const all = upper + lower + digits + special;
  const pick = (s: string) => s[randomIndex(s.length)];
  const base = [pick(upper), pick(lower), pick(digits), pick(special)];
  for (let i = 0; i < 8; i++) base.push(pick(all));

  // Fisher-Yates shuffle with cryptographic randomness.
  for (let i = base.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [base[i], base[j]] = [base[j], base[i]];
  }

  return base.join('');
};

// ─── Toast ────────────────────────────────────────────────────────────────────

const useToast = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const show = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
};

// ─── Create Admin Modal ────────────────────────────────────────────────────────

interface CreateAdminModalProps {
  onClose: () => void;
  onCreated: (profile: AdminProfile) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  canManageAdmins: boolean;
}

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({ onClose, onCreated, showToast, canManageAdmins }) => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(() => generatePassword());
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<AdminRole>('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'email' | 'password' | 'both' | null>(null);

  const copyToClipboard = async (text: string, key: 'email' | 'password' | 'both') => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyBoth = () =>
    copyToClipboard(`Email: ${email}\nPassword: ${password}`, 'both');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageAdmins) {
      setError('Only super admins can create new admin accounts');
      return;
    }
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);

    try {
      if (!user?.id) throw new Error('You must be signed in to create admins');

      // Save current session so we can restore it after signUp potentially changes it
      const { data: { session: savedSession } } = await supabase.auth.getSession();

      // Create the new Supabase Auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() || undefined },
        },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('User creation returned no user');

      const newUserId = signUpData.user.id;

      // If signUp auto-signed us in as the new user, restore the original admin's session
      const { data: { session: sessionAfter } } = await supabase.auth.getSession();
      if (savedSession && sessionAfter?.user?.id !== savedSession.user?.id) {
        await supabase.auth.setSession({
          access_token: savedSession.access_token,
          refresh_token: savedSession.refresh_token,
        });
      } else if (!savedSession && sessionAfter?.user) {
        await supabase.auth.signOut();
      }

      // Insert the admin profile record
      const { data: profileData, error: profileError } = await supabase
        .from('admin_profiles')
        .insert({
          id: newUserId,
          email: email.trim(),
          full_name: fullName.trim() || null,
          role,
          is_active: true,
          created_by: user?.id ?? null,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      onCreated(profileData as AdminProfile);
      showToast(`Admin "${email.trim()}" created successfully`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Add Admin</h2>
              <p className="text-slate-400 text-xs mt-0.5">Create a new admin or super admin account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Jane Smith"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="admin@institution.com"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(email, 'email')}
                disabled={!email}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Copy email"
              >
                {copied === 'email' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">Temporary Password <span className="text-red-500">*</span></label>
              <button
                type="button"
                onClick={() => setPassword(generatePassword())}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-20 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono"
                minLength={8}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title={showPassword ? 'Hide' : 'Show'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(password, 'password')}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Copy password"
                >
                  {copied === 'password' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">Share this with the new admin. They should change it after first login.</p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(ROLE_META) as AdminRole[]).map(r => {
                const { label, icon: Icon, color, description } = ROLE_META[r];
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                    title={description}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-xs font-semibold leading-tight ${isSelected ? 'text-blue-800' : 'text-gray-600'}`}>{label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{ROLE_META[role].description}</p>
          </div>

          {/* Copy Both */}
          <button
            type="button"
            onClick={copyBoth}
            disabled={!email || !password}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-40"
          >
            {copied === 'both' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied === 'both' ? 'Credentials copied!' : 'Copy email & password'}
          </button>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'Creating…' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Role Badge ───────────────────────────────────────────────────────────────

const RoleBadge: React.FC<{ role: AdminRole }> = ({ role }) => {
  const { label, icon: Icon, color } = ROLE_META[role];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// ─── Admin Row ────────────────────────────────────────────────────────────────

interface AdminRowProps {
  profile: AdminProfile;
  isSelf: boolean;
  canManageAdmins: boolean;
  onRemove: (profile: AdminProfile) => void;
  onRoleChange: (profile: AdminProfile, role: AdminRole) => void;
}

const AdminRow: React.FC<AdminRowProps> = ({ profile, isSelf, canManageAdmins, onRemove, onRoleChange }) => {
  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : profile.email.slice(0, 2).toUpperCase();

  const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-teal-500'];
  const avatarColor = colors[profile.email.charCodeAt(0) % colors.length];

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isSelf ? 'border-blue-200 bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-xl ${avatarColor} flex items-center justify-center flex-shrink-0`}>
        <span className="text-white text-sm font-bold">{initials}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {profile.full_name || profile.email}
          </span>
          {isSelf && (
            <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full">You</span>
          )}
          {!profile.is_active && (
            <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>
          )}
        </div>
        {profile.full_name && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{profile.email}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">
          Added {new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Role */}
      {canManageAdmins && !isSelf ? (
        <select
          value={profile.role}
          onChange={e => onRoleChange(profile, e.target.value as AdminRole)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Change role"
        >
          {(Object.keys(ROLE_META) as AdminRole[]).map(r => (
            <option key={r} value={r}>{ROLE_META[r].label}</option>
          ))}
        </select>
      ) : (
        <RoleBadge role={profile.role} />
      )}

      {/* Remove */}
      <button
        onClick={() => onRemove(profile)}
        disabled={isSelf || !canManageAdmins}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
        title={
          isSelf
            ? "You can't remove yourself"
            : canManageAdmins
              ? 'Remove admin'
              : 'Only super admins can remove admins'
        }
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─── Main Panel ───────────────────────────────────────────────────────────────

const AdminManagementPanel: React.FC = () => {
  const { user } = useAuth();
  const { toast, show: showToast } = useToast();

  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);
  const currentProfile = profiles.find(profile => profile.id === user?.id);
  const canManageAdmins = currentProfile?.role === 'super_admin' && currentProfile.is_active;

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('admin_profiles')
        .select('*')
        .order('created_at', { ascending: true });
      if (fetchError) throw fetchError;
      setProfiles((data as AdminProfile[]) || []);
    } catch (err: any) {
      if (err?.message?.includes('relation "admin_profiles" does not exist')) {
        setError('Admin profiles table is missing. Run latest Supabase migrations to enable admin access controls.');
      } else {
        setError(err.message || 'Failed to load admin profiles');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: load admin profiles.
  useEffect(() => {
    const init = async () => {
      await fetchProfiles();
    };
    init();
  }, [fetchProfiles]);

  const handleRemove = (profile: AdminProfile) => {
    if (!canManageAdmins) {
      showToast('Only super admins can remove admins', 'error');
      return;
    }

    setConfirmDialog({
      title: 'Remove Admin',
      message: `Remove "${profile.full_name || profile.email}" as an admin? They will no longer have access to the dashboard. Their Supabase account will remain but they won't appear in the admin list.`,
      confirmLabel: 'Remove Admin',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const { error } = await supabase
            .from('admin_profiles')
            .delete()
            .eq('id', profile.id);
          if (error) throw error;
          setProfiles(prev => prev.filter(p => p.id !== profile.id));
          showToast(`${profile.full_name || profile.email} removed`);
        } catch (err: any) {
          showToast(err.message || 'Failed to remove admin', 'error');
        }
      },
    });
  };

  const handleRoleChange = async (profile: AdminProfile, newRole: AdminRole) => {
    if (!canManageAdmins) {
      showToast('Only super admins can change roles', 'error');
      return;
    }

    if (profile.role === newRole) {
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_profiles')
        .update({ role: newRole })
        .eq('id', profile.id);
      if (error) throw error;
      setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, role: newRole } : p));
      showToast(`Role updated to ${ROLE_META[newRole].label}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update role', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Admin Users
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage who has access to this administration dashboard, including super admins.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProfiles}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={!canManageAdmins}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={canManageAdmins ? 'Add Admin' : 'Only super admins can add admins'}
          >
            <UserPlus className="w-4 h-4" />
            Add Admin
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && currentProfile && !canManageAdmins && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            You have read-only admin access. Only super admins can add, remove, or reassign admins.
          </p>
        </div>
      )}

      {/* Stats strip */}
      {!loading && profiles.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {(Object.keys(ROLE_META) as AdminRole[]).map(r => {
            const count = profiles.filter(p => p.role === r).length;
            const { label, icon: Icon, color } = ROLE_META[r];
            return (
              <div key={r} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 leading-none">{count}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No admin profiles found</p>
            <p className="text-xs mt-1">Add the first admin to get started</p>
          </div>
        ) : (
          profiles.map(profile => (
            <AdminRow
              key={profile.id}
              profile={profile}
              isSelf={profile.id === user?.id}
              canManageAdmins={canManageAdmins}
              onRemove={handleRemove}
              onRoleChange={handleRoleChange}
            />
          ))
        )}
      </div>

      {/* Info note */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 space-y-1">
          <p className="font-semibold">About admin accounts</p>
          <p>Super admins can create admins or other super admins, choose their starting password, and share those credentials securely. New admins can update their password from the Account tab or use Forgot password from the admin login page. Removing someone from this list revokes their dashboard access.</p>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && canManageAdmins && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onCreated={profile => setProfiles(prev => [...prev, profile])}
          showToast={showToast}
          canManageAdmins={canManageAdmins}
        />
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

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AdminManagementPanel;
