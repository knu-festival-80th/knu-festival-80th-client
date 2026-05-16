import TabNavigation from '@/components/common/TabNavigation';
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
      <Outlet />
    </>
  );
};

export default InstatingPage;
