import { motion } from 'framer-motion';

// Self-drawing health-cross-in-a-shield logo. `draw` triggers the stroke
// animation; otherwise it renders static (for headers).
export default function BrandMark({ size = 56, draw = false, className = '' }) {
  const stroke = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { pathLength: { duration: 1.1, ease: 'easeInOut' }, opacity: { duration: 0.2 } },
    },
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      initial={draw ? 'hidden' : false}
      animate={draw ? 'visible' : false}
    >
      <motion.path
        d="M24 3.5 42 10v12c0 12-7.5 19-18 22.5C13.5 41 6 34 6 22V10z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        variants={stroke}
      />
      <motion.path
        d="M24 15v18M15 24h18"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        variants={stroke}
        transition={{ delay: 0.4 }}
      />
    </motion.svg>
  );
}
