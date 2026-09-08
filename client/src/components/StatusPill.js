import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import api from '../api';

const STATE = {
  checking: {
    label: 'Checking…',
    cls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    Icon: RefreshCw,
    spin: true,
  },
  online: {
    label: 'All systems online',
    cls: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400',
    Icon: Wifi,
  },
  offline: {
    label: 'Backend unreachable',
    cls: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    Icon: WifiOff,
  },
};

export default function StatusPill() {
  const [status, setStatus] = useState('checking');

  const check = useCallback(async () => {
    setStatus('checking');
    try {
      await api.get('/api/test');
      setStatus('online');
    } catch {
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const { label, cls, Icon, spin } = STATE[status];

  return (
    <button
      onClick={check}
      title="Click to re-check backend connectivity"
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${cls}`}
    >
      <Icon className={`h-3.5 w-3.5 ${spin ? 'animate-spin' : ''}`} aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
