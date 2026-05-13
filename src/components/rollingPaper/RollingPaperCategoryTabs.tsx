import { Link } from 'react-router-dom';
import {
  ROLLING_PAPER_CATEGORIES,
  getRollingPaperBoardPath,
  type RollingPaperCategory,
} from '@/constants/rollingPaper';

type RollingPaperCategoryTabsProps = {
  activeCategory: RollingPaperCategory;
};

export default function RollingPaperCategoryTabs({
  activeCategory,
}: RollingPaperCategoryTabsProps) {
  return (
    <div className="border-b border-border bg-white">
      <nav
        className="flex overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="롤링페이퍼 카테고리"
      >
        {ROLLING_PAPER_CATEGORIES.map((category) => {
          const isActive = category.id === activeCategory.id;

          return (
            <Link
              key={category.id}
              to={getRollingPaperBoardPath(category.id)}
              className={`shrink-0 border-b-2 px-3.5 py-2.5 font-wanted-sans text-body1 font-bold leading-none tracking-[-0.02em] ${
                isActive
                  ? 'border-sub-red bg-sub-red text-black'
                  : 'border-sub-red bg-white text-black'
              }`}
            >
              {category.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
