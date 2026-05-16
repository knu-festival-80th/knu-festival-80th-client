import React from 'react';

export interface ProcessCardProps {
  step: string;
  title: string;
  description: React.ReactNode;
  bgSrc: string;
  illustSrc: string;
}

const ProcessCard = ({ step, title, description, bgSrc, illustSrc }: ProcessCardProps) => (
  <article className="relative flex aspect-4/5 w-full flex-col overflow-hidden rounded-md p-6">
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <img src={bgSrc} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(132.09deg, rgba(255,255,255,0.9) 34.45%, rgba(255,255,255,0) 100%)',
        }}
      />
    </div>

    <div className="relative flex flex-col gap-2.5">
      <p className="font-wanted-sans text-body1 font-bold tracking-tight text-ink">{step}</p>
      <h3 className="font-wanted-sans text-subheading font-bold tracking-tight text-ink">
        {title}
      </h3>
      <p className="font-wanted-sans text-body1 leading-[1.4] tracking-tight text-gray">
        {description}
      </p>
    </div>

    <div className="relative min-h-0 flex-1 overflow-hidden">
      <img
        aria-hidden
        src={illustSrc}
        alt=""
        loading="lazy"
        className="pointer-events-none absolute inset-0 size-full object-contain object-bottom"
      />
    </div>
  </article>
);

export default ProcessCard;
