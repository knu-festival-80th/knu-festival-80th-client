import TabNavigation from '@/components/common/TabNavigation';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import InstatingErrorFallback from '@/components/instating/InstatingErrorFallback';
import { Outlet } from 'react-router-dom';

const TABS = [
  { label: '소개', path: '/instating' },
  { label: '인스타팅 신청하기', path: '/instating/apply' },
  { label: '결과 조회', path: '/instating/result' },
] as const;

const InstatingPage = () => {
  return (
    <>
      <TabNavigation tabs={TABS} layoutId="instating-tab" />
      <ErrorBoundary fallback={<InstatingErrorFallback />}>
        <Outlet />
      </ErrorBoundary>
    </>
  );
};

export default InstatingPage;
