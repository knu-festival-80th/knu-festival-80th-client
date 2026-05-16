import hobanwooFallback from '@/assets/instating/Hobanwoo/hobanwoo_fallback.webp';

interface MatchingStatusFallbackProps {
  className?: string;
  onRetry: () => void;
}

const MatchingStatusFallback = ({ className, onRetry }: MatchingStatusFallbackProps) => (
  <div
    className={`flex w-full flex-col items-center justify-center gap-6 bg-white px-5 ${className}`}
  >
    <img src={hobanwooFallback} alt="" className="w-32" />
    <button
      type="button"
      onClick={onRetry}
      className="h-[40px] w-full max-w-[120px] rounded-[8px] bg-[#FF3D3D] font-wanted-sans text-[14px] font-medium leading-none tracking-[-0.28px] text-white"
    >
      새로 고침
    </button>
  </div>
);

export default MatchingStatusFallback;
