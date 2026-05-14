import { X } from 'lucide-react';
import type { RollingPaperCategory } from '@/constants/rollingPaper';
import RollingPaperCategoryCard from './RollingPaperCategoryCard';

type RollingPaperCategoryChangeDialogProps = {
  currentCategory: RollingPaperCategory;
  categories: RollingPaperCategory[];
  onClose: () => void;
  onSelectCategory: (category: RollingPaperCategory) => void;
};

export default function RollingPaperCategoryChangeDialog({
  currentCategory,
  categories,
  onClose,
  onSelectCategory,
}: RollingPaperCategoryChangeDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/35"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rolling-paper-category-change-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[calc(100dvh-100px)] w-full max-w-[600px] overflow-hidden rounded-t-[8px] bg-white shadow-[0_-18px_50px_rgba(0,0,0,0.14)]">
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <h2
            id="rolling-paper-category-change-title"
            className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.02em] text-black"
          >
            카테고리 변경하기
          </h2>
          <button
            type="button"
            className="flex size-6 items-center justify-center text-ink"
            aria-label="카테고리 변경 닫기"
            onClick={onClose}
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="flex max-h-[calc(100dvh-164px)] flex-col gap-2 overflow-y-auto px-5 py-5">
          {categories.map((category, index) => (
            <RollingPaperCategoryCard
              key={category.id}
              category={category}
              index={index}
              isCurrent={category.id === currentCategory.id}
              onClick={() => onSelectCategory(category)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
