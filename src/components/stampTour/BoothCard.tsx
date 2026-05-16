import { ChevronDown } from 'lucide-react';
import ZoneBadge from './ZoneBadge';

type BoothCardProps = {
  zone: string;
  name: string;
  description: string;
  location: string;
  time: string;
  target: string;
  imageSrc: string;
  imageAlt?: string;
  isExpanded?: boolean;
  onDetailClick?: () => void;
};

const BoothCard = ({
  zone,
  name,
  description,
  location,
  time,
  target,
  imageSrc,
  imageAlt,
  isExpanded = false,
  onDetailClick,
}: BoothCardProps) => {
  return (
    <article className="flex w-full flex-col gap-2.5 rounded-[12px] border border-border bg-white px-6 pb-2.5 pt-6">
      <div className="flex w-full flex-col items-start gap-5">
        <ZoneBadge label={zone} />
        <h3 className="font-wanted-sans text-heading2 font-bold tracking-tight text-ink">{name}</h3>
        <p className="font-wanted-sans text-body1 leading-[1.4] tracking-tight text-[#4d4d4d] whitespace-pre-line">
          {description}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: isExpanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.3s ease',
        }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-5 pt-5">
            <div className="flex w-full flex-col gap-2.5">
              <p className="font-wanted-sans text-body1 font-medium tracking-tight text-[#999]">
                진행장소: {location}
              </p>
              <p className="font-wanted-sans text-body1 font-medium tracking-tight text-[#999]">
                진행시간: {time}
              </p>
              <p className="font-wanted-sans text-body1 font-medium tracking-tight text-[#999]">
                참여대상: {target}
              </p>
            </div>
            <div className="aspect-[335/269] w-full overflow-hidden rounded-[8px]">
              <img src={imageSrc} alt={imageAlt ?? name} className="size-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onDetailClick}
        className="flex h-6 w-[72px] items-center justify-center self-center gap-1"
      >
        <span className="font-wanted-sans text-[14px] font-medium leading-none tracking-[-0.02em] text-right text-gray whitespace-nowrap">
          상세정보
        </span>
        <ChevronDown
          aria-hidden
          size={16}
          className={`text-gray transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
    </article>
  );
};

export default BoothCard;
