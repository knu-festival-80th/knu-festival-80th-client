import type { ReactNode } from 'react';
import ViewAllButton from '@/components/home/ViewAllButton';

type SectionBlockProps = {
  label: string;
  title: string;
  description?: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  children: ReactNode;
};

export default function SectionBlock({
  label,
  title,
  description,
  viewAllTo,
  viewAllLabel,
  children,
}: SectionBlockProps) {
  return (
    <div className="flex flex-col gap-12">
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
    </div>
  );
}
