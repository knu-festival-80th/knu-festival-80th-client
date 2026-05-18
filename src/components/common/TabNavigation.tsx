import { useLocation } from 'react-router-dom';
import TabBar from './TabBar';

interface Tab {
  label: string;
  path: string;
}

interface TabNavigationProps {
  tabs: readonly Tab[];
  layoutId?: string;
}

const TabNavigation = ({ tabs, layoutId = 'tab-indicator' }: TabNavigationProps) => {
  const { pathname } = useLocation();

  const isActive = (path: string) => {
    const isIndex = tabs.some((tab) => tab.path !== path && tab.path.startsWith(path));
    return isIndex ? pathname === path : pathname.startsWith(path);
  };

  const activeKey = tabs.find((tab) => isActive(tab.path))?.path ?? tabs[0].path;

  return (
    <TabBar
      tabs={tabs.map((t) => ({ key: t.path, label: t.label, path: t.path }))}
      activeKey={activeKey}
      layoutId={layoutId}
    />
  );
};

export default TabNavigation;
