import { useEffect, useRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';

import menuImage from '@/assets/images/menu.jpg';
import TavernMetric from '@/components/tavern/shared/TavernMetric';
import type { Tavern } from '@/constants/taverns';

type TavernCardProps = {
  expanded: boolean;
  tavern: Tavern;
  onMenuToggle: () => void;
  onRegister: () => void;
  onSelect?: () => void;
};

export default function TavernCard({
  expanded,
  tavern,
  onMenuToggle,
  onRegister,
  onSelect,
}: TavernCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const previousExpandedRef = useRef(expanded);

  useEffect(() => {
    const wasExpanded = previousExpandedRef.current;
    previousExpandedRef.current = expanded;

    if (!expanded || wasExpanded) {
      return;
    }

    requestAnimationFrame(() => {
      (menuRef.current ?? cardRef.current)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, [expanded]);

  const cardSummary = (
    <>
      <div>
        <p className="text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
          {tavern.department}
        </p>
        <h3 className="text-[24px] font-bold leading-[1.4] tracking-[-0.48px]">{tavern.name}</h3>
      </div>
      {tavern.waitingOpen && (
        <TavernMetric label="웨이팅" value={tavern.waitTeams} suffix="팀 대기중" />
      )}
    </>
  );

  return (
    <article
      ref={cardRef}
      className="scroll-mt-28 overflow-hidden rounded-[12px] border border-[#e5e5e5] bg-white"
    >
      <div className="flex flex-col items-center gap-2.5 px-6 pb-2.5 pt-5">
        <div className="flex w-full flex-col gap-4">
          {onSelect ? (
            <button type="button" className="flex flex-col gap-4 text-left" onClick={onSelect}>
              {cardSummary}
            </button>
          ) : (
            <div className="flex flex-col gap-4">{cardSummary}</div>
          )}
          {tavern.waitingOpen ? (
            <button
              type="button"
              className="h-[51px] w-full rounded-[8px] bg-[#ff3d3d] text-[16px] font-semibold tracking-[-0.32px] text-white"
              onClick={onRegister}
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
        <button
          type="button"
          className="flex items-center gap-1 text-[14px] font-medium leading-[1.6] tracking-[-0.28px] text-[#808080]"
          aria-expanded={expanded}
          onClick={onMenuToggle}
        >
          메뉴
          <FiChevronDown className={expanded ? 'rotate-180' : ''} size={18} />
        </button>
        {expanded && (
          <div
            ref={menuRef}
            className="h-[260px] w-full scroll-mt-28 border-t border-[#e5e5e5] pt-3"
          >
            <img
              src={menuImage}
              alt={`${tavern.name} 메뉴판`}
              className="size-full rounded-[8px] bg-[#f9f9f9] object-contain"
            />
          </div>
        )}
      </div>
    </article>
  );
}
