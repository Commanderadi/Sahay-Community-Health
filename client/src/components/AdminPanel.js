import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Trash2, Users } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { Select } from './ui/Field';
import { useConfirm } from './ui/ConfirmDialog';

export default function AdminPanel({ open, onClose }) {
  const { user } = useAuth();
  const toast = useToast();
  const { confirm, element: confirmElement } = useConfirm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const changeRole = async (u, role) => {
    setBusyId(u._id);
    try {
      const res = await api.put(`/api/users/${u._id}/role`, { role });
      setUsers((list) => list.map((x) => (x._id === u._id ? { ...x, role: res.data.role } : x)));
      toast.success(`${u.email} is now ${role}.`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not change role.');
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async (u) => {
    const ok = await confirm({
      title: 'Delete this user?',
      message: `${u.email} will be removed. Their ${u.clinicCount} clinic${
        u.clinicCount === 1 ? '' : 's'
      } will be kept but left unassigned.`,
      confirmLabel: 'Delete user',
      destructive: true,
    });
    if (!ok) return;
    setBusyId(u._id);
    try {
      await api.delete(`/api/users/${u._id}`);
      setUsers((list) => list.filter((x) => x._id !== u._id));
      toast.success('User deleted.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not delete user.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Manage users">
      <div className="min-h-[200px]">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button variant="secondary" size="sm" onClick={load}>
              Retry
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u) => {
              const isSelf = String(u._id) === String(user?.userId);
              return (
                <motion.li
                  key={u._id}
                  layout
                  className="flex items-center gap-3 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {u.role === 'Admin' ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {u.email} {isSelf && <span className="text-slate-400">(you)</span>}
                    </p>
                    <p className="text-xs text-slate-400">
                      {u.clinicCount} clinic{u.clinicCount === 1 ? '' : 's'}
                    </p>
                  </div>
                  <Select
                    value={u.role}
                    onChange={(e) => changeRole(u, e.target.value)}
                    disabled={isSelf || busyId === u._id}
                    className="w-28"
                  >
                    <option value="NGO">NGO</option>
                    <option value="Admin">Admin</option>
                  </Select>
                  <Button
                    variant="danger-ghost"
                    size="icon"
                    onClick={() => removeUser(u)}
                    disabled={isSelf || busyId === u._id}
                    aria-label={`Delete ${u.email}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
      {confirmElement}
    </Modal>
  );
}
