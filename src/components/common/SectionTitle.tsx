import { ArrowRight } from 'lucide-react';

export interface SectionTitleProps {
  label: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export const SectionTitle = ({
  label,
  title,
  description,
  ctaLabel,
  ctaHref,
}: SectionTitleProps) => {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <div className="flex flex-col gap-2.5">
        <p className="font-wanted-sans text-base font-bold leading-none tracking-[-0.02em] text-ink">
          {label}
        </p>
        <p className="font-wanted-sans text-xl font-bold leading-none tracking-[-0.02em] text-ink">
          {title}
        </p>
        {description && (
          <p className="font-wanted-sans text-base font-medium leading-[1.4] tracking-[-0.02em] text-gray whitespace-pre-line">
            {description}
          </p>
        )}
      </div>
      {ctaLabel && (
        <a
          href={ctaHref ?? '#'}
          className="flex w-fit items-center gap-1.5 rounded-full border border-[#ff3d3d] py-2.5 pl-5 pr-3.5"
        >
          <span className="font-wanted-sans text-sm font-medium leading-none tracking-[-0.02em] text-[#ff3d3d] whitespace-nowrap">
            {ctaLabel}
          </span>
          <ArrowRight className="size-6 text-[#ff3d3d]" />
        </a>
      )}
    </div>
  );
};
