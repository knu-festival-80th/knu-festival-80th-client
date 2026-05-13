import { Outlet } from 'react-router-dom';
import TabNavigation from '@/components/instating/TabNavigation';

const InstatingPage = () => {
  return (
    <>
      <TabNavigation />
      <Outlet />
    </>
  );
};

export default InstatingPage;
