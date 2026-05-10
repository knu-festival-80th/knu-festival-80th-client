import { useState } from 'react';
import { FiChevronRight, FiX } from 'react-icons/fi';

import FieldInput from '@/components/tavern/shared/FieldInput';
import type { ReservationLookupResult } from '@/components/tavern/types';

const createMockReservationResults = (
  name: string,
  phoneNumber: string,
): ReservationLookupResult[] => [
  {
    id: 'startup',
    tavernName: 'Start-up',
    aheadTeams: 2,
    name,
    partySize: '2',
    phoneNumber,
  },
  {
    id: 'comstaurant',
    tavernName: '컴스토랑',
    aheadTeams: 5,
    name,
    partySize: '4',
    phoneNumber,
  },
  {
    id: 'itaewon-class',
    tavernName: 'E태원 클라쓰',
    aheadTeams: 10,
    name,
    partySize: '2',
    phoneNumber,
  },
];

export default function ReservationLookup() {
  const [reservationName, setReservationName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [lookupResults, setLookupResults] = useState<ReservationLookupResult[] | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<ReservationLookupResult | null>(
    null,
  );
  const canSearch = reservationName.trim().length > 0 && phoneNumber.trim().length > 0;

  if (lookupResults) {
    return (
      <>
        <ReservationResultList
          reservations={lookupResults}
          onSelectReservation={setSelectedReservation}
        />

        {selectedReservation && (
          <ReservationDetailModal
            reservation={selectedReservation}
            onCancelReservation={() => {
              setLookupResults((currentResults) => {
                if (!currentResults) {
                  return currentResults;
                }

                return currentResults.filter((result) => result.id !== selectedReservation.id);
              });
              setSelectedReservation(null);
            }}
            onClose={() => setSelectedReservation(null)}
          />
        )}
      </>
    );
  }

  return (
    <section className="flex flex-col gap-5 px-5 py-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[24px] font-bold leading-[1.6] tracking-[-0.48px]">예약 조회</h1>
        <p className="text-[16px] font-normal leading-[1.4] tracking-[-0.32px] text-[#808080]">
          예약했던 정보를 입력해주세요.
        </p>
      </div>

      <form
        className="flex flex-col gap-8"
        onSubmit={(event) => {
          event.preventDefault();

          if (canSearch) {
            setLookupResults(createMockReservationResults(reservationName, phoneNumber));
          }
        }}
      >
        <div className="flex flex-col gap-[18px]">
          <FieldInput
            id="reservation-name"
            label="예약자명"
            placeholder="이름을 입력해주세요"
            value={reservationName}
            autoComplete="name"
            onChange={setReservationName}
          />
          <FieldInput
            id="reservation-phone"
            label="연락처"
            placeholder="번호를 입력해주세요 ('-' 없이 번호만)"
            value={phoneNumber}
            autoComplete="tel"
            inputMode="numeric"
            onChange={setPhoneNumber}
          />
        </div>
        <button
          type="submit"
          className={`h-[51px] w-full rounded-[8px] text-[16px] font-semibold tracking-[-0.32px] text-white ${
            canSearch ? 'bg-[#ff3d3d]' : 'bg-[#cccccc]'
          }`}
          disabled={!canSearch}
        >
          조회하기
        </button>
      </form>
    </section>
  );
}

function ReservationResultList({
  reservations,
  onSelectReservation,
}: {
  reservations: ReservationLookupResult[];
  onSelectReservation: (reservation: ReservationLookupResult) => void;
}) {
  return (
    <section className="flex flex-col gap-7 px-5 py-6">
      <div className="flex flex-col gap-2.5">
        <h1 className="text-[24px] font-bold leading-none tracking-[-0.48px]">예약 조회 결과</h1>
        <p className="text-[16px] font-normal leading-none tracking-[-0.32px] text-[#808080]">
          예약한 주막 정보입니다.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {reservations.map((reservation) => (
          <button
            key={reservation.id}
            type="button"
            className="flex w-full flex-col gap-2 rounded-[12px] border border-[#e5e5e5] bg-white p-5 text-left"
            onClick={() => onSelectReservation(reservation)}
          >
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center text-[14px] font-medium leading-none tracking-[-0.28px] text-[#808080]">
                자세히 보기
                <FiChevronRight size={24} />
              </span>
              <span className="text-[14px] font-medium leading-none tracking-[-0.28px] text-[#808080]">
                내 앞 대기팀
              </span>
            </div>
            <div className="flex w-full items-start justify-between text-[16px] tracking-[-0.32px]">
              <strong className="font-bold leading-none">{reservation.tavernName}</strong>
              <span className="font-medium leading-none text-[#808080]">
                <span className="text-[#ff3d3d]">{reservation.aheadTeams}</span>팀
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-[8px] bg-[#f9f9f9] p-4 text-[14px] font-medium leading-[1.5] tracking-[-0.28px] text-[#808080]">
        {reservations.length >= 3 && (
          <p className="text-[#f49800]">주막은 총 3곳까지만 예약 가능합니다.</p>
        )}
        <p>차례가 오면 전화를 걸어 알려드립니다.</p>
        <p>전화를 받지 않을 시 예약이 취소될 수 있습니다.</p>
      </div>
    </section>
  );
}

function ReservationDetailModal({
  reservation,
  onCancelReservation,
  onClose,
}: {
  reservation: ReservationLookupResult;
  onCancelReservation: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/30">
      <div className="relative min-h-dvh w-full max-w-[375px]">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="reservation-detail-title"
          className="absolute left-5 right-5 top-1/2 -translate-y-1/2 overflow-hidden rounded-[12px] bg-white pb-6 pt-4"
        >
          <div className="flex items-center justify-between px-5">
            <h2
              id="reservation-detail-title"
              className="w-full text-center text-[18px] font-semibold leading-[1.5] tracking-[-0.18px]"
            >
              예약 조회
            </h2>
            <button
              type="button"
              className="absolute right-5 top-4 flex size-8 items-center justify-center"
              aria-label="예약 조회 모달 닫기"
              onClick={onClose}
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="mt-5 px-6">
            <div className="pb-2.5">
              <div className="flex items-center gap-1">
                <h3 className="text-[24px] font-bold leading-[1.4] tracking-[-0.48px]">
                  {reservation.tavernName}
                </h3>
                <FiChevronRight size={28} className="text-[#808080]" />
              </div>
              <div className="mt-2.5 flex items-end gap-1">
                <strong className="text-[28px] font-bold leading-[1.4] tracking-[-0.56px] text-[#ff3d3d]">
                  {reservation.aheadTeams}
                </strong>
                <span className="pb-1 text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
                  번째로 대기 중
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
            <button
              type="button"
              className="h-[50px] w-full rounded-[8px] border-[1.4px] border-[#ff3d3d] bg-white text-[16px] font-medium tracking-[-0.32px] text-[#ff3d3d]"
              onClick={onCancelReservation}
            >
              예약 취소하기
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
