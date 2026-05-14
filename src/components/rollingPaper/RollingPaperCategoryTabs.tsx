import { Link } from 'react-router-dom';
import { ROLLING_PAPER_CATEGORIES, type RollingPaperCategory } from '@/constants/rollingPaper';

type RollingPaperCategoryTabsProps = {
  activeCategory: RollingPaperCategory;
  categories?: RollingPaperCategory[];
};

export default function RollingPaperCategoryTabs({
  activeCategory,
  categories = ROLLING_PAPER_CATEGORIES,
}: RollingPaperCategoryTabsProps) {
  return (
    <div className="border-b border-border bg-white">
      <nav
        className="flex overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="롤링페이퍼 카테고리"
      >
        {categories.map((category) => {
          const isActive = category.id === activeCategory.id;

          return (
            <Link
              key={category.id}
              to={`/rolling-paper/categories/${category.id}/channels`}
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
