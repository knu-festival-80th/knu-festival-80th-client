import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { boothApi } from '@/apis';
import TavernDetailView from '@/components/tavern/list/TavernDetailView';
import WaitingCompleteModal from '@/components/tavern/modals/WaitingCompleteModal';
import WaitingRegistrationModal from '@/components/tavern/modals/WaitingRegistrationModal';
import type { WaitingReservation } from '@/components/tavern/types';
import { boothToTavern } from '@/constants/taverns';

export default function TavernDetailPage() {
  const { boothId: boothIdParam } = useParams<{ boothId: string }>();
  const boothId = Number(boothIdParam);
  const navigate = useNavigate();

  const boothsQuery = useQuery({
    queryKey: ['booths'],
    queryFn: () => boothApi.listBooths('likes'),
    staleTime: 30_000,
  });

  const [registrationTarget, setRegistrationTarget] = useState(false);
  const [waitingReservation, setWaitingReservation] = useState<WaitingReservation | null>(null);

  if (boothsQuery.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white text-[16px] text-[#808080]">
        주막 정보를 불러오는 중...
      </div>
    );
  }

  const booth = boothsQuery.data?.find((b) => b.boothId === boothId);
  if (!booth) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-5">
        <p className="text-[16px] text-[#808080]">주막을 찾을 수 없습니다.</p>
        <button
          type="button"
          className="rounded-[8px] bg-[#f2f2f2] px-5 py-2.5 text-[14px] font-medium text-[#4d4d4d]"
          onClick={() => navigate('/taverns')}
        >
          주막 목록으로
        </button>
      </div>
    );
  }

  const tavern = boothToTavern(booth);

  return (
    <div className="min-h-dvh bg-white">
      <TavernDetailView tavern={tavern} onRegister={() => setRegistrationTarget(true)} />

      {registrationTarget && (
        <WaitingRegistrationModal
          tavern={tavern}
          onClose={() => setRegistrationTarget(false)}
          onSubmit={(reservation) => {
            setRegistrationTarget(false);
            setWaitingReservation(reservation);
          }}
        />
      )}

      {waitingReservation && (
        <WaitingCompleteModal
          reservation={waitingReservation}
          onClose={() => setWaitingReservation(null)}
        />
      )}
    </div>
  );
}
