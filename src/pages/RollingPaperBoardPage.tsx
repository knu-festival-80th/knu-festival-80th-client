import { useParams } from 'react-router-dom';
import RollingPaperBoard from '@/components/rollingPaper/RollingPaperBoard';

export default function RollingPaperBoardPage() {
  const { categoryId, channelId } = useParams();

  return (
    <RollingPaperBoard
      key={`${categoryId ?? 'default'}-${channelId ?? 'default'}`}
      categoryId={categoryId}
      channelId={channelId}
    />
  );
}
