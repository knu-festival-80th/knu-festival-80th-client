import { FiChevronRight, FiX } from 'react-icons/fi';

import type { WaitingReservation } from '@/components/tavern/types';

type WaitingCompleteModalProps = {
  reservation: WaitingReservation;
  onClose: () => void;
};

export default function WaitingCompleteModal({ reservation, onClose }: WaitingCompleteModalProps) {
  const { tavern } = reservation;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/30">
      <div className="relative min-h-dvh w-full max-w-[375px]">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="waiting-complete-title"
          className="absolute left-5 right-5 top-1/2 -translate-y-1/2 overflow-hidden rounded-[12px] bg-white pb-6 pt-4"
        >
          <div className="flex items-center justify-between px-5">
            <h2
              id="waiting-complete-title"
              className="w-full text-center text-[18px] font-semibold leading-[1.5] tracking-[-0.18px]"
            >
              웨이팅 등록 완료!
            </h2>
            <button
              type="button"
              className="absolute right-5 top-4 flex size-8 items-center justify-center"
              aria-label="웨이팅 등록 완료 모달 닫기"
              onClick={onClose}
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="mt-5 px-6">
            <div className="pb-2.5">
              <div className="flex items-center gap-1">
                <h3 className="text-[24px] font-bold leading-[1.4] tracking-[-0.48px]">
                  {tavern.name}
                </h3>
                <FiChevronRight size={28} className="text-[#808080]" />
              </div>
              <p className="mt-2.5 text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
                현재 내 앞에
              </p>
              <div className="flex items-end gap-1">
                <strong className="text-[28px] font-bold leading-[1.4] tracking-[-0.56px] text-[#ff3d3d]">
                  {Math.max(tavern.waitTeams, 1)}
                </strong>
                <span className="pb-1 text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
                  팀 대기중
                </span>
              </div>
            </div>
            <div className="my-4 h-px bg-[#e5e5e5]" />
            <dl className="grid gap-2.5 text-[16px] font-medium leading-[1.6] tracking-[-0.32px]">
              <div className="flex justify-between gap-4">
                <dt className="text-[#808080]">예약자명</dt>
                <dd className="text-right">{reservation.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#808080]">인원</dt>
                <dd className="text-right">{reservation.partySize}명</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#808080]">연락처</dt>
                <dd className="text-right">{reservation.phoneNumber}</dd>
              </div>
            </dl>
            <div className="my-4 h-px bg-[#e5e5e5]" />
            <p className="rounded-[8px] bg-[#f9f9f9] p-4 text-[14px] font-medium leading-[1.5] tracking-[-0.28px] text-[#808080]">
              차례가 오면 전화를 걸어 알려드립니다.
              <br />
              전화를 받지 않을 시 예약이 취소될 수 있습니다.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
