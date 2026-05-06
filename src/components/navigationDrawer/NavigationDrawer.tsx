import { useEffect } from 'react';
import { LuX } from 'react-icons/lu';
import { ALL_SECTION_IDS, NAV_ITEMS } from '@/constants/navigationDrawer';
import type { NavigationDrawerProps } from '@/types/navigationDrawer';
import { useDrawerState } from '@/hooks/useDrawerState';
import { NavSectionItem } from './NavSectionItem';
import { NavLeafItem } from './NavLeafItem';
import knu80thLogo from '@/assets/logo/knu80th_logo_dark.png';

export const NavigationDrawer = ({ isOpen, onClose }: NavigationDrawerProps) => {
  const { openSections, activeSection, toggleSection } = useDrawerState(ALL_SECTION_IDS);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-55 bg-black/40 transition-opacity duration-300 md:left-[max(0px,calc(50%-300px))] md:right-[max(0px,calc(50%-300px))] ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <div className="pointer-events-none fixed inset-0 z-60 overflow-hidden md:left-[max(0px,calc(50%-300px))] md:right-[max(0px,calc(50%-300px))]">
        <div
          className={`pointer-events-auto absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{
            paddingBottom: '1.875rem',
            background:
              'linear-gradient(0deg, rgba(255, 208, 189, 0.50) 0.58%, rgba(255, 255, 255, 0.50) 60.27%), #FFF',
          }}
        >
          <div
            className="flex shrink-0 items-center justify-between px-5"
            style={{ paddingTop: '3.125rem', paddingBottom: '0.75rem' }}
          >
            <img
              src={knu80thLogo}
              alt="KNU 80주년 대동제"
              className="h-4.5 w-47.5 object-contain"
            />
            <button type="button" aria-label="메뉴 닫기" className="text-text" onClick={onClose}>
              <LuX size={24} />
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto border-b border-gray-200">
            {NAV_ITEMS.map((item) => {
              if ('children' in item) {
                return (
                  <NavSectionItem
                    key={item.id}
                    item={item}
                    isExpanded={openSections.has(item.id)}
                    isActive={activeSection === item.id}
                    onToggle={() => toggleSection(item.id)}
                    onClose={onClose}
                  />
                );
              }
              return <NavLeafItem key={item.id} item={item} onClose={onClose} />;
            })}
          </nav>
        </div>
      </div>
    </>
  );
};
