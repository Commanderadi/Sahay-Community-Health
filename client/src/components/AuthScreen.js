import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from './ui/Button';
import { Input, Select } from './ui/Field';

const ROLES = ['NGO', 'Admin'];

export default function AuthScreen() {
  const { login } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const isLogin = mode === 'login';

  const [form, setForm] = useState({ email: '', password: '', role: 'NGO' });
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setForm((f) => ({ ...f, password: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.post('/api/auth/login', {
          email: form.email.trim(),
          password: form.password,
        });
        login({
          token: res.data.token,
          role: res.data.role,
          email: form.email.trim(),
          remember,
        });
        toast.success('Welcome back!');
      } else {
        await api.post('/api/auth/register', {
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });
        toast.success('Account created — you can sign in now.');
        switchMode('login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50 px-4 py-12 dark:from-slate-950 dark:via-slate-950 dark:to-brand-950/40">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
            <Activity className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sahay</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Community health clinic directory
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`relative flex-1 rounded-lg px-3 py-2 text-sm font-semibold capitalize transition ${
                  mode === m
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-slate-700"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{m === 'login' ? 'Sign in' : 'Register'}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={submit}
              initial={{ opacity: 0, x: isLogin ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 12 : -12 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </div>
              )}

              <Input
                label="Email address"
                name="email"
                type="email"
                required
                autoComplete="email"
                icon={Mail}
                placeholder="you@example.org"
                value={form.email}
                onChange={set('email')}
              />

              <div>
                <Input
                  label="Password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  icon={Lock}
                  placeholder={isLogin ? 'Your password' : 'At least 8 characters'}
                  value={form.password}
                  onChange={set('password')}
                  hint={!isLogin ? 'Use 8 or more characters.' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showPw ? 'Hide password' : 'Show password'}
                </button>
              </div>

              {!isLogin && (
                <Select label="Account type" value={form.role} onChange={set('role')}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              )}

              {isLogin && (
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  Keep me signed in
                </label>
              )}

              <Button type="submit" size="lg" loading={loading} className="w-full">
                {isLogin ? 'Sign in' : 'Create account'}
              </Button>
            </motion.form>
          </AnimatePresence>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Sessions expire automatically after 1 hour.
        </p>
      </motion.div>
    </div>
  );
}
