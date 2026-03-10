import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, KeyRound, Mail, Shield, User, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type AdminRole = 'super_admin' | 'admin' | 'editor';

interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
}

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
};

const ADMIN_REDIRECT = `${window.location.origin}/admin`;

const AdminAccountPanel: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);
        const { data, error } = await supabase
          .from('admin_profiles')
          .select('id, email, full_name, role, is_active, created_at')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        setProfile((data as AdminProfile | null) || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load account details');
      } finally {
        setLoadingProfile(false);
      }
    };

    void loadProfile();
  }, [user?.id]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    clearMessages();

    try {
      setSendingReset(true);
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: ADMIN_REDIRECT,
      });
      if (error) throw error;
      setSuccess(`Reset email sent to ${user.email}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          My Account
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          View your admin account details and change your password.
        </p>
        <p className="text-xs text-gray-400 mt-1 font-mono" title="Use this to confirm local and production use the same backend">
          Backend: {import.meta.env.VITE_SUPABASE_URL ?? 'not set'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Account Details</h3>

        {loadingProfile ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading account details...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Name</p>
              <p className="font-medium text-gray-900">{profile?.full_name || user?.user_metadata?.full_name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{profile?.email || user?.email || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Role</p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                <Shield className="w-3.5 h-3.5" />
                {profile?.role ? ROLE_LABELS[profile.role] : 'Unknown'}
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Status</p>
              <p className={`font-medium ${profile?.is_active === false ? 'text-red-600' : 'text-green-600'}`}>
                {profile?.is_active === false ? 'Inactive' : 'Active'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Update your password here, or send yourself a reset email.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSendResetEmail}
            disabled={sendingReset || !user?.email}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sendingReset ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Send reset email
          </button>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`block w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors text-gray-900 ${
                confirmPassword && confirmPassword !== newPassword
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Repeat your new password"
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving || !newPassword || newPassword !== confirmPassword}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              {saving ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAccountPanel;
