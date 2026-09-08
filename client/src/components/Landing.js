import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake, MapPin, ShieldCheck } from 'lucide-react';
import AuroraBackground from './AuroraBackground';
import BrandMark from './BrandMark';
import Button from './ui/Button';

const HEADLINE = ['Community', 'health,', 'mapped', 'and', 'within', 'reach.'];

const FEATURES = [
  { icon: MapPin, title: 'Every clinic, one map', text: 'Search, filter and locate care across the community.' },
  { icon: HeartHandshake, title: 'Built for NGOs', text: 'Field teams add and update clinics as things change.' },
  { icon: ShieldCheck, title: 'Owned & accountable', text: 'Each record has an owner; admins keep it clean.' },
];

export default function Landing({ onEnter }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <AuroraBackground dense />

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8 text-brand-600 dark:text-brand-400"
        >
          <BrandMark size={64} draw />
        </motion.div>

        <h1 className="flex flex-wrap justify-center gap-x-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
          {HEADLINE.map((word, i) => (
            <motion.span
              key={word + i}
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.5, ease: 'easeOut' }}
              className={i === 2 ? 'text-brand-600 dark:text-brand-400' : undefined}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.5 }}
          className="mt-6 max-w-xl text-base text-slate-600 dark:text-slate-300 sm:text-lg"
        >
          Sahay is a shared directory of community health clinics — kept current
          by the people on the ground.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.55, duration: 0.5 }}
          className="mt-9"
        >
          <Button size="lg" onClick={onEnter} className="group px-7 text-base">
            Get started
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>

        <div className="mt-20 grid w-full gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 + i * 0.15, duration: 0.5 }}
              className="card p-5 text-left"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 0.6 }}
        className="relative pb-6 text-center text-xs text-slate-400"
      >
        A community initiative · Sessions expire after 1 hour
      </motion.footer>
    </div>
  );
}
