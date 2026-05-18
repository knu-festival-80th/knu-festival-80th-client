export const fadeUpVariant = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

export const tabIndicatorTransition = {
  type: 'spring',
  stiffness: 500,
  damping: 35,
} as const;
