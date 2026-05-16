import TavernCard from '@/components/tavern/list/TavernCard';
import CampusMap from '@/components/tavern/map/CampusMap';
import type { Tavern } from '@/constants/taverns';

type MapOverviewProps = {
  expandedMenuId: string | null;
  selectedTavern: Tavern | null;
  taverns: Tavern[];
  onMenuToggle: (id: string | null) => void;
  onOpenDetail: (tavern: Tavern) => void;
  onRegister: (tavern: Tavern) => void;
  onSelectTavern: (tavern: Tavern) => void;
};

export default function MapOverview({
  expandedMenuId,
  selectedTavern,
  taverns,
  onMenuToggle,
  onOpenDetail,
  onRegister,
  onSelectTavern,
}: MapOverviewProps) {
  return (
    <section className="flex flex-col gap-5 px-5 py-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[24px] font-bold leading-[1.6] tracking-[-0.48px]">지도</h1>
        <p className="text-[16px] font-normal leading-[1.4] tracking-[-0.32px] text-[#808080]">
          가고 싶은 주막의 아이콘을 클릭해보세요.
        </p>
      </div>

      <div className="-mx-5 px-5">
        <CampusMap
          taverns={taverns}
          selectedTavern={selectedTavern}
          onSelectTavern={onSelectTavern}
        />
      </div>

      {selectedTavern && (
        <TavernCard
          expanded={expandedMenuId === selectedTavern.id}
          tavern={selectedTavern}
          showWaiting={selectedTavern.type !== 'BOOTH'}
          onMenuToggle={() =>
            onMenuToggle(expandedMenuId === selectedTavern.id ? null : selectedTavern.id)
          }
          onRegister={() => onRegister(selectedTavern)}
          onSelect={() => onOpenDetail(selectedTavern)}
        />
      )}
    </section>
  );
}
