import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  className?: string;
  children?: ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  borderLeft?: string;
}

const padClass: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export default function Card({
  className = '',
  padding = 'md',
  borderLeft,
  children,
  ...rest
}: CardProps) {
  return (
    <section
      {...rest}
      className={[
        'rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]',
        borderLeft ? 'border-l-[3px]' : '',
        padClass[padding],
        className,
      ].join(' ')}
      style={borderLeft ? { borderLeftColor: borderLeft } : undefined}
    >
      {children}
    </section>
  );
}
