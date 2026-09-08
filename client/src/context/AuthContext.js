import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { decodeToken, isExpired, msUntilExpiry } from '../lib/token';

const AuthContext = createContext(null);

function buildUser(token, role, email) {
  const payload = decodeToken(token) || {};
  return {
    token,
    userId: payload.userId || null,
    role: role || payload.role || null,
    email: email || payload.email || null,
    isAdmin: (role || payload.role) === 'Admin',
  };
}

function readStored() {
  try {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    if (!token || isExpired(token)) return null;
    return buildUser(token, role, email);
  } catch {
    return null;
  }
}

export function AuthProvider({ children, onExpire }) {
  const [user, setUser] = useState(readStored);
  const timerRef = useRef(null);

  const logout = useCallback((opts = {}) => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('email');
    } catch {
      /* ignore */
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setUser(null);
    if (opts.expired && typeof onExpire === 'function') onExpire();
  }, [onExpire]);

  const login = useCallback(({ token, role, email, remember = true }) => {
    try {
      if (remember) {
        localStorage.setItem('token', token);
        if (role) localStorage.setItem('role', role);
        if (email) localStorage.setItem('email', email);
      }
    } catch {
      /* ignore */
    }
    setUser(buildUser(token, role, email));
  }, []);

  // Auto-logout the moment the current token expires.
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!user?.token) return undefined;

    const ms = msUntilExpiry(user.token);
    if (ms === Infinity) return undefined;
    if (ms <= 0) {
      logout({ expired: true });
      return undefined;
    }
    // setTimeout caps at ~24.8 days; tokens here live 1h so this is safe.
    timerRef.current = setTimeout(() => logout({ expired: true }), ms);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user?.token, logout]);

  // React to a 401 from any API call (token revoked / secret rotated).
  useEffect(() => {
    const handler = () => logout({ expired: true });
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [logout]);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
