import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export default function MainLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="page-frame min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-[375px] flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
