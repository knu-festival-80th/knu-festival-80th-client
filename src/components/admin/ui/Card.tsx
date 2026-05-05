import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title'> {
  className?: string;
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

const padClass: Record<NonNullable<CardProps['padding']>, string> = {
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export default function Card({
  className = '',
  eyebrow,
  title,
  description,
  actions,
  padding = 'md',
  children,
  ...rest
}: CardProps) {
  const hasHeader = eyebrow || title || description || actions;
  return (
    <section
      {...rest}
      className={[
        'rounded-[14px] border border-[var(--admin-border)] bg-[var(--admin-surface)]',
        'shadow-[var(--admin-shadow-card)]',
        padClass[padding],
        className,
      ].join(' ')}
    >
      {hasHeader && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && (
              <h2 className="text-heading2 font-semibold text-[var(--admin-text)]">{title}</h2>
            )}
            {description && (
              <p className="text-body2 text-[var(--admin-text-muted)]">{description}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
