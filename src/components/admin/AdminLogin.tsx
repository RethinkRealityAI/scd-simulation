import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, LogIn, AlertCircle, ArrowLeft, CheckCircle, Sparkles, KeyRound, Eye, EyeOff, ShieldPlus, User } from 'lucide-react';

// Dynamically uses whatever origin the page is served from —
// so magic links and password resets redirect back to localhost in dev
// and to the production domain when deployed.
const ADMIN_REDIRECT = `${window.location.origin}/admin`;

type LoginView = 'login' | 'forgot-password' | 'magic-link' | 'reset-password' | 'signup';

interface AdminLoginProps {
  onLoginSuccess?: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<LoginView>(() => {
    // Detect if we've been redirected back after a password-reset email click
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      return 'reset-password';
    }
    return 'login';
  });

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmSignUpPassword, setConfirmSignUpPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [bootstrapAvailable, setBootstrapAvailable] = useState(false);
  const [bootstrapStatusLoading, setBootstrapStatusLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkBootstrapAvailability = async () => {
      try {
        setBootstrapStatusLoading(true);
        const { data, error } = await supabase.rpc('can_bootstrap_first_admin');
        if (error) throw error;
        setBootstrapAvailable(Boolean(data));
      } catch (err) {
        // Fail closed if backend RPC is missing or unavailable.
        setBootstrapAvailable(false);
      } finally {
        setBootstrapStatusLoading(false);
      }
    };

    void checkBootstrapAvailability();
  }, []);

  // Listen for PASSWORD_RECOVERY auth event (fires when the reset link is clicked)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('reset-password');
        setError(null);
        setSuccessMessage(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const resetState = () => {
    setError(null);
    setSuccessMessage(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmSignUpPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // ── Sign in with password ────────────────────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      onLoginSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Send password reset email ────────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: ADMIN_REDIRECT,
      });
      if (resetError) throw resetError;
      setSuccessMessage(`Password reset email sent to ${email}. Check your inbox and click the link to set a new password.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  // ── Send magic link ──────────────────────────────────────────────────────────
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: ADMIN_REDIRECT },
      });
      if (otpError) throw otpError;
      setSuccessMessage(`Magic link sent to ${email}. Click the link in your email to sign in instantly — no password needed.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  // ── One-time first super admin sign-up ───────────────────────────────────────
  const handleFirstAdminSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmSignUpPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: ADMIN_REDIRECT,
          data: {
            full_name: fullName.trim() || undefined,
          },
        },
      });

      if (signUpError) throw signUpError;

      // If email confirmation is disabled, bootstrap immediately.
      if (data.user && data.session) {
        const { error: bootstrapError } = await supabase.rpc('bootstrap_first_admin', {
          _user_id: data.user.id,
          _email: email.trim(),
          _full_name: fullName.trim() || null,
        });

        if (bootstrapError) throw bootstrapError;

        setBootstrapAvailable(false);
        setSuccessMessage('First super admin created successfully. Redirecting to the admin dashboard...');
        setTimeout(() => onLoginSuccess?.(), 1200);
        return;
      }

      setSuccessMessage(
        `Check ${email} for your confirmation link. Once you confirm and return to /admin, the first super admin profile will be created automatically.`,
      );
    } catch (err: any) {
      setError(err.message || 'Failed to create first super admin');
    } finally {
      setLoading(false);
    }
  };

  // ── Set new password (after clicking reset link) ─────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setSuccessMessage('Password updated successfully! You are now signed in.');
      // Clear the recovery hash from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => onLoginSuccess?.(), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared UI helpers ────────────────────────────────────────────────────────
  const headerMeta: Record<LoginView, { title: string; subtitle: string }> = {
    'login': { title: 'Admin Portal', subtitle: 'Sign in to access the simulation dashboard' },
    'forgot-password': { title: 'Reset Password', subtitle: 'We\'ll email you a secure reset link' },
    'magic-link': { title: 'Magic Link', subtitle: 'Sign in without a password' },
    'reset-password': { title: 'Set New Password', subtitle: 'Choose a strong password for your account' },
    'signup': { title: 'Create First Super Admin', subtitle: 'One-time setup for the first administrator account' },
  };

  const meta = headerMeta[view];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100">

        {/* Header */}
        <div className="bg-slate-900 p-8 text-white text-center relative">
          {view !== 'login' && view !== 'reset-password' && (
            <button
              onClick={() => { setView('login'); resetState(); }}
              className="absolute left-4 top-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Back to sign in"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
            {view === 'magic-link' ? (
              <Sparkles className="w-8 h-8 text-white" />
            ) : view === 'signup' ? (
              <ShieldPlus className="w-8 h-8 text-white" />
            ) : view === 'reset-password' ? (
              <KeyRound className="w-8 h-8 text-white" />
            ) : (
              <Lock className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold">{meta.title}</h2>
          <p className="text-gray-400 mt-2 text-sm">{meta.subtitle}</p>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* Error */}
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* ── View: Login ── */}
          {view === 'login' && !successMessage && (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                    placeholder="admin@institution.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot-password'); resetState(); }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                    placeholder="••••••••"
                    minLength={6}
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><LogIn className="w-5 h-5" /> Sign In to Dashboard</>}
              </button>

              {/* Magic link shortcut */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-400">or</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setView('magic-link'); resetState(); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                Send me a magic link instead
              </button>

              {bootstrapAvailable && !bootstrapStatusLoading && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-400">first-time setup</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setView('signup'); resetState(); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-emerald-300 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    <ShieldPlus className="w-4 h-4 text-emerald-600" />
                    Create first super admin
                  </button>
                </>
              )}
            </form>
          )}
          {/* ── View: One-time First Super Admin Sign-up ── */}
          {view === 'signup' && !successMessage && (
            <form onSubmit={handleFirstAdminSignUp} className="space-y-5">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
                This path is only for the very first admin account. Once the first super admin exists, this option disappears automatically.
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-gray-400">(optional)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                    placeholder="Jane Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                    placeholder="admin@institution.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white transition-colors text-gray-900"
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
                  value={confirmSignUpPassword}
                  onChange={(e) => setConfirmSignUpPassword(e.target.value)}
                  className={`block w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-colors text-gray-900 ${
                    confirmSignUpPassword && confirmSignUpPassword !== password
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-300 focus:border-emerald-500'
                  }`}
                  placeholder="Repeat your password"
                />
                {confirmSignUpPassword && confirmSignUpPassword !== password && (
                  <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !bootstrapAvailable || !email || !password || password !== confirmSignUpPassword}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><ShieldPlus className="w-4 h-4" /> Create First Super Admin</>}
              </button>

              <button
                type="button"
                onClick={() => { setView('login'); resetState(); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to sign in
              </button>
            </form>
          )}


          {/* ── View: Forgot Password ── */}
          {view === 'forgot-password' && !successMessage && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <p className="text-sm text-gray-600">
                Enter your admin email address and we'll send you a link to reset your password.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                    placeholder="admin@institution.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Mail className="w-4 h-4" /> Send Reset Email</>}
              </button>
              <button
                type="button"
                onClick={() => { setView('login'); resetState(); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to sign in
              </button>
            </form>
          )}

          {/* ── View: Magic Link ── */}
          {view === 'magic-link' && !successMessage && (
            <form onSubmit={handleMagicLink} className="space-y-5">
              <p className="text-sm text-gray-600">
                Enter your admin email and we'll send a one-click sign-in link — no password required.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                    placeholder="admin@institution.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Sparkles className="w-4 h-4" /> Send Magic Link</>}
              </button>
              <button
                type="button"
                onClick={() => { setView('login'); resetState(); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to sign in
              </button>
            </form>
          )}

          {/* ── View: Reset Password (after clicking email link) ── */}
          {view === 'reset-password' && !successMessage && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <p className="text-sm text-gray-600">
                Choose a new password for your admin account. Must be at least 8 characters.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(v => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors text-gray-900 ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-red-400 focus:border-red-400'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Repeat your new password"
                  />
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword || newPassword !== confirmPassword}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><KeyRound className="w-4 h-4" /> Update Password</>}
              </button>
            </form>
          )}

          {/* Success — back to login link (for non-auto-redirect flows) */}
          {successMessage && view !== 'reset-password' && (
            <button
              onClick={() => { setView('login'); resetState(); }}
              className="w-full mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              ← Back to sign in
            </button>
          )}
        </div>
      </div>

      <div className="fixed bottom-6 text-center text-sm font-medium text-gray-400">
        Sickle Cell Disease Simulation Portal &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default AdminLogin;
