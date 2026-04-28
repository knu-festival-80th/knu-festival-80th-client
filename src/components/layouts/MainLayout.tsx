import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

export default function MainLayout() {
  return (
    <div className="page-frame flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
