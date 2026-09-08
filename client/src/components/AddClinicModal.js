import { useEffect, useState } from 'react';
import { Building2, MapPin, Phone, User } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { Input } from './ui/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EMPTY = { name: '', city: '', contact: '', addedBy: '' };

export default function AddClinicModal({ open, onClose, onAdd }) {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY, addedBy: user?.email || '' });
      setError('');
    }
  }, [open, user?.email]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim() || !form.contact.trim()) {
      setError('Name, city and contact are all required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onAdd({
        name: form.name.trim(),
        city: form.city.trim(),
        contact: form.contact.trim(),
        addedBy: form.addedBy.trim() || undefined,
      });
      toast.success(`${form.name.trim()} added.`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add clinic.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a clinic"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="add-clinic-form" loading={saving}>
            Add clinic
          </Button>
        </>
      }
    >
      <form id="add-clinic-form" onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}
        <Input label="Clinic name" icon={Building2} required value={form.name} onChange={set('name')} placeholder="e.g. Community Care Center" />
        <Input label="City" icon={MapPin} required value={form.city} onChange={set('city')} placeholder="e.g. Pune" />
        <Input label="Contact" icon={Phone} required value={form.contact} onChange={set('contact')} placeholder="Phone or email" />
        <Input label="Added by" icon={User} value={form.addedBy} onChange={set('addedBy')} placeholder="Your name or organization" />
      </form>
    </Modal>
  );
}
