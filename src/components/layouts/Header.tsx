import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuMenu } from 'react-icons/lu';
import { NavigationDrawer } from '@/components/navigationDrawer/NavigationDrawer';
import knu80thLogo from '@/assets/logo/knu80th_logo_dark.png';

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="fixed left-1/2 top-0 z-50 h-16 w-full max-w-150 -translate-x-1/2 bg-background shadow-sm">
        <div className="mx-auto flex h-full max-w-[600px] items-center justify-between px-5">
          <Link to="/" aria-label="홈으로 이동">
            <img
              src={knu80thLogo}
              alt="KNU 80주년 대동제"
              className="h-4.5 w-47.5 object-contain"
            />
          </Link>
          <button type="button" className="text-text" onClick={() => setIsDrawerOpen(true)}>
            <LuMenu size={24} />
          </button>
        </div>
      </header>
      <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
