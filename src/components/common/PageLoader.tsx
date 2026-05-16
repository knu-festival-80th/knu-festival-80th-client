import spinnerSvg from '@/assets/common/spinner.svg';

export default function PageLoader() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-[30px]">
      <img src={spinnerSvg} alt="" className="size-[46px] animate-spin" />
      <p className="text-body1 font-semibold text-text">잠시만 기다려주세요</p>
    </div>
  );
}
