export const rollingPaperPageMotion = {
  initial: { opacity: 0, y: 18, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
} as const;

export const rollingPaperStaggerContainerMotion = {
  initial: 'initial',
  animate: 'animate',
  transition: { staggerChildren: 0.045, delayChildren: 0.06 },
} as const;

export const rollingPaperItemMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
} as const;
