import spinnerSvg from '@/assets/common/spinner.svg';

type HobanustagramFallbackProps = {
  className?: string;
};

export const HobanustagramFallback = ({ className = 'min-h-dvh' }: HobanustagramFallbackProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-[30px] bg-white ${className}`}
      role="status"
      aria-busy="true"
    >
      <img src={spinnerSvg} alt="" className="size-[46px] animate-spin" />
      <p className="text-body1 font-semibold text-text">잠시만 기다려주세요</p>
    </div>
  );
};
