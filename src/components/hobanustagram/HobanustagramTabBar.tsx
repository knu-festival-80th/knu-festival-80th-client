import TabBar from '@/components/common/TabBar';
import type { HobanustagramTab } from '@/types/hobanustagram';

const TABS = [
  { key: 'intro', label: '소개' },
  { key: 'photobooth', label: '포토부스' },
] as const satisfies ReadonlyArray<{ key: HobanustagramTab; label: string }>;

export interface HobanustagramTabBarProps {
  activeTab: HobanustagramTab;
  onTabChange: (tab: HobanustagramTab) => void;
}

export const HobanustagramTabBar = ({ activeTab, onTabChange }: HobanustagramTabBarProps) => {
  return (
    <TabBar
      tabs={TABS}
      activeKey={activeTab}
      onChange={(key) => onTabChange(key as HobanustagramTab)}
      layoutId="hobanustagram-tab"
      sticky
      ariaLabel="호반우스타그램 메뉴"
    />
  );
};
