import { useEffect, useRef, useState } from 'react';
import { LuChevronDown, LuMenu } from 'react-icons/lu';
import { NavigationDrawer } from '@/components/navigationDrawer/NavigationDrawer';
import knu80thLogo from '@/assets/logo/knu80th_logo_dark.png';
import { Link } from 'react-router-dom';

type Language = 'KR' | 'EN';

export const MainHeader = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lang, setLang] = useState<Language>('KR');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed left-1/2 top-0 z-50 w-full max-w-[600px] -translate-x-1/2 backdrop-blur-[15px] bg-[rgba(255,255,255,0.03)]">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-5">
          <div ref={langRef} className="relative">
            <button
              type="button"
              className="flex flex-col items-start self-stretch gap-2.5 rounded-full border border-[rgba(219,219,219,0.4)] bg-[rgba(219,219,219,0.1)] px-4 py-1.5"
              onClick={() => setIsLangOpen((prev) => !prev)}
            >
              <div className="flex items-center gap-0.5">
                <span className="font-sans text-sm font-medium text-[#1A1A1A]">{lang}</span>
                <LuChevronDown
                  size={20}
                  className={`text-[#1A1A1A] transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>
            {isLangOpen && (
              <div className="absolute left-0 top-full mt-1 min-w-full overflow-hidden rounded-lg border border-[rgba(219,219,219,0.4)] backdrop-blur-[15px] bg-[rgba(219,219,219,0.15)]">
                {(['KR', 'EN'] as Language[]).map((l, i) => (
                  <div key={l}>
                    {i > 0 && <div className="h-px bg-[rgba(219,219,219,0.4)]" />}
                    <button
                      type="button"
                      className={`block w-full px-4 py-2 text-left text-sm font-medium text-[#1A1A1A] hover:bg-black/10 ${lang === l ? 'font-semibold' : ''}`}
                      onClick={() => {
                        setLang(l);
                        setIsLangOpen(false);
                      }}
                    >
                      {l}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/"
            aria-label="홈으로 이동"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              src={knu80thLogo}
              alt="KNU 80주년 대동제"
              className="h-4.5 w-47.5 object-contain"
              style={{ aspectRatio: '95 / 9' }}
            />
          </Link>

          <button type="button" className="text-ink" onClick={() => setIsDrawerOpen(true)}>
            <LuMenu size={24} />
          </button>
        </div>
      </header>
      <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
