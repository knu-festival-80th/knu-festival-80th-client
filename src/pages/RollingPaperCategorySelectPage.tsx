import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { rollingPaperApi } from '@/apis';
import RollingPaperCategoryCard from '@/components/rollingPaper/RollingPaperCategoryCard';
import RollingPaperPageTransition from '@/components/rollingPaper/RollingPaperPageTransition';
import RollingPaperTabs from '@/components/rollingPaper/RollingPaperTabs';
import {
  rollingPaperItemMotion,
  rollingPaperStaggerContainerMotion,
} from '@/components/rollingPaper/rollingPaperMotion';
import { toRollingPaperCategory } from '@/components/rollingPaper/rollingPaperApiAdapter';

const rollingPaperQuestionsQueryKey = ['rollingPaper', 'questions'] as const;

export default function RollingPaperCategorySelectPage() {
  const navigate = useNavigate();
  const questionsQuery = useQuery({
    queryKey: rollingPaperQuestionsQueryKey,
    queryFn: rollingPaperApi.listQuestions,
  });

  const categories = (questionsQuery.data ?? [])
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(toRollingPaperCategory);

  return (
    <RollingPaperPageTransition className="min-h-[calc(100dvh-64px)] bg-white">
      <RollingPaperTabs active="board" />

      <section className="px-5 py-7">
        <motion.div className="flex flex-col gap-2.5 text-center" {...rollingPaperItemMotion}>
          <h2 className="font-wanted-sans text-[24px] font-bold leading-none tracking-[-0.02em] text-black">
            카테고리 선택
          </h2>
          <p className="font-wanted-sans text-body1 font-normal leading-none tracking-[-0.02em] text-gray">
            참여하고 싶은 주제를 골라주세요
          </p>
        </motion.div>

        {questionsQuery.isLoading ? (
          <p className="mt-12 text-center font-wanted-sans text-body1 text-gray">
            카테고리를 불러오는 중이에요.
          </p>
        ) : questionsQuery.isError ? (
          <p className="mt-12 text-center font-wanted-sans text-body1 text-gray">
            카테고리를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </p>
        ) : (
          <motion.div className="mt-6 flex flex-col gap-2" {...rollingPaperStaggerContainerMotion}>
            {categories.map((category, index) => (
              <motion.div key={category.id} {...rollingPaperItemMotion}>
                <RollingPaperCategoryCard
                  category={category}
                  index={index}
                  onClick={() => navigate(`/rolling-paper/categories/${category.id}/channels`)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </RollingPaperPageTransition>
  );
}
