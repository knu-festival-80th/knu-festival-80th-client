import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  htmlFor?: string;
}

export default function Field({ label, required, hint, error, children, htmlFor }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="flex items-baseline justify-between text-body2 font-medium text-[var(--admin-text)]"
      >
        <span className="flex items-baseline gap-1">
          {label}
          {required && (
            <span aria-hidden className="text-[var(--admin-primary)]">
              *
            </span>
          )}
        </span>
        {hint && <span className="text-caption text-[var(--admin-text-faint)]">{hint}</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-caption text-[var(--admin-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
