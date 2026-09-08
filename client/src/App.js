import { useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import Toaster from './components/Toaster';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import './index.css';

function Shell() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <AuthScreen />;
}

function AppInner() {
  const toast = useToast();
  const handleExpire = useCallback(() => {
    toast.info('Your session expired. Please sign in again.', { duration: 6000 });
  }, [toast]);

  return (
    <AuthProvider onExpire={handleExpire}>
      <Shell />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
      <Toaster />
    </ToastProvider>
  );
}
