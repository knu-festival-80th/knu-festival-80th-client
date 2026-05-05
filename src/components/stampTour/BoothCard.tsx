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

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M9 18l6-6-6-6"
      stroke="#808080"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
        className="flex w-full items-center justify-center gap-0.5"
      >
        <span className="font-wanted-sans text-body2 font-medium tracking-tight text-gray">
          상세정보
        </span>
        <ChevronRight />
      </button>
    </div>
  );
};

export default BoothCard;
