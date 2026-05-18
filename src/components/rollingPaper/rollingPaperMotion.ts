import { fadeUpVariant } from '@/constants/animation';

export const rollingPaperPageMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: fadeUpVariant.transition,
} as const;

export const rollingPaperStaggerContainerMotion = {
  initial: 'initial',
  animate: 'animate',
  transition: { staggerChildren: 0.045, delayChildren: 0.06 },
} as const;

export const rollingPaperItemMotion = fadeUpVariant;
