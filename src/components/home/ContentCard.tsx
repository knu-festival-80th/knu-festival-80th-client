import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import GlassCircleButton from './GlassCircleButton';

type ContentCardProps = {
  category: string;
  title: string;
  description?: string;
  imageSrc?: string;
  illustrationSrc?: string;
  to: string;
};

export default function ContentCard({
  category,
  title,
  description,
  imageSrc,
  illustrationSrc,
  to,
}: ContentCardProps) {
  return (
    <Link
      to={to}
      className="relative flex aspect-4/5 w-full flex-col overflow-hidden rounded-md p-6"
    >
      <div aria-hidden className="absolute inset-0">
        {imageSrc ? (
          <img src={imageSrc} alt="" className="size-full object-cover" />
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

      <div className="relative flex flex-col gap-1.5">
        <p className="text-body1 font-medium tracking-tight text-ink">{category}</p>
        <p className="text-subheading font-bold tracking-tight text-ink whitespace-pre-line">
          {title}
        </p>
        {description && <p className="text-body1 text-gray whitespace-pre-line">{description}</p>}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {illustrationSrc && (
          <img
            src={illustrationSrc}
            alt=""
            className="absolute inset-0 size-full object-contain object-bottom"
          />
        )}
      </div>

      <div className="relative flex justify-end">
        <GlassCircleButton icon={<ArrowRight className="size-6 text-ink" />} />
      </div>
    </Link>
  );
}
