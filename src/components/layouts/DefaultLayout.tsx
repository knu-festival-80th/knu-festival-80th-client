import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

export default function DefaultLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-background md:bg-[#eceef3]">
      <div className="page-frame mx-auto flex min-h-dvh w-full max-w-[600px] flex-col overflow-x-hidden bg-background md:shadow-[0_0_20px_rgba(29,32,56,0.14)]">
        <Header />
        <div className="h-16 shrink-0" />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
