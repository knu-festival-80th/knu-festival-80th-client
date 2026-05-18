import { useState } from 'react';
import { FiChevronRight, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { lookupMyWaitings, cancelMyWaiting } from '@/apis/modules/waiting';
import { toApiClientError } from '@/apis/error';
import FieldInput from '@/components/tavern/shared/FieldInput';
import type { ReservationLookupResult } from '@/components/tavern/types';
import { fadeUpVariant } from '@/constants/animation';

export default function ReservationLookup() {
  const [reservationName, setReservationName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [lookupResults, setLookupResults] = useState<ReservationLookupResult[] | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<ReservationLookupResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSearch = reservationName.trim().length > 0 && phoneNumber.trim().length > 0;

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSearch) return;

    setLoading(true);
    setError(null);

    try {
      const results = await lookupMyWaitings(reservationName.trim(), phoneNumber.trim());
      setLookupResults(
        results.map((item) => ({
          id: item.waitingId,
          tavernName: item.boothName,
          aheadTeams: item.aheadCount,
          waitingNumber: item.waitingNumber,
          status: item.status,
          name: reservationName.trim(),
          partySize: '',
          phoneNumber: phoneNumber.trim(),
        })),
      );
    } catch (err) {
      const apiError = toApiClientError(err);
      if (apiError.code === 'W005') {
        setLookupResults([]);
      } else if (apiError.code === 'W003') {
        setError('예약자명과 연락처가 일치하지 않습니다.');
      } else {
        setError(apiError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (lookupResults) {
    return (
      <>
        <ReservationResultList
          reservations={lookupResults}
          onSelectReservation={setSelectedReservation}
          onBack={() => setLookupResults(null)}
        />

        {selectedReservation && (
          <ReservationDetailModal
            reservation={selectedReservation}
            phoneNumber={phoneNumber.trim()}
            onCancelReservation={() => {
              setLookupResults((currentResults) => {
                if (!currentResults) return currentResults;
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
      <motion.div className="flex flex-col gap-0.5" {...fadeUpVariant}>
        <h1 className="text-[24px] font-bold leading-[1.6] tracking-[-0.48px]">예약 조회</h1>
        <p className="text-[16px] font-normal leading-[1.4] tracking-[-0.32px] text-[#808080]">
          예약했던 정보를 입력해주세요.
        </p>
      </motion.div>

      <form className="flex flex-col gap-8" onSubmit={handleSearch}>
        <motion.div
          className="flex flex-col gap-[18px]"
          {...fadeUpVariant}
          transition={{ ...fadeUpVariant.transition, delay: 0.1 }}
        >
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
        </motion.div>

        {error && (
          <p className="rounded-[8px] bg-red-50 px-4 py-3 text-[14px] font-medium text-[#ff3d3d]">
            {error}
          </p>
        )}

        <motion.button
          type="submit"
          className={`h-[51px] w-full rounded-[8px] text-[16px] font-semibold tracking-[-0.32px] text-white ${
            canSearch && !loading ? 'bg-[#ff3d3d]' : 'bg-[#cccccc]'
          }`}
          disabled={!canSearch || loading}
          {...fadeUpVariant}
          transition={{ ...fadeUpVariant.transition, delay: 0.15 }}
        >
          {loading ? '조회 중...' : '조회하기'}
        </motion.button>
      </form>
    </section>
  );
}

function ReservationResultList({
  reservations,
  onSelectReservation,
  onBack,
}: {
  reservations: ReservationLookupResult[];
  onSelectReservation: (reservation: ReservationLookupResult) => void;
  onBack: () => void;
}) {
  if (reservations.length === 0) {
    return (
      <section className="flex flex-col gap-7 px-5 py-6">
        <div className="flex flex-col gap-2.5">
          <h1 className="text-[24px] font-bold leading-none tracking-[-0.48px]">예약 조회 결과</h1>
          <p className="text-[16px] font-normal leading-none tracking-[-0.32px] text-[#808080]">
            현재 대기 중인 예약이 없습니다.
          </p>
        </div>
        <button
          type="button"
          className="h-[51px] w-full rounded-[8px] border border-[#e5e5e5] text-[16px] font-semibold tracking-[-0.32px]"
          onClick={onBack}
        >
          다시 조회하기
        </button>
      </section>
    );
  }

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
        <p>차례가 오면 문자로 알려드립니다.</p>
        <p>10분 내 미방문 시 예약이 자동 취소됩니다.</p>
      </div>
    </section>
  );
}

function ReservationDetailModal({
  reservation,
  phoneNumber,
  onCancelReservation,
  onClose,
}: {
  reservation: ReservationLookupResult;
  phoneNumber: string;
  onCancelReservation: () => void;
  onClose: () => void;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      const digits = phoneNumber.replace(/\D/g, '');
      const last4 = digits.slice(-4);
      await cancelMyWaiting(reservation.id, last4);
      onCancelReservation();
    } catch (err) {
      const apiError = toApiClientError(err);
      setError(apiError.message);
    } finally {
      setCancelling(false);
    }
  };

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
              <p className="mt-1 text-[14px] font-medium tracking-[-0.28px] text-[#808080]">
                대기번호{' '}
                <span className="font-bold text-[#ff3d3d]">{reservation.waitingNumber}</span>번
              </p>
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
                <dt className="text-[#808080]">연락처</dt>
                <dd className="text-right">{reservation.phoneNumber}</dd>
              </div>
            </dl>
            <div className="my-4 h-px bg-[#e5e5e5]" />

            {error && (
              <p className="mb-3 rounded-[8px] bg-red-50 px-4 py-3 text-[14px] font-medium text-[#ff3d3d]">
                {error}
              </p>
            )}

            <button
              type="button"
              className="h-[50px] w-full rounded-[8px] border-[1.4px] border-[#ff3d3d] bg-white text-[16px] font-medium tracking-[-0.32px] text-[#ff3d3d]"
              disabled={cancelling}
              onClick={handleCancel}
            >
              {cancelling ? '취소 중...' : '예약 취소하기'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
