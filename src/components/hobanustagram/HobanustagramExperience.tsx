import { useEffect, useState } from 'react';

import type { HobanustagramTab } from '@/types/hobanustagram';
import { HobanustagramTabBar } from './HobanustagramTabBar';
import { IntroTab } from './IntroTab';
import { PhotoboothTab } from './PhotoboothTab';

export const HobanustagramExperience = () => {
  const [activeTab, setActiveTab] = useState<HobanustagramTab>('intro');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [activeTab]);

  return (
    <>
      <HobanustagramTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'intro' && (
        <IntroTab onNavigateToPhotobooth={() => setActiveTab('photobooth')} />
      )}
      {activeTab === 'photobooth' && <PhotoboothTab />}
    </>
  );
};
