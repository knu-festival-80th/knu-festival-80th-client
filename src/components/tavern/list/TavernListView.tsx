import { FiChevronRight } from 'react-icons/fi';

import TavernCard from '@/components/tavern/list/TavernCard';
import { tavernSortOptions, type Tavern, type TavernSortKey } from '@/constants/taverns';

type TavernListViewProps = {
  expandedMenuId: string | null;
  sortKey: TavernSortKey;
  taverns: Tavern[];
  onMenuToggle: (id: string | null) => void;
  onRegister: (tavern: Tavern) => void;
  onSelectTavern: (tavern: Tavern) => void;
  onSortChange: (key: TavernSortKey) => void;
};

export default function TavernListView({
  expandedMenuId,
  sortKey,
  taverns,
  onMenuToggle,
  onRegister,
  onSelectTavern,
  onSortChange,
}: TavernListViewProps) {
  const isSimpleView = sortKey === 'simple';

  return (
    <section className="flex flex-col gap-3 px-5 py-6">
      <h1 className="text-[24px] font-bold leading-[1.6] tracking-[-0.48px]">주막 목록</h1>
      <TavernSortTabs sortKey={sortKey} onSortChange={onSortChange} />
      <div className={`flex flex-col ${isSimpleView ? 'gap-2' : 'gap-3'}`}>
        {taverns.map((tavern) => (
          <div key={tavern.id}>
            {isSimpleView ? (
              <TavernSimpleCard tavern={tavern} onSelect={() => onSelectTavern(tavern)} />
            ) : (
              <TavernCard
                expanded={expandedMenuId === tavern.id}
                tavern={tavern}
                onMenuToggle={() => onMenuToggle(expandedMenuId === tavern.id ? null : tavern.id)}
                onRegister={() => onRegister(tavern)}
                onSelect={() => onSelectTavern(tavern)}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function TavernSortTabs({
  sortKey,
  onSortChange,
}: {
  sortKey: TavernSortKey;
  onSortChange: (key: TavernSortKey) => void;
}) {
  return (
    <div className="flex w-full rounded-[8px] bg-[#f9f9f9] p-1" aria-label="주막 정렬">
      {tavernSortOptions.map((option) => {
        const selected = sortKey === option.key;

        return (
          <button
            key={option.key}
            type="button"
            className={`h-10 min-w-0 flex-1 rounded-[8px] px-2 text-center text-[16px] leading-6 tracking-[-0.32px] ${
              selected ? 'bg-white font-semibold text-[#ff3d3d]' : 'font-normal text-[#808080]'
            }`}
            onClick={() => onSortChange(option.key)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function TavernSimpleCard({ tavern, onSelect }: { tavern: Tavern; onSelect: () => void }) {
  return (
    <button
      type="button"
      className="flex w-full flex-col gap-1 rounded-[12px] border border-[#e5e5e5] bg-white px-5 py-4 text-left"
      onClick={onSelect}
    >
      <div className="flex w-full items-start justify-between">
        <span className="text-[13px] font-medium leading-[1.6] tracking-[-0.26px] text-[#808080]">
          {tavern.department}
        </span>
        {tavern.waitingOpen && (
          <span className="text-[14px] font-medium leading-[1.6] tracking-[-0.28px] text-[#808080]">
            웨이팅
          </span>
        )}
      </div>
      <div className="flex w-full items-start justify-between gap-4 text-[16px] tracking-[-0.32px]">
        <div className="flex min-w-0 items-center gap-1">
          <strong className="min-w-0 truncate font-bold leading-[1.4] text-black">
            {tavern.name}
          </strong>
          <FiChevronRight size={16} className="shrink-0 text-[#cccccc]" />
        </div>
        {tavern.waitingOpen ? (
          <span className="shrink-0 font-medium leading-[1.6] text-[#808080]">
            <span className="text-[#ff3d3d]">{tavern.waitTeams}</span>팀
          </span>
        ) : (
          <span className="shrink-0 text-[14px] font-medium leading-[1.6] text-[#cccccc]">
            현장 방문
          </span>
        )}
      </div>
    </button>
  );
}
