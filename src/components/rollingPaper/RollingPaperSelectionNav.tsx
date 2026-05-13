import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type RollingPaperSelectionNavProps = {
  title: string;
  closeTo?: string;
};

export default function RollingPaperSelectionNav({
  title,
  closeTo = '/rolling-paper',
}: RollingPaperSelectionNavProps) {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-white">
      <div className="flex h-16 items-center justify-between px-5">
        <button
          type="button"
          aria-label="이전 화면으로 이동"
          className="flex size-6 items-center justify-center text-ink"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.02em] text-black">
          {title}
        </h1>
        <button
          type="button"
          aria-label="롤링페이퍼 소개로 이동"
          className="flex size-6 items-center justify-center text-ink"
          onClick={() => navigate(closeTo)}
        >
          <X className="size-6" />
        </button>
      </div>
    </header>
  );
}
