import type { TopTab } from '@/components/tavern/types';

const topTabs: Array<{ key: TopTab; label: string }> = [
  { key: 'intro', label: '소개' },
  { key: 'map', label: '지도' },
  { key: 'list', label: '주막목록' },
  { key: 'reservation', label: '예약 조회' },
];

type TavernTabBarProps = {
  activeTab: TopTab;
  onTabChange: (tab: TopTab) => void;
};

export default function TavernTabBar({ activeTab, onTabChange }: TavernTabBarProps) {
  return (
    <nav
      className="sticky top-16 z-40 flex h-9 gap-7 overflow-x-auto border-b border-[#e5e5e5] bg-white px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="주막 지도 메뉴"
    >
      {topTabs.map((tab) => {
        const selected = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            className={`flex h-9 shrink-0 items-center justify-center border-b-2 text-center text-[16px] leading-none tracking-[-0.32px] ${
              selected
                ? 'border-[#ff3d3d] font-bold text-black'
                : 'border-transparent font-normal text-[#808080]'
            }`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
