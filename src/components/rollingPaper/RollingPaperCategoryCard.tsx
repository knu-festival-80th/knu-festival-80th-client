import type { RollingPaperCategory } from '@/constants/rollingPaper';
import { getRollingPaperCategoryVisual } from './rollingPaperCategoryVisuals';

type RollingPaperCategoryCardProps = {
  category: RollingPaperCategory;
  index: number;
  isCurrent?: boolean;
  onClick?: () => void;
};

export default function RollingPaperCategoryCard({
  category,
  index,
  isCurrent = false,
  onClick,
}: RollingPaperCategoryCardProps) {
  const visual = getRollingPaperCategoryVisual(index);
  const categoryNumber = String(index + 1).padStart(2, '0');

  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between rounded-xl border bg-white p-5 text-left transition ${
        isCurrent ? 'border-sub-red' : 'border-border hover:border-sub-red/50'
      }`}
      onClick={onClick}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-2.5 pr-4">
        <span className="flex items-center gap-1.5 font-wanted-sans text-caption font-bold leading-none tracking-[-0.02em] text-sub-red">
          <span>CATEGORY</span>
          <span>{categoryNumber}</span>
          {isCurrent && (
            <span className="rounded-full bg-sub-red px-1.5 py-[3px] text-[10px] font-bold leading-none text-white">
              현재
            </span>
          )}
        </span>
        <span className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.02em] text-black">
          {category.label}
        </span>
        <span className="whitespace-pre-line font-wanted-sans text-sm font-medium leading-[1.3] tracking-[-0.02em] text-[#999]">
          {category.description}
        </span>
      </span>
      <span
        className="flex size-[90px] shrink-0 items-center justify-center overflow-hidden rounded-xl"
        style={{ backgroundColor: visual.background }}
      >
        <img src={visual.image} alt="" className="size-[84px] object-contain" aria-hidden="true" />
      </span>
    </button>
  );
}
