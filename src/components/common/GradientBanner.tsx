export const INTRO_HERO_BACKGROUND_IMAGE =
  'linear-gradient(129.83deg, rgba(255, 204, 0, 0.062) 2.17%, rgba(255, 66, 66, 0) 97.52%), linear-gradient(127.85deg, rgb(255, 175, 85) 15.97%, rgb(255, 56, 60) 91.11%)';

export interface GradientBannerProps {
  title?: string;
}

export const GradientBanner = ({ title }: GradientBannerProps) => {
  return (
    <div
      className="relative flex min-h-[270px] w-full flex-col items-start justify-end gap-2.5 overflow-hidden px-5 py-[42px]"
      style={{ backgroundImage: INTRO_HERO_BACKGROUND_IMAGE }}
    >
      {title && (
        <h2 className="relative font-wanted-sans text-[2.5rem] font-bold leading-[1.4] tracking-[-0.05rem] text-ink whitespace-pre-line">
          {title}
        </h2>
      )}
    </div>
  );
};
