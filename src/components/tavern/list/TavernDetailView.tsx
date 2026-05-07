import menuImage from '@/assets/images/menu.jpg';
import CampusMap from '@/components/tavern/map/CampusMap';
import TavernMetric from '@/components/tavern/shared/TavernMetric';
import type { Tavern } from '@/constants/taverns';

type TavernDetailViewProps = {
  tavern: Tavern;
  onRegister: (tavern: Tavern) => void;
};

export default function TavernDetailView({ tavern, onRegister }: TavernDetailViewProps) {
  return (
    <section className="flex flex-col gap-5 px-5 py-5">
      <article className="bg-white">
        <div className="flex flex-col gap-4 pb-2.5">
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
              {tavern.department} · {tavern.category}
            </p>
            <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.48px]">
              {tavern.name}
            </h1>
            <p className="text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
              {tavern.description}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TavernMetric label="웨이팅" value={tavern.waitTeams} suffix="팀 대기중" />
            <TavernMetric
              label="잔여좌석"
              value={tavern.availableSeats}
              suffix={`/ ${tavern.totalSeats} 석`}
            />
          </div>
          <button
            type="button"
            className="h-[51px] w-full rounded-[8px] bg-[#ff3d3d] text-[16px] font-semibold tracking-[-0.32px] text-white"
            onClick={() => onRegister(tavern)}
          >
            대기 등록하기
          </button>
        </div>
      </article>

      <div className="h-px bg-[#e5e5e5]" />

      <div className="flex flex-col gap-2">
        <h2 className="text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
          메뉴
        </h2>
        <div className="h-[353px] w-full overflow-hidden bg-[#f9f9f9]">
          <img
            src={menuImage}
            alt={`${tavern.name} 메뉴 이미지`}
            className="size-full object-contain"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
          위치
        </h2>
        <CampusMap selectedTavern={tavern} onSelectTavern={() => undefined} />
      </div>
    </section>
  );
}
