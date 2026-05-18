import performancePreview from '@/assets/images/performance-preview.png';
import ViewAllButton from '@/components/home/ViewAllButton';

export default function PerformanceLocationSection() {
  return (
    <section className="mt-10 flex flex-col gap-7 px-5">
      <div className="flex flex-col items-start gap-2.5">
        <h2 className="text-[20px] font-bold leading-none tracking-[-0.4px] text-[#1a1a1a]">
          공연 위치
        </h2>
        <p className="text-[14px] font-medium leading-none tracking-[-0.28px] text-[#808080]">
          모든 공연은 대공연장에서 진행됩니다.
        </p>
        <ViewAllButton
          to="/map?tab=map&focus=performance"
          label="자세히 보러가기"
          className="mt-2"
        />
      </div>

      <div className="h-[354px] overflow-hidden rounded-xl bg-[#f3f3f3]">
        <img
          src={performancePreview}
          alt="대공연장 지도 미리보기"
          className="h-full w-full object-cover object-[5%_40%]"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  );
}
