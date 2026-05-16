import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type ContentCardProps = {
  category: string;
  title: string;
  description?: string;
  imageSrc?: string;
  illustrationSrc?: string;
  illustrationClassName?: string;
  to?: string;
  onClick?: () => void;
  className?: string;
  contentClassName?: string;
  categoryClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  showAction?: boolean;
};

export default function ContentCard({
  category,
  title,
  description,
  imageSrc,
  illustrationSrc,
  illustrationClassName,
  to,
  onClick,
  className,
  contentClassName = 'relative flex flex-col gap-1.5',
  categoryClassName = 'text-body1 font-medium tracking-tight text-ink',
  titleClassName = 'text-subheading font-bold tracking-tight text-ink whitespace-pre-line',
  descriptionClassName = 'text-body1 text-gray whitespace-pre-line',
  showAction = true,
}: ContentCardProps) {
  const content = (
    <>
      <div aria-hidden className="absolute inset-0">
        {imageSrc ? (
          <img src={imageSrc} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="size-full bg-border" />
        )}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(129.57deg, rgba(255,255,255,0.9) 34.45%, rgba(255,255,255,0) 100%)',
          }}
        />
      </div>

      <div className={contentClassName}>
        <p className={categoryClassName}>{category}</p>
        <p className={titleClassName}>{title}</p>
        {description && <p className={descriptionClassName}>{description}</p>}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {illustrationSrc && (
          <img
            src={illustrationSrc}
            alt=""
            loading="lazy"
            className={`absolute inset-0 size-full object-contain object-bottom ${illustrationClassName ?? ''}`}
          />
        )}
      </div>

      {showAction && (
        <div className="relative flex justify-end">
          <span className="flex size-12 items-center justify-center rounded-full border border-white/50 bg-white/30">
            <ArrowRight className="size-6 text-ink" />
          </span>
        </div>
      )}
    </>
  );

  const cardClassName = `relative flex w-full flex-col overflow-hidden rounded-md p-6 text-left ${
    className ?? 'aspect-4/5'
  }`;

  if (to) {
    return (
      <Link to={to} className={cardClassName}>
        {content}
      </Link>
    );
  }

  if (!onClick) {
    return <article className={cardClassName}>{content}</article>;
  }

  return (
    <button type="button" className={cardClassName} onClick={onClick}>
      {content}
    </button>
  );
}
