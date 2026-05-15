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
  return (
    <section className="flex flex-col gap-3 px-5 py-6">
      <h1 className="text-[24px] font-bold leading-[1.6] tracking-[-0.48px]">주막 목록</h1>
      <TavernSortTabs sortKey={sortKey} onSortChange={onSortChange} />
      <div className="flex flex-col gap-3">
        {taverns.map((tavern) => (
          <div key={tavern.id}>
            <TavernCard
              expanded={expandedMenuId === tavern.id}
              tavern={tavern}
              onMenuToggle={() => onMenuToggle(expandedMenuId === tavern.id ? null : tavern.id)}
              onRegister={() => onRegister(tavern)}
              onSelect={() => onSelectTavern(tavern)}
            />
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
