import { useMemo } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import CampusMap from '@/components/tavern/map/CampusMap';
import TavernMetric from '@/components/tavern/shared/TavernMetric';
import type { Tavern } from '@/constants/taverns';

type TavernDetailViewProps = {
  tavern: Tavern;
  onRegister: (tavern: Tavern) => void;
};

export default function TavernDetailView({ tavern, onRegister }: TavernDetailViewProps) {
  const navigate = useNavigate();
  const singleTavernList = useMemo(() => [tavern], [tavern]);

  return (
    <section className="flex flex-col gap-5 px-5 py-5">
      <button
        type="button"
        className="flex items-center gap-1 self-start text-[14px] font-medium text-[#808080]"
        onClick={() => navigate('/taverns')}
      >
        <FiArrowLeft size={16} />
        주막 목록
      </button>

      <article className="bg-white">
        <div className="flex flex-col gap-4 pb-2.5">
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
              {tavern.department}
            </p>
            <h1 className="text-[24px] font-bold leading-[1.4] tracking-[-0.48px]">
              {tavern.name}
            </h1>
            <p className="text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
              {tavern.description}
            </p>
          </div>
          {tavern.waitingOpen && (
            <TavernMetric label="웨이팅" value={tavern.waitTeams} suffix="팀 대기중" />
          )}
          {tavern.waitingOpen ? (
            <button
              type="button"
              className="h-[51px] w-full rounded-[8px] bg-[#ff3d3d] text-[16px] font-semibold tracking-[-0.32px] text-white"
              onClick={() => onRegister(tavern)}
            >
              대기 등록하기
            </button>
          ) : (
            <button
              type="button"
              className="h-[51px] w-full rounded-[8px] bg-[#e5e5e5] text-[16px] font-semibold tracking-[-0.32px] text-[#808080]"
              disabled
            >
              현장 방문해 주세요
            </button>
          )}
        </div>
      </article>

      {tavern.menuBoardImageUrl && (
        <>
          <div className="h-px bg-[#e5e5e5]" />
          <div className="flex flex-col gap-2">
            <h2 className="text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
              메뉴
            </h2>
            <div className="w-full overflow-hidden bg-[#f9f9f9]">
              <img
                src={tavern.menuBoardImageUrl}
                alt={`${tavern.name} 메뉴 이미지`}
                className="size-full object-contain"
              />
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
          위치
        </h2>
        <CampusMap
          taverns={singleTavernList}
          selectedTavern={tavern}
          onSelectTavern={() => undefined}
        />
      </div>
    </section>
  );
}
