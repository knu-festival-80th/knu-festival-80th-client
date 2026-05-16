import { Outlet } from 'react-router-dom';
import TabNavigation from '@/components/common/TabNavigation';

const TABS = [
  { label: '소개', path: '/stamptour' },
  { label: '부스 위치 확인하기', path: '/stamptour/booths' },
] as const;

const StampTourPage = () => {
  return (
    <>
      <TabNavigation tabs={TABS} layoutId="stamptour-tab" />
      <Outlet />
    </>
  );
};

export default StampTourPage;
