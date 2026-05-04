import { NavLink, Outlet, useParams } from 'react-router-dom';

export default function BoothLayout() {
  const { boothId } = useParams<{ boothId: string }>();

  const tabs = [
    { to: `/admin/booth/${boothId}`, label: '부스 정보', end: true },
    { to: `/admin/booth/${boothId}/menus`, label: '메뉴' },
    { to: `/admin/booth/${boothId}/waitings`, label: '대기열' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-heading2 font-semibold text-text">부스 #{boothId} 운영</h1>
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
