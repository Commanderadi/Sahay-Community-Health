import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Calendar,
  Check,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  User,
  X,
} from 'lucide-react';
import Button from './ui/Button';
import { Input } from './ui/Field';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2 text-sm">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
    <span className="text-slate-500 dark:text-slate-400">{label}:</span>
    <span className="font-medium text-slate-700 dark:text-slate-200">{value}</span>
  </div>
);

export default function ClinicCard({ clinic, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: clinic.name,
    city: clinic.city,
    contact: clinic.contact,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const startEdit = () => {
    setForm({ name: clinic.name, city: clinic.city, contact: clinic.contact });
    setError('');
    setEditing(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.city.trim() || !form.contact.trim()) {
      setError('All fields are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(clinic._id, {
        name: form.name.trim(),
        city: form.city.trim(),
        contact: form.contact.trim(),
      });
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="card flex flex-col p-5"
    >
      {editing ? (
        <div className="space-y-3">
          {error && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
          )}
          <Input label="Name" value={form.name} onChange={set('name')} />
          <Input label="City" value={form.city} onChange={set('city')} />
          <Input label="Contact" value={form.contact} onChange={set('contact')} />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button size="sm" onClick={save} loading={saving}>
              <Check className="h-4 w-4" /> Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="pt-1.5 text-base font-semibold leading-tight text-slate-900 dark:text-white">
              {clinic.name}
            </h3>
          </div>

          <div className="space-y-1.5">
            <InfoRow icon={MapPin} label="City" value={clinic.city} />
            <InfoRow icon={Phone} label="Contact" value={clinic.contact} />
            <InfoRow icon={User} label="Added by" value={clinic.addedBy || 'Unknown'} />
            <InfoRow icon={Calendar} label="Added" value={formatDate(clinic.createdAt)} />
          </div>

          <div className="mt-4 flex justify-end gap-1 border-t border-slate-100 pt-3 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={startEdit} aria-label={`Edit ${clinic.name}`}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button
              variant="danger-ghost"
              size="sm"
              onClick={() => onDelete(clinic)}
              aria-label={`Delete ${clinic.name}`}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}
