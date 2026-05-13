import { Link } from 'react-router-dom';
import {
  ROLLING_PAPER_CATEGORIES,
  getRollingPaperChannelsByCategory,
} from '@/constants/rollingPaper';
import RollingPaperSelectionNav from '@/components/rollingPaper/RollingPaperSelectionNav';

export default function RollingPaperCategorySelectPage() {
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#f6f7ff]">
      <RollingPaperSelectionNav title="카테고리 선택" />

      <section className="px-5 pt-24 pb-16">
        <h2 className="text-center font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.02em] text-black">
          카테고리 선택
        </h2>

        <div className="mt-12 flex flex-col gap-[22px]">
          {ROLLING_PAPER_CATEGORIES.map((category) => {
            const firstChannel = getRollingPaperChannelsByCategory(category.id)[0];

            return (
              <Link
                key={category.id}
                to={`/rolling-paper/categories/${category.id}/channels`}
                className="flex min-h-[61px] items-center justify-between bg-[#d9d9d9] px-5 py-4 transition hover:bg-[#d0d0d0]"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.02em] text-black">
                    {category.label}
                  </span>
                  <span className="truncate font-wanted-sans text-caption font-medium text-gray">
                    {category.description}
                  </span>
                </div>
                <span className="shrink-0 font-wanted-sans text-caption font-semibold text-gray">
                  {firstChannel.label}부터
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
