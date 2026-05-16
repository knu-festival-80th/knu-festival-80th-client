import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const isActive = (path: string) => {
    const isIndex = tabs.some((tab) => tab.path !== path && tab.path.startsWith(path));
    return isIndex ? pathname === path : pathname.startsWith(path);
  };

  return (
    <nav className="flex gap-7 border-b border-border bg-white px-5">
      {tabs.map(({ label, path }) => {
        const active = isActive(path);
        return (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            aria-current={active ? 'page' : undefined}
            className={`relative py-2.5 font-wanted-sans text-body1 tracking-tight transition-colors ${
              active ? 'font-bold text-ink' : 'text-gray'
            }`}
          >
            {label}
            {active && (
              <motion.div
                layoutId={layoutId}
                className="absolute -bottom-px left-0 right-0 h-0.5 bg-sub-red"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default TabNavigation;
