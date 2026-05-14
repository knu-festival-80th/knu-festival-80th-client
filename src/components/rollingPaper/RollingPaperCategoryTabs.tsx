import { Link } from 'react-router-dom';
import { Grid3X3 } from 'lucide-react';
import { ROLLING_PAPER_CATEGORIES, type RollingPaperCategory } from '@/constants/rollingPaper';

type RollingPaperCategoryTabsProps = {
  activeCategory: RollingPaperCategory;
  categories?: RollingPaperCategory[];
  gridTo?: string;
  onGridClick?: () => void;
};

export default function RollingPaperCategoryTabs({
  activeCategory,
  categories = ROLLING_PAPER_CATEGORIES,
  gridTo = '/rolling-paper/categories',
  onGridClick,
}: RollingPaperCategoryTabsProps) {
  const gridClassName =
    'flex h-7 w-[38px] shrink-0 items-center justify-center rounded-full border border-border bg-white text-[#808080]';

  return (
    <div className="bg-[#f5f5f5] px-5 py-3">
      <nav
        className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="롤링페이퍼 카테고리"
      >
        {onGridClick ? (
          <button
            type="button"
            className={gridClassName}
            aria-label="카테고리 변경하기"
            onClick={onGridClick}
          >
            <Grid3X3 className="size-[18px]" />
          </button>
        ) : (
          <Link to={gridTo} className={gridClassName} aria-label="카테고리 목록으로 이동">
            <Grid3X3 className="size-[18px]" />
          </Link>
        )}

        {categories.map((category, index) => {
          const isActive = category.id === activeCategory.id;

          return (
            <Link
              key={category.id}
              to={`/rolling-paper/categories/${category.id}/channels`}
              className={`flex h-7 shrink-0 items-center gap-1 rounded-full px-2.5 font-wanted-sans leading-none tracking-[-0.02em] ${
                isActive ? 'bg-[#1a1a1a] text-white' : 'bg-white text-[#666]'
              }`}
            >
              <span className="text-[10px] font-semibold">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={`text-caption ${isActive ? 'font-bold' : 'font-medium'}`}>
                {category.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
