import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { rollingPaperApi } from '@/apis';
import RollingPaperCategoryTabs from '@/components/rollingPaper/RollingPaperCategoryTabs';
import RollingPaperChannelCard from '@/components/rollingPaper/RollingPaperChannelCard';
import RollingPaperPageTransition from '@/components/rollingPaper/RollingPaperPageTransition';
import RollingPaperTabs from '@/components/rollingPaper/RollingPaperTabs';
import {
  rollingPaperItemMotion,
  rollingPaperStaggerContainerMotion,
} from '@/components/rollingPaper/rollingPaperMotion';
import {
  toRollingPaperCategory,
  toRollingPaperChannel,
} from '@/components/rollingPaper/rollingPaperApiAdapter';
import {
  getRollingPaperBoardPath,
  ROLLING_PAPER_CATEGORIES,
  ROLLING_PAPER_CHANNELS_PER_CATEGORY,
} from '@/constants/rollingPaper';

export default function RollingPaperChannelSelectPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const questionId = Number(categoryId);
  const isValidQuestionId = Number.isFinite(questionId);
  const questionsQuery = useQuery({
    queryKey: ['rollingPaper', 'questions'],
    queryFn: rollingPaperApi.listQuestions,
  });
  const boardsQuery = useQuery({
    queryKey: ['rollingPaper', 'boards', questionId],
    queryFn: () => rollingPaperApi.listBoards(questionId),
    enabled: isValidQuestionId,
  });

  const categories = (questionsQuery.data ?? [])
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(toRollingPaperCategory);
  const category = categories.find((item) => item.id === categoryId);
  const activeCategory = category ?? categories[0] ?? ROLLING_PAPER_CATEGORIES[0];
  const channels = (boardsQuery.data ?? [])
    .map(toRollingPaperChannel)
    .slice(0, ROLLING_PAPER_CHANNELS_PER_CATEGORY);

  if (!isValidQuestionId && categories[0]) {
    return <Navigate to={`/rolling-paper/categories/${categories[0].id}/channels`} replace />;
  }

  return (
    <>
      <RollingPaperTabs active="board" />
      <RollingPaperPageTransition className="min-h-[calc(100dvh-64px)] bg-white">
        <RollingPaperCategoryTabs
          activeCategory={activeCategory}
          categories={categories}
          gridTo="/rolling-paper/categories"
        />

        <section className="px-5 py-7">
          <motion.div className="text-center" {...rollingPaperItemMotion}>
            <h2 className="font-wanted-sans text-[24px] font-bold leading-none tracking-[-0.02em] text-black">
              보드 선택
            </h2>
            <p className="mt-2.5 font-wanted-sans text-body1 font-normal leading-none tracking-[-0.02em] text-gray">
              빈 자리가 있는 보드를 선택해주세요
            </p>
          </motion.div>

          {questionsQuery.isLoading || boardsQuery.isLoading ? (
            <p className="mt-11 text-center font-wanted-sans text-body1 text-gray">
              보드를 불러오는 중이에요.
            </p>
          ) : questionsQuery.isError || boardsQuery.isError || !category ? (
            <p className="mt-11 text-center font-wanted-sans text-body1 text-gray">
              보드를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </p>
          ) : (
            <motion.div
              className="mt-6 grid grid-cols-3 gap-2.5"
              {...rollingPaperStaggerContainerMotion}
            >
              {channels.map((channel) => (
                <motion.div key={channel.id} {...rollingPaperItemMotion}>
                  <RollingPaperChannelCard
                    channel={channel}
                    onClick={() => navigate(getRollingPaperBoardPath(category.id, channel.id))}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </RollingPaperPageTransition>
    </>
  );
}
