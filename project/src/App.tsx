import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import SimulationScene from './components/SimulationScene';
import ResultsScreen from './components/ResultsScreen';
import AdminDashboard from './components/admin/AdminDashboard';
import InstanceSimulation from './components/InstanceSimulation';
import { SimulationProvider } from './context/SimulationContext';
import { InstanceSimulationProvider } from './context/InstanceSimulationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLogin from './components/admin/AdminLogin';
import { supabase } from './lib/supabase';

const AdminRoute: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [adminCheckError, setAdminCheckError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkAdminAccess = async () => {
      if (!user) {
        setHasAdminAccess(false);
        setAdminCheckError(null);
        setAdminCheckLoading(false);
        return;
      }

      setAdminCheckLoading(true);
      setAdminCheckError(null);

      const { data, error } = await supabase
        .from('admin_profiles')
        .select('id, is_active')
        .eq('id', user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setHasAdminAccess(false);
        setAdminCheckError(error.message);
      } else {
        if (data?.is_active) {
          setHasAdminAccess(true);
        } else if (!data) {
          // Bootstrap path: if no admin profiles exist yet, policy allows
          // the first authenticated user to register as super_admin.
          const { error: bootstrapError } = await supabase
            .from('admin_profiles')
            .insert({
              id: user.id,
              email: user.email ?? '',
              full_name: user.user_metadata?.full_name ?? null,
              role: 'super_admin',
              is_active: true,
              created_by: null,
            });

          if (cancelled) return;

          if (bootstrapError) {
            setHasAdminAccess(false);
            setAdminCheckError(bootstrapError.message);
          } else {
            setHasAdminAccess(true);
          }
        } else {
          setHasAdminAccess(false);
        }
      }

      setAdminCheckLoading(false);
    };

    void checkAdminAccess();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading || adminCheckLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  if (!hasAdminAccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900">Admin access required</h2>
          <p className="text-sm text-gray-600 mt-2">
            This account is authenticated but is not authorized to access the admin dashboard.
          </p>
          {adminCheckError && (
            <p className="text-xs text-red-600 mt-3 bg-red-50 border border-red-200 rounded-lg p-2">
              {adminCheckError}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => void signOut()}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="h-screen overflow-hidden">
          <Routes>
            {/* Main simulation routes */}
            <Route path="/" element={
              <SimulationProvider>
                <WelcomeScreen />
              </SimulationProvider>
            } />
            <Route path="/scene/:sceneId" element={
              <SimulationProvider>
                <SimulationScene />
              </SimulationProvider>
            } />
            <Route path="/completion" element={
              <SimulationProvider>
                <ResultsScreen />
              </SimulationProvider>
            } />

            {/* Instance-specific simulation routes */}
            <Route path="/sim/:institutionId/*" element={
              <InstanceSimulationProvider>
                <InstanceSimulation />
              </InstanceSimulationProvider>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;