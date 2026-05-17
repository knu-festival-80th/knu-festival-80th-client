import spinnerSvg from '@/assets/common/spinner.svg';

type PageLoaderProps = {
  className?: string;
};

export default function PageLoader({ className }: PageLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-[30px] bg-background ${className ?? 'min-h-dvh'}`}
    >
      <img src={spinnerSvg} alt="" className="size-[46px] animate-spin" />
      <p className="text-body1 font-semibold text-text">잠시만 기다려주세요</p>
    </div>
  );
}
