import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { boothApi, imagePathToSrc } from '@/apis';
import CampusMap from '@/components/tavern/map/CampusMap';
import { mapBoothToTavern, type Tavern } from '@/constants/taverns';

type TavernDetailViewProps = {
  tavern: Tavern;
  onRegister: (tavern: Tavern) => void;
};

const resolveMenuBoardSrc = (src: string | null) => {
  if (src?.startsWith('/src/') || src?.startsWith('/assets/')) return src;
  return imagePathToSrc(src);
};

export default function TavernDetailView({ tavern, onRegister }: TavernDetailViewProps) {
  const allBoothsQuery = useQuery({
    queryKey: ['booths', 'map'],
    queryFn: boothApi.listMapBooths,
    staleTime: 60_000,
  });
  const allTaverns = useMemo(
    () =>
      allBoothsQuery.data
        ? allBoothsQuery.data
            .filter((b) => b.xRatio != null && b.yRatio != null)
            .map(mapBoothToTavern)
        : [tavern],
    [allBoothsQuery.data, tavern],
  );
  const menuBoardSrc = resolveMenuBoardSrc(tavern.menuBoardImageUrl);
  const metaItems = [tavern.department].filter(Boolean);
  const isBooth = tavern.type === 'BOOTH';
  const description = tavern.department
    ? `${tavern.department}의 ${isBooth ? '부스' : '주막'}입니다. 어서오세요~`
    : '어서오세요~';

  return (
    <section className="flex flex-col gap-5 px-5 py-5">
      <article className="overflow-hidden bg-white">
        <div className="flex flex-col gap-4.5 pb-2.5">
          <div className="flex flex-col gap-2.5">
            <p className="flex gap-1 text-[16px] font-medium leading-none tracking-[-0.32px] text-[#808080]">
              {metaItems.map((item, index) => (
                <span key={item} className="flex gap-1">
                  {index > 0 && <span>·</span>}
                  <span>{item}</span>
                </span>
              ))}
            </p>
            <h1 className="text-[24px] font-bold leading-none tracking-[-0.48px]">{tavern.name}</h1>
            <p className="text-[16px] font-medium leading-none tracking-[-0.32px] text-[#808080]">
              {description}
            </p>
          </div>
          {!isBooth && tavern.waitingOpen && (
            <div className="flex items-end gap-1">
              <strong className="text-[28px] font-bold leading-[1.4] tracking-[-0.56px] text-[#ff3d3d]">
                {tavern.waitTeams}
              </strong>
              <span className="pb-1 text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-black/50">
                팀 대기 중
              </span>
            </div>
          )}
          {!isBooth &&
            (tavern.waitingOpen ? (
              <button
                type="button"
                className="h-[50px] w-full rounded-[8px] bg-[#ff3d3d] text-[16px] font-medium tracking-[-0.32px] text-white"
                onClick={() => onRegister(tavern)}
              >
                대기 등록하기
              </button>
            ) : (
              <p className="text-[13px] tracking-[-0.26px] text-[#808080]">
                현재 대기 등록을 받지 않고 있어요
              </p>
            ))}
        </div>
      </article>

      {menuBoardSrc && (
        <>
          <div className="h-px bg-[#e5e5e5]" />
          <div className="flex flex-col gap-2">
            <h2 className="text-[16px] font-medium leading-none tracking-[-0.32px] text-[#808080]">
              메뉴
            </h2>
            <div className="w-full overflow-hidden bg-[#f9f9f9]">
              <img
                src={menuBoardSrc}
                alt={`${tavern.name} 메뉴 이미지`}
                className="h-auto w-full object-contain"
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
          interactive={false}
          taverns={allTaverns}
          selectedTavern={tavern}
          focusSelected
          onSelectTavern={() => undefined}
        />
      </div>
    </section>
  );
}
