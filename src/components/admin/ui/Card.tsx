import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  className?: string;
  children?: ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const padClass: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export default function Card({ className = '', padding = 'md', children, ...rest }: CardProps) {
  return (
    <section
      {...rest}
      className={[
        'rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]',
        padClass[padding],
        className,
      ].join(' ')}
    >
      {children}
    </section>
  );
}
