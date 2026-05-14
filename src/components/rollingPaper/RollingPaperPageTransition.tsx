import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { rollingPaperPageMotion } from './rollingPaperMotion';

type RollingPaperPageTransitionProps = {
  children: ReactNode;
  className?: string;
};

export default function RollingPaperPageTransition({
  children,
  className,
}: RollingPaperPageTransitionProps) {
  return (
    <motion.div className={className} {...rollingPaperPageMotion}>
      {children}
    </motion.div>
  );
}
