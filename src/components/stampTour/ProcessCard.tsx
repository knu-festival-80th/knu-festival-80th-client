import OutlineButton from './OutlineButton';

interface ProcessCardProps {
  step: number;
  title: string;
  description: string;
  bgSrc: string;
  imgSrc: string;
}

const ProcessCard = ({ step, title, description, bgSrc, imgSrc }: ProcessCardProps) => (
  <div className="relative flex h-[470px] w-full flex-col justify-between overflow-hidden rounded-[6px] p-6">
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
      <p className="font-wanted-sans text-heading3 font-bold text-ink">{title}</p>
      <p className="font-wanted-sans text-body1 leading-[1.4] tracking-tight text-gray whitespace-pre-line">
        {description}
      </p>
    </div>

    <img
      aria-hidden
      src={imgSrc}
      alt=""
      className="pointer-events-none absolute left-6 top-[159px] w-[287px] object-contain"
    />

    <div className="relative flex justify-end">
      <OutlineButton label="지도 보기" showArrow variant="glass" />
    </div>
  </div>
);

export default ProcessCard;
