import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export type TabItem = {
  key: string;
  label: string;
  path?: string;
};

type TabBarProps = {
  tabs: readonly TabItem[];
  activeKey: string;
  onChange?: (key: string) => void;
  layoutId?: string;
  sticky?: boolean;
  ariaLabel?: string;
};

export default function TabBar({
  tabs,
  activeKey,
  onChange,
  layoutId = 'tab-indicator',
  sticky = false,
  ariaLabel,
}: TabBarProps) {
  const navigate = useNavigate();

  const handleClick = (tab: TabItem) => {
    onChange?.(tab.key);
    if (tab.path) navigate(tab.path);
  };

  return (
    <nav
      className={[
        'flex gap-7 overflow-x-auto border-b border-border bg-white px-5',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        sticky ? 'sticky top-16 z-40' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleClick(tab)}
            aria-current={active ? 'page' : undefined}
            className={`relative shrink-0 py-2.5 font-wanted-sans text-body1 tracking-tight transition-colors ${
              active ? 'font-bold text-ink' : 'font-normal text-gray'
            }`}
          >
            {tab.label}
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
}
