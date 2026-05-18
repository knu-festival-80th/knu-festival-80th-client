import TabBar from '@/components/common/TabBar';

type RollingPaperTabsProps = {
  active: 'intro' | 'board';
};

const TABS = [
  { key: 'intro', label: '소개', path: '/rolling-paper' },
  { key: 'board', label: '롤링페이퍼', path: '/rolling-paper/categories' },
] as const;

export default function RollingPaperTabs({ active }: RollingPaperTabsProps) {
  return (
    <TabBar
      tabs={TABS}
      activeKey={active}
      layoutId="rolling-paper-tab"
      ariaLabel="롤링페이퍼 페이지 탭"
    />
  );
}
