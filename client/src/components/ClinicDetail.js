import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  Pencil,
  Phone,
  Stethoscope,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import Button from './ui/Button';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

const Row = ({ icon: Icon, label, children }) => (
  <div className="flex gap-3 py-2.5">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-0.5 text-sm text-slate-700 dark:text-slate-200">{children}</div>
    </div>
  </div>
);

export default function ClinicDetail({ clinic, canManage, onClose, onEdit, onDelete }) {
  useEffect(() => {
    if (!clinic) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [clinic, onClose]);

  const hasCoords = clinic && typeof clinic.lat === 'number' && typeof clinic.lng === 'number';

  return createPortal(
    <AnimatePresence>
      {clinic && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`${clinic.name} details`}
            className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl dark:bg-slate-900"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold leading-tight text-slate-900 dark:text-white">
                    {clinic.name}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{clinic.city}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="-m-1 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 divide-y divide-slate-100 px-5 py-3 dark:divide-slate-800">
              <Row icon={Phone} label="Contact">{clinic.contact}</Row>
              {clinic.address && <Row icon={MapPin} label="Address">{clinic.address}</Row>}
              {clinic.services?.length > 0 && (
                <Row icon={Stethoscope} label="Services">
                  <div className="flex flex-wrap gap-1.5">
                    {clinic.services.map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </Row>
              )}
              {clinic.hours && <Row icon={Clock} label="Hours">{clinic.hours}</Row>}
              {clinic.notes && (
                <Row icon={Building2} label="Notes">
                  <p className="whitespace-pre-wrap">{clinic.notes}</p>
                </Row>
              )}
              {hasCoords && (
                <Row icon={MapPin} label="Location">
                  <a
                    className="text-brand-600 hover:underline dark:text-brand-400"
                    href={`https://www.openstreetmap.org/?mlat=${clinic.lat}&mlon=${clinic.lng}#map=16/${clinic.lat}/${clinic.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {clinic.lat.toFixed(4)}, {clinic.lng.toFixed(4)}
                  </a>
                </Row>
              )}
              <Row icon={User} label="Added by">{clinic.addedBy || clinic.ownerEmail || 'Unknown'}</Row>
              <Row icon={Calendar} label="Added">{formatDate(clinic.createdAt)}</Row>
            </div>

            {canManage && (
              <div className="sticky bottom-0 flex gap-2 border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
                <Button variant="secondary" className="flex-1" onClick={() => onEdit(clinic)}>
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => onDelete(clinic)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
