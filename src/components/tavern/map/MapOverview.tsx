import TavernCard from '@/components/tavern/list/TavernCard';
import CampusMap from '@/components/tavern/map/CampusMap';
import {
  PERFORMANCE_LOCATION_DESCRIPTION,
  isPerformanceLocation,
  type Tavern,
} from '@/constants/taverns';

type MapOverviewProps = {
  expandedMenuId: string | null;
  focusSelected?: boolean;
  selectedTavern: Tavern | null;
  taverns: Tavern[];
  onMenuToggle: (id: string | null) => void;
  onOpenDetail: (tavern: Tavern) => void;
  onRegister: (tavern: Tavern) => void;
  onSelectTavern: (tavern: Tavern) => void;
};

export default function MapOverview({
  expandedMenuId,
  focusSelected = false,
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
          focusSelected={focusSelected}
          selectedTavern={selectedTavern}
          onSelectTavern={onSelectTavern}
        />
      </div>

      {selectedTavern && isPerformanceLocation(selectedTavern) ? (
        <div className="rounded-xl border border-[#e5e5e5] bg-white px-5 py-4 shadow-sm">
          <p className="text-[13px] font-semibold leading-none tracking-[-0.26px] text-[#1f7ae0]">
            공연 위치
          </p>
          <h2 className="mt-2 text-[20px] font-bold leading-[1.35] tracking-[-0.4px] text-[#1a1a1a]">
            {selectedTavern.name}
          </h2>
          <p className="mt-2 text-[14px] font-medium leading-[1.45] tracking-[-0.28px] text-[#707070]">
            {selectedTavern.location || PERFORMANCE_LOCATION_DESCRIPTION}
          </p>
        </div>
      ) : selectedTavern ? (
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
      ) : null}
    </section>
  );
}
