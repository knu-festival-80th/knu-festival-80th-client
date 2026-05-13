import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { rollingPaperApi } from '@/apis';
import RollingPaperSelectionNav from '@/components/rollingPaper/RollingPaperSelectionNav';
import { toRollingPaperCategory } from '@/components/rollingPaper/rollingPaperApiAdapter';

const rollingPaperQuestionsQueryKey = ['rollingPaper', 'questions'] as const;

export default function RollingPaperCategorySelectPage() {
  const questionsQuery = useQuery({
    queryKey: rollingPaperQuestionsQueryKey,
    queryFn: rollingPaperApi.listQuestions,
  });

  const categories = (questionsQuery.data ?? [])
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(toRollingPaperCategory);

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#f6f7ff]">
      <RollingPaperSelectionNav title="카테고리 선택" />

      <section className="px-5 pt-24 pb-16">
        <h2 className="text-center font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.02em] text-black">
          카테고리 선택
        </h2>

        {questionsQuery.isLoading ? (
          <p className="mt-12 text-center font-wanted-sans text-body1 text-gray">
            카테고리를 불러오는 중이에요.
          </p>
        ) : questionsQuery.isError ? (
          <p className="mt-12 text-center font-wanted-sans text-body1 text-gray">
            카테고리를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </p>
        ) : (
          <div className="mt-12 flex flex-col gap-[22px]">
            {categories.map((category) => (
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
                  보드 보기
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
