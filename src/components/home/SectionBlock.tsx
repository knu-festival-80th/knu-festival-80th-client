import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import ViewAllButton from '@/components/home/ViewAllButton';

type SectionBlockProps = {
  label: string;
  title: string;
  description?: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  direction?: 'left' | 'right';
  children: ReactNode;
};

export default function SectionBlock({
  label,
  title,
  description,
  viewAllTo,
  viewAllLabel,
  direction = 'left',
  children,
}: SectionBlockProps) {
  return (
    <motion.div
      className="flex flex-col gap-12"
      initial={{ opacity: 0, x: direction === 'left' ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex flex-col px-5">
        <p className="text-body1 font-bold text-ink">{label}</p>
        <h2 className="mt-1.5 text-heading3 text-ink">{title}</h2>
        {description && (
          <p className="mt-1.5 text-body2 text-text-muted whitespace-pre-line">{description}</p>
        )}
        {viewAllTo && (
          <div className="mt-4">
            <ViewAllButton to={viewAllTo} label={viewAllLabel} />
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
}
