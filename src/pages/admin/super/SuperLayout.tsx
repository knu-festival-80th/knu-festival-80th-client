import { NavLink, Outlet } from 'react-router-dom';

const tabs = [
  { to: '/admin/super', label: '부스 목록', end: true },
  { to: '/admin/super/booths/new', label: '신규 부스 등록' },
];

export default function SuperLayout() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-heading2 font-semibold text-text">최고 관리자 콘솔</h1>
      <nav className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `rounded-t-md px-4 py-2 text-body2 transition ${
                isActive
                  ? 'border-b-2 border-primary font-semibold text-primary'
                  : 'text-text-muted hover:text-text'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <div className="rounded-lg bg-surface p-6 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
}
