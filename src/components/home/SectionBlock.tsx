import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import ViewAllButton from '@/components/home/ViewAllButton';

type SectionBlockProps = {
  label: string;
  title: string;
  description?: string;
  action?: ReactNode;
  viewAllTo?: string;
  viewAllLabel?: string;
  viewAllClassName?: string;
  animate?: boolean;
  className?: string;
  headingClassName?: string;
  labelClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionClassName?: string;
  children: ReactNode;
};

export default function SectionBlock({
  label,
  title,
  description,
  action,
  viewAllTo,
  viewAllLabel,
  viewAllClassName,
  animate = true,
  className = 'flex flex-col gap-12',
  headingClassName = 'flex flex-col px-5',
  labelClassName = 'text-body1 font-bold text-ink',
  titleClassName = 'mt-1.5 text-subheading font-bold leading-none tracking-tight text-black',
  descriptionClassName = 'mt-1.5 text-body2 text-text-muted whitespace-pre-line',
  actionClassName = 'mt-4',
  children,
}: SectionBlockProps) {
  return (
    <motion.div
      className={className}
      initial={animate ? { opacity: 0, y: 40 } : false}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={animate ? { once: true, amount: 0.2 } : undefined}
      transition={animate ? { duration: 0.5, ease: 'easeOut' } : undefined}
    >
      <div className={headingClassName}>
        <p className={labelClassName}>{label}</p>
        <h2 className={titleClassName}>{title}</h2>
        {description && <p className={descriptionClassName}>{description}</p>}
        {action && <div className={actionClassName}>{action}</div>}
        {viewAllTo && (
          <div className="mt-4">
            <ViewAllButton to={viewAllTo} label={viewAllLabel} className={viewAllClassName} />
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
}
