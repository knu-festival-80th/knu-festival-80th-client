import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

export default function MainLayout() {
  return (
    <div className="page-frame min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-[375px] flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
