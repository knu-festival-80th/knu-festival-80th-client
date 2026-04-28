import { useState } from 'react';
import { LuMenu } from 'react-icons/lu';
import { NavigationDrawer } from '../NavigationDrawer/NavigationDrawer';
import knu80thLogo from '@/assets/logo/knu80th_logo_dark.png';

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between bg-background px-5 shadow-sm">
        <img src={knu80thLogo} alt="KNU 80주년 대동제" className="h-4.5 w-47.5 object-contain" />
        <button type="button" className="text-text" onClick={() => setIsDrawerOpen(true)}>
          <LuMenu size={24} />
        </button>
      </header>
      <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
