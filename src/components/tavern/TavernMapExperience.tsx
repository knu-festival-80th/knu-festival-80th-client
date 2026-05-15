import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { boothApi } from '@/apis';
import IntroOverview from '@/components/tavern/intro/IntroOverview';
import TavernListView from '@/components/tavern/list/TavernListView';
import MapOverview from '@/components/tavern/map/MapOverview';
import ReservationLimitModal from '@/components/tavern/modals/ReservationLimitModal';
import WaitingCompleteModal from '@/components/tavern/modals/WaitingCompleteModal';
import WaitingRegistrationModal from '@/components/tavern/modals/WaitingRegistrationModal';
import ReservationLookup from '@/components/tavern/reservation/ReservationLookup';
import TavernTabBar from '@/components/tavern/TavernTabBar';
import type { TopTab, WaitingReservation } from '@/components/tavern/types';
import {
  boothToTavern,
  mapBoothToTavern,
  type Tavern,
  type TavernSortKey,
} from '@/constants/taverns';

const TAVERN_TABS = ['intro', 'map', 'list', 'reservation'] as const satisfies readonly TopTab[];

const resolveTavernTabFromUrl = (pathname: string, search: string): TopTab => {
  const tabParam = new URLSearchParams(search).get('tab');
  if (TAVERN_TABS.includes(tabParam as TopTab)) return tabParam as TopTab;
  if (pathname === '/taverns') return 'list';
  if (pathname === '/map') return 'map';
  return 'intro';
};

export default function TavernMapExperience() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(
    () => resolveTavernTabFromUrl(location.pathname, location.search),
    [location.pathname, location.search],
  );

  const boothsQuery = useQuery({
    queryKey: ['booths'],
    queryFn: () => boothApi.listBooths('likes'),
    staleTime: 30_000,
    enabled: activeTab === 'list',
  });

  const mapBoothsQuery = useQuery({
    queryKey: ['booths', 'map'],
    queryFn: boothApi.listMapBooths,
    staleTime: 30_000,
    enabled: activeTab === 'map',
  });

  const taverns = useMemo(() => (boothsQuery.data ?? []).map(boothToTavern), [boothsQuery.data]);
  const mapTaverns = useMemo(
    () => (mapBoothsQuery.data ?? []).map(mapBoothToTavern),
    [mapBoothsQuery.data],
  );

  const [sortKey, setSortKey] = useState<TavernSortKey>('shortWait');
  const [selectedTavern, setSelectedTavern] = useState<Tavern | null>(null);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const [registrationTarget, setRegistrationTarget] = useState<Tavern | null>(null);
  const [waitingReservation, setWaitingReservation] = useState<WaitingReservation | null>(null);
  const [showReservationLimitModal, setShowReservationLimitModal] = useState(false);

  const sortedTaverns = useMemo(() => {
    const list = [...taverns];
    if (sortKey === 'shortWait') {
      return list.sort((a, b) => a.waitTeams - b.waitTeams);
    }
    if (sortKey === 'simple') {
      return list;
    }
    return list.sort((a, b) => b.popularity - a.popularity);
  }, [taverns, sortKey]);

  const selectedBoothQuery = useQuery({
    queryKey: ['booth', selectedTavern?.boothId],
    queryFn: () => {
      if (!selectedTavern) throw new Error('선택된 주막이 없습니다.');
      return boothApi.getBooth(selectedTavern.boothId);
    },
    enabled: activeTab === 'map' && Boolean(selectedTavern),
    staleTime: 30_000,
  });

  const selectedMapTavern = useMemo(
    () => (selectedBoothQuery.data ? boothToTavern(selectedBoothQuery.data) : selectedTavern),
    [selectedBoothQuery.data, selectedTavern],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [activeTab, location.key]);

  const handleRegister = (tavern: Tavern) => {
    setSelectedTavern(tavern);
    setRegistrationTarget(tavern);
  };

  const handleOpenTavernDetail = (tavern: Tavern) => {
    navigate(`/taverns/${tavern.boothId}`);
  };

  const handleTabChange = (tab: TopTab) => {
    navigate(tab === 'list' || tab === 'reservation' ? `/taverns?tab=${tab}` : `/map?tab=${tab}`, {
      replace: true,
    });
  };

  const isActiveTabLoading =
    (activeTab === 'list' && boothsQuery.isLoading) ||
    (activeTab === 'map' && mapBoothsQuery.isLoading);

  if (isActiveTabLoading) {
    return (
      <div className="min-h-dvh bg-white font-wanted-sans text-black">
        <TavernTabBar activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex items-center justify-center py-20 text-[16px] text-[#808080]">
          주막 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white font-wanted-sans text-black">
      <TavernTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === 'intro' ? (
        <IntroOverview onTabChange={handleTabChange} />
      ) : activeTab === 'list' ? (
        <TavernListView
          expandedMenuId={expandedMenuId}
          sortKey={sortKey}
          taverns={sortedTaverns}
          onMenuToggle={setExpandedMenuId}
          onRegister={handleRegister}
          onSelectTavern={handleOpenTavernDetail}
          onSortChange={setSortKey}
        />
      ) : activeTab === 'reservation' ? (
        <ReservationLookup />
      ) : (
        <MapOverview
          expandedMenuId={expandedMenuId}
          selectedTavern={selectedMapTavern}
          taverns={mapTaverns}
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
