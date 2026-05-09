import { Outlet } from 'react-router-dom';
import TabNavigation from '@/components/instating/TabNavigation';

const InstaTingPage = () => {
  return (
    <>
      <TabNavigation />
      <Outlet />
    </>
  );
};

export default InstaTingPage;
