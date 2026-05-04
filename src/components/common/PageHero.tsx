import type { ReactNode } from 'react';

type PageHeroProps = {
  title: ReactNode;
};

export default function PageHero({ title }: PageHeroProps) {
  return (
    <div
      className="relative flex min-h-[270px] flex-col justify-end overflow-hidden px-5 py-[42px]"
      style={{ background: 'linear-gradient(-55.8deg, #FFE76E 4.7%, #FF6568 82.5%)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 to-transparent mix-blend-soft-light"
      />
      <p className="relative font-wanted-sans text-display1 font-bold leading-[1.4] tracking-[-0.02em] text-ink">
        {title}
      </p>
    </div>
  );
}
