import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import PageLoader from '@/components/common/PageLoader';
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
        <main className="flex flex-1 flex-col">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader className="min-h-[calc(100dvh-4rem)]" />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </div>
  );
}
