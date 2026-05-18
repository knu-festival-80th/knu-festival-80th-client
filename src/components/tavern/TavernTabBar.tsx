import TabBar from '@/components/common/TabBar';
import type { TopTab } from '@/components/tavern/types';

const TABS = [
  { key: 'intro', label: '소개' },
  { key: 'map', label: '지도' },
  { key: 'list', label: '주막목록' },
  { key: 'reservation', label: '예약 조회' },
] as const satisfies ReadonlyArray<{ key: TopTab; label: string }>;

type TavernTabBarProps = {
  activeTab: TopTab;
  onTabChange: (tab: TopTab) => void;
};

export default function TavernTabBar({ activeTab, onTabChange }: TavernTabBarProps) {
  return (
    <TabBar
      tabs={TABS}
      activeKey={activeTab}
      onChange={(key) => onTabChange(key as TopTab)}
      layoutId="tavern-tab"
      sticky
      ariaLabel="주막 지도 메뉴"
    />
  );
}
