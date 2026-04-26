import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-6">
      <h1 className="m-0 text-heading2 text-text">페이지를 찾을 수 없습니다</h1>
      <Link to="/" className="rounded-md bg-primary px-3.5 py-2.5 text-body2 font-bold text-white">
        홈으로 돌아가기
      </Link>
    </main>
  );
}
