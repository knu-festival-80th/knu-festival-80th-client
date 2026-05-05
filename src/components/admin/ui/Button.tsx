import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: Variant;
  size?: Size;
  className?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
}

const sizeClass: Record<Size, string> = {
  sm: 'h-8 px-3 text-body2',
  md: 'h-10 px-4 text-body2',
  lg: 'h-12 px-5 text-body1',
};

const variantClass: Record<Variant, string> = {
  primary:
    'bg-[var(--admin-primary)] text-[var(--admin-primary-fg)] font-semibold ' +
    'hover:bg-[var(--admin-primary-strong)] disabled:opacity-50 ' +
    'shadow-[0_8px_20px_-12px_var(--admin-primary)]',
  secondary:
    'bg-[var(--admin-surface-strong)] text-[var(--admin-text)] border border-[var(--admin-border-strong)] ' +
    'hover:bg-[var(--admin-surface-hover)] disabled:opacity-50',
  ghost:
    'bg-transparent text-[var(--admin-text)] border border-[var(--admin-border)] ' +
    'hover:bg-[var(--admin-surface-hover)] hover:border-[var(--admin-border-strong)] ' +
    'disabled:opacity-50',
  danger:
    'bg-[var(--admin-danger-soft)] text-[var(--admin-danger)] border border-[var(--admin-danger)]/35 ' +
    'hover:bg-[var(--admin-danger)] hover:text-white disabled:opacity-50',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  iconLeft,
  iconRight,
  block,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md',
        'transition-colors duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-bg)]',
        'disabled:cursor-not-allowed',
        sizeClass[size],
        variantClass[variant],
        block ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
