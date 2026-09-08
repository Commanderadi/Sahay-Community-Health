import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import Toaster from './components/Toaster';
import Landing from './components/Landing';
import Splash from './components/Splash';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import './index.css';

// Flow: landing -> splash -> app. Skipped for the rest of the browser
// session once seen, and skipped entirely if a session is already stored.
function readSeen() {
  try {
    return sessionStorage.getItem('introSeen') === '1';
  } catch {
    return false;
  }
}

function Shell() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <AuthScreen />;
}

function AppInner() {
  const { isAuthenticated } = useAuth();

  const [phase, setPhase] = useState(() =>
    isAuthenticated || readSeen() ? 'app' : 'landing',
  );

  const enter = useCallback(() => setPhase('splash'), []);
  const finishSplash = useCallback(() => {
    try {
      sessionStorage.setItem('introSeen', '1');
    } catch {
      /* ignore */
    }
    setPhase('app');
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {phase === 'landing' && <Landing key="landing" onEnter={enter} />}
        {phase === 'splash' && <Splash key="splash" onDone={finishSplash} />}
      </AnimatePresence>
      {phase === 'app' && <Shell />}
    </>
  );
}

function WithProviders() {
  const toast = useToast();
  const handleExpire = useCallback(() => {
    toast.info('Your session expired. Please sign in again.', { duration: 6000 });
  }, [toast]);

  return (
    <AuthProvider onExpire={handleExpire}>
      <AppInner />
    </AuthProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <WithProviders />
      <Toaster />
    </ToastProvider>
  );
}
