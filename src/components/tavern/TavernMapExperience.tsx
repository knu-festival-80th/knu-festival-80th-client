import { useMemo, useState } from 'react';
import { FiChevronDown, FiChevronRight, FiMapPin, FiMenu, FiX } from 'react-icons/fi';

import tavernMapTempImage from '@/assets/images/tavern-map-temp.svg';
import { taverns, tavernSortOptions, type Tavern, type TavernSortKey } from '@/constants/taverns';

type TopTab = 'map' | 'list' | 'reservation';

const topTabs: Array<{ key: TopTab; label: string }> = [
  { key: 'map', label: '지도' },
  { key: 'list', label: '주막 목록' },
  { key: 'reservation', label: '예약 조회' },
];

const sortTaverns = (sortKey: TavernSortKey) => {
  const list = [...taverns];

  if (sortKey === 'shortWait') {
    return list.sort((first, second) => first.waitTeams - second.waitTeams);
  }

  if (sortKey === 'simple') {
    return list.filter((tavern) => tavern.waitTeams <= 1 || tavern.availableSeats > 0);
  }

  return list.sort((first, second) => second.popularity - first.popularity);
};

export default function TavernMapExperience() {
  const [activeTab, setActiveTab] = useState<TopTab>('map');
  const [sortKey, setSortKey] = useState<TavernSortKey>('shortWait');
  const [selectedTavern, setSelectedTavern] = useState<Tavern | null>(null);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const [registeredTavern, setRegisteredTavern] = useState<Tavern | null>(null);

  const sortedTaverns = useMemo(() => sortTaverns(sortKey), [sortKey]);

  const handleRegister = (tavern: Tavern) => {
    setSelectedTavern(tavern);
    setRegisteredTavern(tavern);
  };

  return (
    <div className="min-h-dvh bg-white text-black">
      <TavernHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'list' ? (
        <TavernListView
          expandedMenuId={expandedMenuId}
          sortKey={sortKey}
          taverns={sortedTaverns}
          onMenuToggle={setExpandedMenuId}
          onRegister={handleRegister}
          onSortChange={setSortKey}
        />
      ) : activeTab === 'reservation' ? (
        <ReservationLookup
          selectedTavern={selectedTavern ?? taverns[0]}
          onRegister={() => handleRegister(selectedTavern ?? taverns[0])}
        />
      ) : (
        <MapOverview
          expandedMenuId={expandedMenuId}
          selectedTavern={selectedTavern}
          onMenuToggle={setExpandedMenuId}
          onRegister={handleRegister}
          onSelectTavern={setSelectedTavern}
        />
      )}

      {registeredTavern && (
        <WaitingCompleteModal tavern={registeredTavern} onClose={() => setRegisteredTavern(null)} />
      )}
    </div>
  );
}

