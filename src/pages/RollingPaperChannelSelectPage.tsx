import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  getRollingPaperBoardPath,
  getRollingPaperCategory,
  getRollingPaperChannelsByCategory,
} from '@/constants/rollingPaper';
import RollingPaperChannelCard from '@/components/rollingPaper/RollingPaperChannelCard';
import RollingPaperSelectionNav from '@/components/rollingPaper/RollingPaperSelectionNav';

export default function RollingPaperChannelSelectPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const category = getRollingPaperCategory(categoryId);
  const channels = getRollingPaperChannelsByCategory(category.id);

  if (category.id !== categoryId) {
    return <Navigate to={`/rolling-paper/categories/${category.id}/channels`} replace />;
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#f6f7ff]">
      <RollingPaperSelectionNav title="보드 선택" />

      <section className="px-3.5 pt-24 pb-16">
        <div className="text-center">
          <h2 className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.02em] text-black">
            보드 선택
          </h2>
          <p className="mt-3 font-wanted-sans text-caption font-medium text-gray">
            {category.label} 카테고리에서 작성할 채널을 골라주세요.
          </p>
        </div>

        <div className="mt-11 grid grid-cols-3 gap-x-2.5 gap-y-3">
          {channels.map((channel) => (
            <RollingPaperChannelCard
              key={channel.id}
              channel={channel}
              onClick={() => navigate(getRollingPaperBoardPath(category.id, channel.id))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
