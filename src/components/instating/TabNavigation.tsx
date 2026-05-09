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
    <nav className="flex gap-7 border-b border-border px-5 bg-white">
      {TABS.map(({ label, path }) => {
        const active = isActive(path);
        return (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className={`py-2 font-wanted-sans text-body1 tracking-tight ${
              active ? 'border-b-2 border-sub-red pb-2.5 font-bold text-ink' : 'text-gray'
            }`}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
};

export default TabNavigation;
