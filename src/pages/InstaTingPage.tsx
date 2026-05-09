import { Outlet } from 'react-router-dom';
import TabNavigation from '@/components/instating/TabNavigation';

const InstaTingLayout = () => {
  return (
    <>
      <TabNavigation />
      <Outlet />
    </>
  );
};

export default InstaTingLayout;
