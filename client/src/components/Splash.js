import { useEffect } from 'react';
import { motion } from 'framer-motion';
import BrandMark from './BrandMark';

// Short branded boot splash. Calls onDone after the sweep completes.
export default function Splash({ onDone, duration = 1600 }) {
  useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [onDone, duration]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-slate-950"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
    >
      <motion.div
        className="text-brand-400"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: [0.7, 1, 0.96, 1], opacity: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      >
        <BrandMark size={72} draw />
      </motion.div>

      <motion.p
        className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        Sahay
      </motion.p>

      <div className="mt-5 h-0.5 w-40 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="h-full bg-brand-500"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: duration / 1000, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
}
