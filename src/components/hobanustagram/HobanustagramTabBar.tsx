import type { HobanustagramTab } from '@/types/hobanustagram';

const tabs: Array<{ key: HobanustagramTab; label: string }> = [
  { key: 'intro', label: '소개' },
  { key: 'photobooth', label: '포토부스' },
];

export interface HobanustagramTabBarProps {
  activeTab: HobanustagramTab;
  onTabChange: (tab: HobanustagramTab) => void;
}

export const HobanustagramTabBar = ({ activeTab, onTabChange }: HobanustagramTabBarProps) => {
  return (
    <nav
      className="sticky top-16 z-40 flex h-9 gap-7 overflow-x-auto border-b border-border bg-white px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="호반우스타그램 메뉴"
    >
      {tabs.map((tab) => {
        const selected = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            className={`flex h-9 shrink-0 items-center justify-center border-b-2 text-center text-[16px] leading-none tracking-[-0.32px] ${
              selected
                ? 'border-sub-red font-bold text-black'
                : 'border-transparent font-normal text-gray'
            }`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};
