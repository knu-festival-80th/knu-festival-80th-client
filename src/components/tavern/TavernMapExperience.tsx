import { useEffect, useMemo, useState } from 'react';

import IntroOverview from '@/components/tavern/intro/IntroOverview';
import TavernDetailView from '@/components/tavern/list/TavernDetailView';
import TavernListView from '@/components/tavern/list/TavernListView';
import MapOverview from '@/components/tavern/map/MapOverview';
import ReservationLimitModal from '@/components/tavern/modals/ReservationLimitModal';
import WaitingCompleteModal from '@/components/tavern/modals/WaitingCompleteModal';
import WaitingRegistrationModal from '@/components/tavern/modals/WaitingRegistrationModal';
import ReservationLookup from '@/components/tavern/reservation/ReservationLookup';
import TavernTabBar from '@/components/tavern/TavernTabBar';
import type { TopTab, WaitingReservation } from '@/components/tavern/types';
import { taverns, type Tavern, type TavernSortKey } from '@/constants/taverns';

const MAX_WAITING_RESERVATION_COUNT = 3;
const INITIAL_MOCK_WAITING_RESERVATION_COUNT = 2;

const sortTaverns = (sortKey: TavernSortKey) => {
  const list = [...taverns];

  if (sortKey === 'shortWait') {
    return list.sort((first, second) => first.waitTeams - second.waitTeams);
  }

  if (sortKey === 'simple') {
    return list;
  }

  return list.sort((first, second) => second.popularity - first.popularity);
};

export default function TavernMapExperience() {
  const [activeTab, setActiveTab] = useState<TopTab>('intro');
  const [sortKey, setSortKey] = useState<TavernSortKey>('shortWait');
  const [selectedTavern, setSelectedTavern] = useState<Tavern | null>(null);
  const [detailTavern, setDetailTavern] = useState<Tavern | null>(null);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const [registrationTarget, setRegistrationTarget] = useState<Tavern | null>(null);
  const [waitingReservation, setWaitingReservation] = useState<WaitingReservation | null>(null);
  const [waitingReservationCount, setWaitingReservationCount] = useState(
    INITIAL_MOCK_WAITING_RESERVATION_COUNT,
  );
  const [showReservationLimitModal, setShowReservationLimitModal] = useState(false);

  const sortedTaverns = useMemo(() => sortTaverns(sortKey), [sortKey]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [activeTab, detailTavern?.id]);

  const handleRegister = (tavern: Tavern) => {
    setSelectedTavern(tavern);

    if (waitingReservationCount >= MAX_WAITING_RESERVATION_COUNT) {
      setShowReservationLimitModal(true);
      return;
    }

    setRegistrationTarget(tavern);
  };

  const handleOpenTavernDetail = (tavern: Tavern) => {
    setSelectedTavern(tavern);
    setDetailTavern(tavern);
    setActiveTab('list');
  };

  const handleTabChange = (tab: TopTab) => {
    setActiveTab(tab);
    setDetailTavern(null);
  };

  return (
    <div className="min-h-dvh bg-white font-wanted-sans text-black">
      <TavernTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === 'intro' ? (
        <IntroOverview onTabChange={handleTabChange} />
      ) : activeTab === 'list' ? (
        detailTavern ? (
          <TavernDetailView tavern={detailTavern} onRegister={handleRegister} />
        ) : (
          <TavernListView
            expandedMenuId={expandedMenuId}
            sortKey={sortKey}
            taverns={sortedTaverns}
            onMenuToggle={setExpandedMenuId}
            onRegister={handleRegister}
            onSelectTavern={handleOpenTavernDetail}
            onSortChange={setSortKey}
          />
        )
      ) : activeTab === 'reservation' ? (
        <ReservationLookup />
      ) : (
        <MapOverview
          expandedMenuId={expandedMenuId}
          selectedTavern={selectedTavern}
          onMenuToggle={setExpandedMenuId}
          onOpenDetail={handleOpenTavernDetail}
          onRegister={handleRegister}
          onSelectTavern={setSelectedTavern}
        />
      )}

      {registrationTarget && (
        <WaitingRegistrationModal
          tavern={registrationTarget}
          onClose={() => setRegistrationTarget(null)}
          onSubmit={(reservation) => {
            setRegistrationTarget(null);
            setWaitingReservationCount((count) =>
              Math.min(count + 1, MAX_WAITING_RESERVATION_COUNT),
            );
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

      {showReservationLimitModal && (
        <ReservationLimitModal
          onClose={() => setShowReservationLimitModal(false)}
          onGoToReservationList={() => {
            setShowReservationLimitModal(false);
            handleTabChange('reservation');
          }}
        />
      )}
    </div>
  );
}