function TavernHeader({
  activeTab,
  onTabChange,
}: {
  activeTab: TopTab;
  onTabChange: (tab: TopTab) => void;
}) {
  return (
    <header className="sticky top-0 z-30 bg-white">
      <div className="flex h-16 items-center justify-between px-5">
        <a href="/" className="flex items-end gap-1" aria-label="대동제 홈">
          <span className="font-serif text-[14px] font-black italic leading-none tracking-[-0.7px] text-[#1a1a1a]">
            The Grand Moment
          </span>
          <span className="text-[14px] font-black leading-none tracking-[-0.6px] text-[#ff3d3d]">
            KNU80
          </span>
        </a>
        <button
          type="button"
          className="flex size-10 items-center justify-end"
          aria-label="메뉴 열기"
        >
          <FiMenu size={22} />
        </button>
      </div>
      <nav className="flex gap-7 border-b border-[#e5e5e5] px-5" aria-label="주막 지도 메뉴">
        <a
          href="/"
          className="flex h-8 shrink-0 items-start text-[16px] font-normal leading-6 tracking-[-0.32px] text-[#808080]"
        >
          홈
        </a>
        {topTabs.map((tab) => {
          const selected = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              className={`flex h-8 shrink-0 flex-col items-center justify-start text-[16px] leading-6 tracking-[-0.32px] ${
                selected ? 'font-semibold text-black' : 'font-normal text-[#808080]'
              }`}
              onClick={() => onTabChange(tab.key)}
            >
              <span>{tab.label}</span>
              {selected && <span className="mt-[7px] h-px w-full bg-black" />}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

function MapOverview({
  expandedMenuId,
  selectedTavern,
  onMenuToggle,
  onRegister,
  onSelectTavern,
}: {
  expandedMenuId: string | null;
  selectedTavern: Tavern | null;
  onMenuToggle: (id: string | null) => void;
  onRegister: (tavern: Tavern) => void;
  onSelectTavern: (tavern: Tavern) => void;
}) {
  return (
    <section className="flex flex-col gap-5 px-5 py-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[24px] font-bold leading-[1.6] tracking-[-0.48px]">지도</h1>
        <p className="text-[16px] font-normal leading-[1.4] tracking-[-0.32px] text-[#808080]">
          가고 싶은 주막의 아이콘을 클릭해보세요.
        </p>
      </div>

      <CampusMap selectedTavern={selectedTavern} onSelectTavern={onSelectTavern} />

      {selectedTavern && (
        <TavernCard
          expanded={expandedMenuId === selectedTavern.id}
          tavern={selectedTavern}
          onMenuToggle={() =>
            onMenuToggle(expandedMenuId === selectedTavern.id ? null : selectedTavern.id)
          }
          onRegister={() => onRegister(selectedTavern)}
        />
      )}
    </section>
  );
}

function TavernListView({
  expandedMenuId,
  sortKey,
  taverns,
  onMenuToggle,
  onRegister,
  onSortChange,
}: {
  expandedMenuId: string | null;
  sortKey: TavernSortKey;
  taverns: Tavern[];
  onMenuToggle: (id: string | null) => void;
  onRegister: (tavern: Tavern) => void;
  onSortChange: (key: TavernSortKey) => void;
}) {
  return (
    <section className="flex flex-col gap-3 px-5 py-6">
      <h1 className="text-[24px] font-bold leading-[1.6] tracking-[-0.48px]">주막 목록</h1>
      <TavernSortTabs sortKey={sortKey} onSortChange={onSortChange} />
      <div className="flex flex-col gap-3">
        {taverns.map((tavern) => (
          <TavernCard
            key={tavern.id}
            expanded={expandedMenuId === tavern.id}
            tavern={tavern}
            onMenuToggle={() => onMenuToggle(expandedMenuId === tavern.id ? null : tavern.id)}
            onRegister={() => onRegister(tavern)}
          />
        ))}
      </div>
    </section>
  );
}

function ReservationLookup({
  selectedTavern,
  onRegister,
}: {
  selectedTavern: Tavern;
  onRegister: () => void;
}) {
  return (
    <section className="flex flex-col gap-5 px-5 py-6">
      <h1 className="text-[24px] font-bold leading-[1.6] tracking-[-0.48px]">예약 조회</h1>
      <div className="rounded-[12px] border border-[#e5e5e5] bg-white p-5">
        <p className="text-[16px] font-medium leading-[1.6] text-[#808080]">현재 선택한 주막</p>
        <h2 className="mt-1 text-[24px] font-bold leading-[1.4] tracking-[-0.48px]">
          {selectedTavern.name}
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <TavernMetric label="웨이팅" value={selectedTavern.waitTeams} suffix="팀 대기중" />
          <TavernMetric
            label="잔여좌석"
            value={selectedTavern.availableSeats}
            suffix={`/ ${selectedTavern.totalSeats} 석`}
          />
        </div>
        <button
          type="button"
          className="mt-5 h-[51px] w-full rounded-[8px] bg-[#ff3d3d] text-[16px] font-semibold tracking-[-0.32px] text-white"
          onClick={onRegister}
        >
          대기 등록하기
        </button>
      </div>
    </section>
  );
}

function CampusMap({
  selectedTavern,
  onSelectTavern,
}: {
  selectedTavern: Tavern | null;
  onSelectTavern: (tavern: Tavern) => void;
}) {
  return (
    <div className="relative h-[269px] overflow-hidden bg-[#d8e2f0]">
      <img
        src={tavernMapTempImage}
        alt="주막 지도 임시 이미지"
        className="absolute inset-0 size-full object-cover"
      />
      {taverns.map((tavern) => {
        const selected = selectedTavern?.id === tavern.id;

        return (
          <button
            key={tavern.id}
            type="button"
            aria-label={`${tavern.name} 지도 위치`}
            aria-pressed={selected}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            style={{ left: tavern.mapPosition.left, top: tavern.mapPosition.top }}
            onClick={() => onSelectTavern(tavern)}
          >
            <span
              className={`flex items-center justify-center rounded-full border shadow-md ${
                selected
                  ? 'size-[29px] border-[#ff3d3d] bg-white'
                  : 'size-7 border-white bg-[#ff3d3d]'
              }`}
            >
              <FiMapPin className={selected ? 'text-[#ff3d3d]' : 'text-white'} size={17} />
            </span>
            <span className="max-w-[72px] overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold leading-[1.4] tracking-[-0.24px] text-[#ff3d3d]">
              {tavern.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TavernSortTabs({
  sortKey,
  onSortChange,
}: {
  sortKey: TavernSortKey;
  onSortChange: (key: TavernSortKey) => void;
}) {
  return (
    <div className="flex w-full rounded-[8px] bg-[#f9f9f9] p-1" aria-label="주막 정렬">
      {tavernSortOptions.map((option) => {
        const selected = sortKey === option.key;

        return (
          <button
            key={option.key}
            type="button"
            className={`h-10 min-w-0 flex-1 rounded-[8px] px-2 text-center text-[16px] leading-6 tracking-[-0.32px] ${
              selected ? 'bg-white font-semibold text-[#ff3d3d]' : 'font-normal text-[#808080]'
            }`}
            onClick={() => onSortChange(option.key)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function TavernCard({
  expanded,
  tavern,
  onMenuToggle,
  onRegister,
}: {
  expanded: boolean;
  tavern: Tavern;
  onMenuToggle: () => void;
  onRegister: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-[12px] border border-[#e5e5e5] bg-white">
      <div className="flex flex-col items-center gap-2.5 px-6 pb-2.5 pt-5">
        <div className="flex w-full flex-col gap-4">
          <div>
            <p className="text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
              {tavern.department} · {tavern.category}
            </p>
            <h3 className="text-[24px] font-bold leading-[1.4] tracking-[-0.48px]">
              {tavern.name}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TavernMetric label="웨이팅" value={tavern.waitTeams} suffix="팀 대기중" />
            <TavernMetric
              label="잔여좌석"
              value={tavern.availableSeats}
              suffix={`/ ${tavern.totalSeats} 석`}
            />
          </div>
          <button
            type="button"
            className="h-[51px] w-full rounded-[8px] bg-[#ff3d3d] text-[16px] font-semibold tracking-[-0.32px] text-white"
            onClick={onRegister}
          >
            대기 등록하기
          </button>
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
          <ul className="grid w-full gap-2 border-t border-[#e5e5e5] pt-3 text-[14px] font-medium text-[#4d4d4d]">
            {tavern.menu.map((menu) => (
              <li key={menu} className="flex items-center justify-between">
                <span>{menu}</span>
                <span className="text-[#808080]">현장 결제</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function TavernMetric({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div className="rounded-[8px] bg-[#f9f9f9] p-4">
      <p className="text-[14px] font-medium leading-[1.6] tracking-[-0.28px] text-[#808080]">
        {label}
      </p>
      <div className="flex items-end gap-1">
        <strong className="text-[28px] font-bold leading-[1.4] tracking-[-0.56px] text-[#ff3d3d]">
          {value}
        </strong>
        <span className="pb-1 text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function WaitingCompleteModal({ tavern, onClose }: { tavern: Tavern; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/30">
      <div className="relative min-h-dvh w-full max-w-[375px] overflow-hidden">
        <div className="absolute inset-x-5 top-16 h-[269px] overflow-hidden opacity-70">
          <CampusMap selectedTavern={tavern} onSelectTavern={() => undefined} />
        </div>
        <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 overflow-hidden rounded-[12px] bg-white pb-6 pt-4">
          <div className="flex items-center justify-between px-5">
            <h2 className="w-full text-center text-[18px] font-semibold leading-[1.5] tracking-[-0.18px]">
              웨이팅 등록 완료!
            </h2>
            <button
              type="button"
              className="absolute right-5 top-4 flex size-8 items-center justify-center"
              onClick={onClose}
            >
              <FiX size={24} />
            </button>
          </div>
          <div className="mt-5 px-6">
            <div className="px-5 pb-2.5">
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
            <dl className="grid gap-2.5 px-5 text-[16px] font-medium leading-[1.6] tracking-[-0.32px]">
              <div className="flex justify-between">
                <dt className="text-[#808080]">예약자명</dt>
                <dd>홍길동</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#808080]">인원</dt>
                <dd>2명</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#808080]">연락처</dt>
                <dd>01012345678</dd>
              </div>
            </dl>
            <div className="my-4 h-px bg-[#e5e5e5]" />
            <p className="rounded-[8px] bg-[#f9f9f9] p-4 text-[14px] font-medium leading-[1.5] tracking-[-0.28px] text-[#808080]">
              차례가 오면 전화를 걸어 알려드립니다.
              <br />
              전화를 받지 않을 시 예약이 취소될 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
