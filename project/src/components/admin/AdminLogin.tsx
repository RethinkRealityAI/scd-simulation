import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, LogIn, UserPlus, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
    onLoginSuccess?: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);

    // Note: The sign up tab is temporary to create the initial super admin
    // It should be removed or disabled after the first admin is created.

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (signUpError) throw signUpError;

                alert('Admin user created successfully! You can now log in.');
                setIsSignUp(false); // Switch back to login
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;

                if (onLoginSuccess) {
                    onLoginSuccess();
                }
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100">

                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Admin Portal</h2>
                    <p className="text-gray-400 mt-2 text-sm">
                        Please sign in to access the simulation dashboard
                    </p>
                </div>

                {/* Form Container */}
                <div className="p-8">

                    {/* Temporary Mode Switcher (Remove later) */}
                    <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
                        <button
                            onClick={() => {
                                setIsSignUp(false);
                                setError(null);
                            }}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isSignUp ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => {
                                setIsSignUp(true);
                                setError(null);
                            }}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isSignUp ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Create Default Admin
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : isSignUp ? (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Create Admin User
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Sign In to Dashboard
                                </>
                            )}
                        </button>
                    </form>

                </div>
            </div>

            {/* Footer Branding */}
            <div className="fixed bottom-6 text-center text-sm font-medium text-gray-400">
                Sickle Cell Disease Simulation Portal &copy; {new Date().getFullYear()}
            </div>
        </div>
    );
};

export default AdminLogin;
