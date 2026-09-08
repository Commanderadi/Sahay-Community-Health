import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToastList } from '../context/ToastContext';

const config = {
  success: {
    icon: CheckCircle2,
    ring: 'border-brand-200 dark:border-brand-500/30',
    iconColor: 'text-brand-600 dark:text-brand-400',
  },
  error: {
    icon: XCircle,
    ring: 'border-red-200 dark:border-red-500/30',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  info: {
    icon: Info,
    ring: 'border-slate-200 dark:border-slate-700',
    iconColor: 'text-slate-500 dark:text-slate-400',
  },
};

export default function Toaster() {
  const { toasts, dismiss } = useToastList();

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const { icon: Icon, ring, iconColor } = config[t.type] || config.info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`card pointer-events-auto flex w-full max-w-sm items-start gap-3 border p-3.5 pr-2 ${ring}`}
              role="status"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} aria-hidden="true" />
              <p className="flex-1 py-0.5 text-sm text-slate-700 dark:text-slate-200">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
