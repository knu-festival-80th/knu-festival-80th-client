import { Suspense, useEffect, useState } from 'react';

import { LazyPhotoboothTab } from '@/components/hobanustagram/LazyPhotoboothTab';
import { HobanustagramTabBar } from '@/components/hobanustagram/HobanustagramTabBar';
import { IntroTab } from '@/components/hobanustagram/IntroTab';
import { preloadPhotoboothTab, useIntroPhotoboothPreload } from '@/hooks/useHobanustagramPreload';
import type { HobanustagramTab } from '@/types/hobanustagram';

export const HobanustagramExperience = () => {
  const [activeTab, setActiveTab] = useState<HobanustagramTab>('intro');
  const isIntroTab = activeTab === 'intro';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [activeTab]);

  useIntroPhotoboothPreload(isIntroTab);

  const handleNavigateToPhotobooth = () => {
    preloadPhotoboothTab();
    setActiveTab('photobooth');
  };

  return (
    <>
      <HobanustagramTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      {isIntroTab && (
        <IntroTab
          onNavigateToPhotobooth={handleNavigateToPhotobooth}
          onPhotoboothIntent={preloadPhotoboothTab}
        />
      )}
      {activeTab === 'photobooth' && (
        <Suspense fallback={<div className="min-h-screen bg-white" aria-busy="true" />}>
          <LazyPhotoboothTab />
        </Suspense>
      )}
    </>
  );
};
