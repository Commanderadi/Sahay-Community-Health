import { motion } from 'framer-motion';
import { Building2, MapPin, Pencil, Phone, Stethoscope, Trash2 } from 'lucide-react';
import Button from './ui/Button';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2 text-sm">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
    <span className="text-slate-500 dark:text-slate-400">{label}:</span>
    <span className="font-medium text-slate-700 dark:text-slate-200">{value}</span>
  </div>
);

export default function ClinicCard({ clinic, canManage, onOpen, onEdit, onDelete, index = 0 }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: 'easeOut', delay: Math.min(index, 8) * 0.05 }}
      className="card group flex flex-col p-5"
    >
      <button
        onClick={() => onOpen(clinic)}
        className="flex items-start gap-3 text-left"
        aria-label={`View details for ${clinic.name}`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <Building2 className="h-5 w-5" />
        </div>
        <h3 className="pt-1.5 text-base font-semibold leading-tight text-slate-900 transition group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
          {clinic.name}
        </h3>
      </button>

      <div className="mt-3 space-y-1.5">
        <InfoRow icon={MapPin} label="City" value={clinic.city} />
        <InfoRow icon={Phone} label="Contact" value={clinic.contact} />
      </div>

      {clinic.services?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Stethoscope className="h-4 w-4 text-slate-400" aria-hidden="true" />
          {clinic.services.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {s}
            </span>
          ))}
          {clinic.services.length > 4 && (
            <span className="px-1 text-xs text-slate-400">+{clinic.services.length - 4}</span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <span className="truncate text-xs text-slate-400">
          {clinic.addedBy || clinic.ownerEmail || 'Unknown'}
        </span>
        {canManage ? (
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(clinic)} aria-label={`Edit ${clinic.name}`}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button
              variant="danger-ghost"
              size="sm"
              onClick={() => onDelete(clinic)}
              aria-label={`Delete ${clinic.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => onOpen(clinic)}>
            Details
          </Button>
        )}
      </div>
    </motion.div>
  );
}
