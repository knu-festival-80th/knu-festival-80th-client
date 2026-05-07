import OutlineButton from './OutlineButton';

interface ProcessCardProps {
  step: number;
  title: string;
  description: string;
  bgSrc: string;
  imgSrc: string;
  onButtonClick?: () => void;
}

const ProcessCard = ({
  step,
  title,
  description,
  bgSrc,
  imgSrc,
  onButtonClick,
}: ProcessCardProps) => (
  <article className="relative flex aspect-4/5 w-full flex-col overflow-hidden rounded-md p-6">
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <img src={bgSrc} alt="" className="absolute inset-0 size-full object-cover" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(129.57deg, rgba(255,255,255,0.9) 34.45%, rgba(255,255,255,0) 100%)',
        }}
      />
    </div>

    <div className="relative flex flex-col gap-2.5">
      <p className="font-wanted-sans text-body1 font-medium tracking-tight text-[#333]">
        Step {step}
      </p>
      <h3 className="font-wanted-sans text-heading3 font-bold text-ink">{title}</h3>
      <p className="font-wanted-sans text-body1 leading-[1.4] tracking-tight text-gray whitespace-pre-line">
        {description}
      </p>
    </div>

    <div className="relative min-h-0 flex-1 overflow-hidden">
      <img
        aria-hidden
        src={imgSrc}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-contain object-bottom"
      />
    </div>

    <div className="relative flex justify-end">
      <OutlineButton label="지도 보기" showArrow variant="glass" onClick={onButtonClick} />
    </div>
  </article>
);

export default ProcessCard;
