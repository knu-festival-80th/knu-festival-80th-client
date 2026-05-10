import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  className?: string;
  invalid?: boolean;
  numericMono?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', invalid, numericMono, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      {...rest}
      aria-invalid={invalid || undefined}
      className={[
        'h-11 rounded-md px-3 text-base',
        'bg-[var(--admin-surface)] text-[var(--admin-text)]',
        'border placeholder:text-[var(--admin-text-faint)]',
        invalid
          ? 'border-[var(--admin-danger)]'
          : 'border-[var(--admin-border-strong)] hover:border-[var(--admin-text-muted)]',
        'focus:outline-none focus:border-[var(--admin-primary)] focus:ring-2 focus:ring-[var(--admin-primary)]/20',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        'transition-colors duration-150',
        numericMono ? 'tabular' : '',
        className,
      ].join(' ')}
    />
  );
});

export default Input;
