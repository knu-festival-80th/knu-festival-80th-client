import { useEffect } from 'react';
import ScratchCard from '@/components/instating/ScratchCard';

const TITLE = '매칭 결과 | 경북대학교 80주년 대동제';
const DEFAULT_TITLE = '경북대학교 80주년 대동제';

const InstaTingResultPage = () => {
  useEffect(() => {
    document.title = TITLE;

    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);

    return () => {
      document.title = DEFAULT_TITLE;
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5">
      <ScratchCard />
    </main>
  );
};

export default InstaTingResultPage;
