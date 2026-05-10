export interface GradientBannerProps {
  title?: string;
}

export const GradientBanner = ({ title }: GradientBannerProps) => {
  return (
    <div className="relative flex min-h-[270px] w-full flex-col items-start justify-end gap-2.5 overflow-hidden px-5 py-10.5 min-h-51">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(-55.79deg, rgb(255, 231, 110) 4.74%, rgb(255, 101, 104) 82.48%)',
        }}
      />
      <div
        className="absolute inset-0 mix-blend-soft-light"
        style={{
          background:
            'linear-gradient(180deg, rgba(0, 0, 0, 0.20) 0%, rgba(255, 255, 255, 0.00) 100%)',
        }}
      />
      {title && (
        <h2 className="relative font-wanted-sans text-[2.5rem] font-bold leading-[1.4] tracking-[-0.05rem] text-ink whitespace-pre-line">
          {title}
        </h2>
      )}
    </div>
  );
};
