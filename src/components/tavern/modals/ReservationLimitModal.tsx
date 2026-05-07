import { FiArrowLeft, FiX } from 'react-icons/fi';

type ReservationLimitModalProps = {
  onClose: () => void;
  onGoToReservationList: () => void;
};

export default function ReservationLimitModal({
  onClose,
  onGoToReservationList,
}: ReservationLimitModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/30">
      <div className="relative min-h-dvh w-full max-w-[375px]">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="reservation-limit-title"
          className="absolute left-5 right-5 top-1/2 -translate-y-1/2 overflow-hidden rounded-[12px] bg-white pb-6 pt-4"
        >
          <div className="flex items-center justify-between px-4">
            <button
              type="button"
              className="flex size-6 items-center justify-center"
              aria-label="이전으로"
              onClick={onClose}
            >
              <FiArrowLeft size={22} />
            </button>
            <h2
              id="reservation-limit-title"
              className="w-full text-center text-[18px] font-semibold leading-none tracking-[-0.36px]"
            >
              예약 실패
            </h2>
            <button
              type="button"
              className="flex size-6 items-center justify-center"
              aria-label="예약 실패 모달 닫기"
              onClick={onClose}
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="mt-5 px-6">
            <div className="flex flex-col items-center gap-4 py-2.5 text-center">
              <h3 className="text-[24px] font-bold leading-none tracking-[-0.48px]">
                예약 가능 개수 초과!
              </h3>
              <div className="text-[14px] font-medium leading-[1.5] tracking-[-0.28px] text-[#f49800]">
                <p>주막 예약은 총 3곳까지만 가능해요.</p>
                <p>현재 예약 내역을 취소한다면 예약 가능해요.</p>
              </div>
            </div>

            <button
              type="button"
              className="mt-[18px] h-[50px] w-full rounded-[8px] border-[1.4px] border-[#ff3d3d] bg-white text-[16px] font-medium tracking-[-0.32px] text-[#ff3d3d]"
              onClick={onGoToReservationList}
            >
              예약 목록으로
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
