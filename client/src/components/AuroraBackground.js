import { motion } from 'framer-motion';

// Animated mesh-gradient "aurora" + slow-drifting health-cross motes.
// Pure CSS/SVG; sits behind auth and landing screens.
export default function AuroraBackground({ dense = false }) {
  const motes = Array.from({ length: dense ? 14 : 8 });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* aurora blobs */}
      <motion.div
        className="absolute -left-1/4 -top-1/3 h-[60vh] w-[60vh] rounded-full bg-brand-400/40 blur-[120px] dark:bg-brand-500/25"
        animate={{ x: [0, 60, -20, 0], y: [0, 40, 80, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-1/4 top-1/4 h-[55vh] w-[55vh] rounded-full bg-teal-300/40 blur-[120px] dark:bg-teal-500/20"
        animate={{ x: [0, -50, 30, 0], y: [0, 60, -30, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-20%] left-1/3 h-[50vh] w-[50vh] rounded-full bg-emerald-300/40 blur-[120px] dark:bg-emerald-500/20"
        animate={{ x: [0, 40, -40, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* floating health-cross motes */}
      {motes.map((_, i) => {
        const left = (i * 137.5) % 100;
        const size = 10 + ((i * 7) % 18);
        const dur = 14 + ((i * 3) % 12);
        const delay = (i * 1.7) % 8;
        return (
          <motion.div
            key={i}
            className="absolute text-brand-500/20 dark:text-brand-400/15"
            style={{ left: `${left}%`, top: `${(i * 53) % 100}%`, width: size, height: size }}
            animate={{ y: [0, -40, 0], opacity: [0, 1, 0], rotate: [0, 90, 0] }}
            transition={{ duration: dur, repeat: Infinity, delay, ease: 'easeInOut' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z" />
            </svg>
          </motion.div>
        );
      })}

      {/* faint grid */}
      <div
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          color: '#0f766e',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />
    </div>
  );
}
