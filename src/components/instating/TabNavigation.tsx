import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

const TABS = [
  { label: '소개', path: '/instating' },
  { label: '인스타팅 신청하기', path: '/instating/apply' },
  { label: '결과 조회', path: '/instating/result' },
] as const;

const TabNavigation = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    path === '/instating' ? pathname === '/instating' : pathname.startsWith(path);

  return (
    <nav className="flex gap-7 border-b border-border bg-white px-5">
      {TABS.map(({ label, path }) => {
        const active = isActive(path);
        return (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className={`relative py-2.5 font-wanted-sans text-body1 tracking-tight transition-colors ${
              active ? 'font-bold text-ink' : 'text-gray'
            }`}
          >
            {label}
            {active && (
              <motion.div
                layoutId="tab-indicator"
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
