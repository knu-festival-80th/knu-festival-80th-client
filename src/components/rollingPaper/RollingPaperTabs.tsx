import { Link } from 'react-router-dom';

type RollingPaperTabsProps = {
  active: 'intro' | 'board';
};

const tabs = [
  { key: 'intro', label: '소개', to: '/rolling-paper' },
  { key: 'board', label: '롤링페이퍼', to: '/rolling-paper/board' },
] as const;

export default function RollingPaperTabs({ active }: RollingPaperTabsProps) {
  return (
    <div className="border-b border-border bg-white">
      <nav className="flex gap-7 px-5" aria-label="롤링페이퍼 페이지 탭">
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <Link
              key={tab.key}
              to={tab.to}
              className={`border-b-2 py-2.5 font-wanted-sans text-body1 leading-none tracking-[-0.02em] ${
                isActive
                  ? 'border-sub-red font-bold text-black'
                  : 'border-transparent font-normal text-gray'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
