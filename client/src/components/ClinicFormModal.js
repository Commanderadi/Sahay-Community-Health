import { useEffect, useState } from 'react';
import { Building2, Clock, MapPin, Phone, Stethoscope } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { Input } from './ui/Field';
import { useToast } from '../context/ToastContext';

const EMPTY = {
  name: '',
  city: '',
  contact: '',
  address: '',
  services: '',
  hours: '',
  notes: '',
  lat: '',
  lng: '',
};

function toForm(clinic) {
  if (!clinic) return { ...EMPTY };
  return {
    name: clinic.name || '',
    city: clinic.city || '',
    contact: clinic.contact || '',
    address: clinic.address || '',
    services: (clinic.services || []).join(', '),
    hours: clinic.hours || '',
    notes: clinic.notes || '',
    lat: clinic.lat ?? '',
    lng: clinic.lng ?? '',
  };
}

export default function ClinicFormModal({ open, clinic, onClose, onSubmit }) {
  const toast = useToast();
  const editing = !!clinic;
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(toForm(clinic));
      setError('');
    }
  }, [open, clinic]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim() || !form.contact.trim()) {
      setError('Name, city and contact are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        city: form.city.trim(),
        contact: form.contact.trim(),
        address: form.address.trim(),
        services: form.services,
        hours: form.hours.trim(),
        notes: form.notes.trim(),
        lat: form.lat === '' ? null : Number(form.lat),
        lng: form.lng === '' ? null : Number(form.lng),
      };
      await onSubmit(payload);
      toast.success(editing ? 'Clinic updated.' : `${payload.name} added.`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit clinic' : 'Add a clinic'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="clinic-form" loading={saving}>
            {editing ? 'Save changes' : 'Add clinic'}
          </Button>
        </>
      }
    >
      <form id="clinic-form" onSubmit={submit} className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}
        <Input label="Clinic name" icon={Building2} required value={form.name} onChange={set('name')} placeholder="e.g. Community Care Center" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="City" icon={MapPin} required value={form.city} onChange={set('city')} placeholder="Pune" />
          <Input label="Contact" icon={Phone} required value={form.contact} onChange={set('contact')} placeholder="Phone or email" />
        </div>
        <Input label="Address" icon={MapPin} value={form.address} onChange={set('address')} placeholder="Street address" />
        <Input
          label="Services"
          icon={Stethoscope}
          value={form.services}
          onChange={set('services')}
          placeholder="Dental, Pediatrics, Vaccination"
          hint="Comma-separated."
        />
        <Input label="Hours" icon={Clock} value={form.hours} onChange={set('hours')} placeholder="Mon–Fri 9am–5pm" />
        <div>
          <label className="label" htmlFor="clinic-notes">Notes</label>
          <textarea
            id="clinic-notes"
            className="input min-h-[72px] resize-y"
            value={form.notes}
            onChange={set('notes')}
            placeholder="Anything else worth knowing…"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Latitude" type="number" step="any" value={form.lat} onChange={set('lat')} placeholder="18.5204" hint="For the map view." />
          <Input label="Longitude" type="number" step="any" value={form.lng} onChange={set('lng')} placeholder="73.8567" />
        </div>
      </form>
    </Modal>
  );
}
