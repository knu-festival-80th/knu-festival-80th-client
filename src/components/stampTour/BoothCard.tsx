import arrowDown from '@/assets/stampTour/arrow_down.svg';
import ZoneBadge from './ZoneBadge';

type BoothCardBase = {
  zone: string;
  name: string;
  description: string;
};

type ExpandedBoothCard = BoothCardBase & {
  variant: 'expanded';
  location: string;
  time: string;
  target: string;
  imageSrc: string;
  imageAlt?: string;
};

type CompactBoothCard = BoothCardBase & {
  variant?: 'compact';
  onDetailClick?: () => void;
};

type BoothCardProps = ExpandedBoothCard | CompactBoothCard;

const BoothCard = (props: BoothCardProps) => {
  const { zone, name, description } = props;

  if (props.variant === 'expanded') {
    return (
      <div className="flex w-full flex-col items-start gap-5 rounded-[12px] border border-border bg-white p-6">
        <ZoneBadge label={zone} />
        <p className="font-wanted-sans text-heading2 font-bold tracking-tight text-ink">{name}</p>
        <p className="font-wanted-sans text-body1 leading-[1.4] tracking-tight text-[#4d4d4d]">
          {description}
        </p>
        <div className="flex w-full flex-col gap-2.5">
          <p className="font-wanted-sans text-body1 font-medium tracking-tight text-[#999]">
            진행장소: {props.location}
          </p>
          <p className="font-wanted-sans text-body1 font-medium tracking-tight text-[#999]">
            진행시간: {props.time}
          </p>
          <p className="font-wanted-sans text-body1 font-medium tracking-tight text-[#999]">
            참여대상: {props.target}
          </p>
        </div>
        <div className="aspect-[335/269] w-full overflow-hidden rounded-[8px]">
          <img
            src={props.imageSrc}
            alt={props.imageAlt ?? name}
            className="size-full object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2.5 rounded-[12px] border border-border bg-white px-6 pb-2.5 pt-6">
      <div className="flex w-full flex-col items-start gap-5">
        <ZoneBadge label={zone} />
        <p className="font-wanted-sans text-heading2 font-bold tracking-tight text-ink">{name}</p>
        <p className="font-wanted-sans text-body1 leading-[1.4] tracking-tight text-[#4d4d4d]">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={props.onDetailClick}
        className="flex h-6 w-[72px] items-center justify-center self-center gap-1"
      >
        <span className="font-wanted-sans text-[14px] font-medium leading-none tracking-[-0.02em] text-right text-gray whitespace-nowrap">
          상세정보
        </span>
        <img src={arrowDown} alt="" aria-hidden className="size-4" />
      </button>
    </div>
  );
};

export default BoothCard;
