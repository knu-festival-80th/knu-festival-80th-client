import { useState } from 'react';
import { FiX } from 'react-icons/fi';

import FieldInput from '@/components/tavern/shared/FieldInput';
import type { WaitingReservation } from '@/components/tavern/types';
import type { Tavern } from '@/constants/taverns';

type WaitingRegistrationModalProps = {
  tavern: Tavern;
  onClose: () => void;
  onSubmit: (reservation: WaitingReservation) => void;
};

export default function WaitingRegistrationModal({
  tavern,
  onClose,
  onSubmit,
}: WaitingRegistrationModalProps) {
  const [name, setName] = useState('');
  const [partySize, setPartySize] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const canSubmit =
    name.trim().length > 0 && partySize.trim().length > 0 && phoneNumber.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/30">
      <div className="relative min-h-dvh w-full max-w-[375px]">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="waiting-registration-title"
          className="absolute left-5 right-5 top-[170px] overflow-hidden rounded-[12px] bg-white pb-6 pt-4"
        >
          <div className="flex items-center justify-between px-5">
            <h2
              id="waiting-registration-title"
              className="w-full text-center text-[18px] font-semibold leading-[1.5] tracking-[-0.18px]"
            >
              대기 등록하기
            </h2>
            <button
              type="button"
              className="absolute right-5 top-4 flex size-8 items-center justify-center"
              aria-label="대기 등록 모달 닫기"
              onClick={onClose}
            >
              <FiX size={24} />
            </button>
          </div>

          <form
            className="mt-8 flex flex-col gap-8 px-6"
            onSubmit={(event) => {
              event.preventDefault();

              if (canSubmit) {
                onSubmit({
                  tavern,
                  name,
                  partySize,
                  phoneNumber,
                });
              }
            }}
          >
            <div className="flex flex-col gap-[18px]">
              <div className="flex flex-col gap-1">
                <p className="text-[16px] font-semibold leading-[1.5] tracking-[-0.16px]">
                  예약 주막
                </p>
                <p className="text-[16px] font-semibold leading-[1.4] tracking-[-0.32px] text-[#ff3d3d]">
                  {tavern.name}
                </p>
              </div>
              <FieldInput
                id="waiting-name"
                label="예약자명"
                placeholder="이름을 입력해주세요"
                value={name}
                autoComplete="name"
                onChange={setName}
              />
              <FieldInput
                id="waiting-party-size"
                label="인원"
                placeholder="예약 인원을 입력해주세요 (숫자만)"
                value={partySize}
                inputMode="numeric"
                onChange={setPartySize}
              />
              <FieldInput
                id="waiting-phone"
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
                canSubmit ? 'bg-[#ff3d3d]' : 'bg-[#cccccc]'
              }`}
              disabled={!canSubmit}
            >
              대기 등록하기
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
