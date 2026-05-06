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
        className="flex items-baseline justify-between gap-2 text-sm font-medium text-[var(--admin-text)]"
      >
        <span>
          {label}
          {required && (
            <span aria-hidden className="ml-0.5 text-[var(--admin-danger)]">
              *
            </span>
          )}
        </span>
        {hint && <span className="text-xs font-normal text-[var(--admin-text-faint)]">{hint}</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-[var(--admin-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
