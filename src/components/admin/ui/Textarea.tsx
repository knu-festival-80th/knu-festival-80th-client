import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  className?: string;
  invalid?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = '', invalid, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      {...rest}
      aria-invalid={invalid || undefined}
      className={[
        'min-h-24 rounded-md px-3 py-2 text-body1',
        'bg-[var(--admin-surface)] text-[var(--admin-text)]',
        'border placeholder:text-[var(--admin-text-faint)]',
        invalid
          ? 'border-[var(--admin-danger)]'
          : 'border-[var(--admin-border)] hover:border-[var(--admin-border-strong)]',
        'focus:outline-none focus:border-[var(--admin-primary)] focus:ring-2 focus:ring-[var(--admin-primary)]/30',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        'transition-colors duration-150 resize-y',
        className,
      ].join(' ')}
    />
  );
});

export default Textarea;
