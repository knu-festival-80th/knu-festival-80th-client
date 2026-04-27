import { useMemo, useState } from 'react';
import { FiChevronDown, FiChevronRight, FiMapPin, FiMenu, FiX } from 'react-icons/fi';

import tavernMapTempImage from '@/assets/images/tavern-map-temp.svg';
import {
  tavernFaqs,
  taverns,
  tavernSortOptions,
  type Tavern,
  type TavernSortKey,
} from '@/constants/taverns';

type TopTab = 'intro' | 'map' | 'list' | 'reservation';

const topTabs: Array<{ key: TopTab; label: string }> = [
  { key: 'intro', label: '소개' },
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
  const [activeTab, setActiveTab] = useState<TopTab>('intro');
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

      {activeTab === 'intro' ? (
        <IntroOverview onTabChange={setActiveTab} />
      ) : activeTab === 'list' ? (
        <TavernListView
          expandedMenuId={expandedMenuId}
          sortKey={sortKey}
          taverns={sortedTaverns}
          onMenuToggle={setExpandedMenuId}
          onRegister={handleRegister}
          onSortChange={setSortKey}
        />
      ) : activeTab === 'reservation' ? (
        <ReservationLookup />
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

function IntroOverview({ onTabChange }: { onTabChange: (tab: TopTab) => void }) {
  return (
    <>
      <section className="relative flex min-h-64 flex-col justify-center overflow-hidden px-5 py-[42px]">
        <div className="absolute inset-0 bg-[linear-gradient(132deg,#fff07a_0%,#ff6668_58%,#ffffff_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_18%,rgba(255,255,255,0.72),transparent_132px)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/20 to-transparent" />
        <div className="relative flex flex-col gap-[30px]">
          <h1 className="text-[40px] font-bold uppercase leading-none tracking-[-2px] text-[#1a1a1a]">
            지도 및
            <br />
            주막 정보
          </h1>
          <button
            type="button"
            className="flex w-fit items-center gap-1.5 rounded-full border border-white/30 bg-white/20 py-2.5 pl-5 pr-3.5 text-[14px] font-medium leading-[1.5] text-[#1a1a1a]"
            onClick={() => onTabChange('list')}
          >
            인기 주막 둘러보기
            <FiChevronRight size={20} />
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-12 px-5 py-16">
        <SectionHeading
          eyebrow="How to use"
          title="지도에서 주막 위치를 확인하고 빠르게 예약해요"
        />
        <div className="flex flex-col gap-6">
          <GuideCard
            eyebrow="Map"
            title="원하는 주막 아이콘 터치하기"
            description="메뉴와 대기 시간을 확인할 수 있어요."
          />
          <GuideCard
            eyebrow="Reservation"
            title="실시간 대기 현황 확인 및 예약"
            description="줄을 서지 않고 미리 예약해 기다릴 수 있어요."
          />
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <SectionHeading eyebrow="Map" title="지도에서 모든 주막 리스트를 확인해요." />
            <button
              type="button"
              className="flex w-fit items-center gap-1.5 rounded-full border border-black py-2.5 pl-5 pr-3.5 text-[14px] font-medium leading-[1.5]"
              onClick={() => onTabChange('map')}
            >
              주막 전체보기
              <FiChevronRight size={20} />
            </button>
          </div>
          <div className="h-60 overflow-hidden">
            <img
              src={tavernMapTempImage}
              alt="주막 지도 미리보기"
              className="size-full object-cover"
            />
          </div>
        </div>
      </section>

      <FaqSection />
      <ContactSection />
      <TavernFooter />
    </>
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

function ReservationLookup() {
  const [reservationName, setReservationName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);
  const resultTavern = taverns.find((tavern) => tavern.id === 'startup') ?? taverns[0];
  const canSearch = reservationName.trim().length > 0 && phoneNumber.trim().length > 0;

  return (
    <>
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
              setShowResultModal(true);
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

      {showResultModal && (
        <ReservationResultModal
          name={reservationName}
          phoneNumber={phoneNumber}
          tavern={resultTavern}
          onClose={() => setShowResultModal(false)}
        />
      )}
    </>
  );
}

function FieldInput({
  id,
  label,
  placeholder,
  value,
  autoComplete,
  inputMode,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  autoComplete?: string;
  inputMode?: 'numeric';
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="text-[16px] font-semibold leading-[1.5] tracking-[-0.16px]">{label}</span>
      <input
        id={id}
        type="text"
        className="h-[51px] rounded-[8px] border border-[#e5e5e5] px-4 text-[16px] leading-none tracking-[-0.32px] outline-none placeholder:text-[#808080] focus:border-[#ff3d3d]"
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[16px] font-bold leading-[1.4] tracking-[-0.32px]">{eyebrow}</p>
      <h2 className="text-[18px] font-bold leading-[1.4] tracking-[-0.36px]">{title}</h2>
    </div>
  );
}

function GuideCard({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <article className="relative h-[430px] overflow-hidden rounded-[6px] bg-[#f9f9f9]">
      <div className="absolute inset-0 bg-[linear-gradient(132deg,#ffffff_34%,rgba(255,255,255,0)_100%)]" />
      <div className="relative z-10 flex h-[104px] flex-col justify-center p-6">
        <p className="text-[16px] font-bold leading-[1.4] tracking-[-0.32px] text-[#1a1a1a]">
          {eyebrow}
        </p>
        <h3 className="mt-1.5 text-[20px] font-bold leading-[1.4] tracking-[-0.4px] text-[#1a1a1a]">
          {title}
        </h3>
        <p className="mt-2 text-[16px] font-normal leading-[1.4] tracking-[-0.32px] text-[#808080]">
          {description}
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[326px] overflow-hidden bg-[#dff5da]">
        <div className="absolute bottom-0 h-[64px] w-full bg-[#d8f1c8]" />
        <div className="absolute bottom-20 left-24 size-16 rounded-full bg-[#f2a94b]" />
        <div className="absolute bottom-16 left-9 h-16 w-20 -rotate-6 border-b-[12px] border-l-[8px] border-[#8b352d]" />
        <div className="absolute bottom-10 left-28 h-36 w-24 bg-[#4fa36c] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
        <div className="absolute bottom-10 left-48 h-48 w-28 bg-[#2e7456] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
        <div className="absolute bottom-8 right-8 h-32 w-24 bg-[#69b982] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
      </div>
    </article>
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

function ReservationResultModal({
  name,
  phoneNumber,
  tavern,
  onClose,
}: {
  name: string;
  phoneNumber: string;
  tavern: Tavern;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/30">
      <div className="relative min-h-dvh w-full max-w-[375px]">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="reservation-result-title"
          className="absolute left-5 right-5 top-1/2 -translate-y-1/2 overflow-hidden rounded-[12px] bg-white pb-6 pt-4"
        >
          <div className="flex items-center justify-between px-5">
            <h2
              id="reservation-result-title"
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
                  5
                </strong>
                <span className="pb-1 text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
                  팀 대기중
                </span>
              </div>
            </div>

            <div className="my-4 h-px bg-[#e5e5e5]" />
            <dl className="grid gap-2.5 px-5 text-[16px] font-medium leading-[1.6] tracking-[-0.32px]">
              <div className="flex justify-between gap-4">
                <dt className="text-[#808080]">예약자명</dt>
                <dd className="text-right">{name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#808080]">인원</dt>
                <dd className="text-right">2명</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#808080]">연락처</dt>
                <dd className="text-right">{phoneNumber}</dd>
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

function FaqSection() {
  return (
    <section className="flex flex-col gap-12 px-5 py-8">
      <SectionHeading eyebrow="FAQ" title="자주 묻는 질문" />
      <div className="flex flex-col gap-2.5">
        {tavernFaqs.map((faq, index) => (
          <details key={faq.question} className="bg-[#f9f9f9] p-5" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[16px] font-bold leading-[1.5]">
              {faq.question}
              <FiChevronDown size={20} />
            </summary>
            <p className="mt-3 text-[16px] font-medium leading-[1.5] text-[#4d4d4d]">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="flex flex-col gap-12 px-5 py-16">
      <div className="flex flex-col gap-1.5">
        <SectionHeading eyebrow="Contact" title="문의하기" />
        <p className="text-[16px] font-medium leading-[1.4] tracking-[-0.32px] text-[#808080]">
          축제 운영팀에 언제든 연락하세요
        </p>
      </div>
      <div className="grid gap-5 bg-[#f9f9f9] p-5">
        <ContactItem label="이메일" value="likelion_knu@knu.ac.kr" />
        <ContactItem label="전화" value="02-1234-5678" />
        <ContactItem label="위치" value="경북대학교 본관" />
      </div>
      <div className="flex flex-col gap-5">
        <h2 className="text-[18px] font-bold leading-[1.4] tracking-[-0.36px]">
          궁금한 점 간편하게 문의하기
        </h2>
        <button
          type="button"
          className="flex w-fit items-center gap-1.5 rounded-full border border-black py-2.5 pl-5 pr-3.5 text-[14px] font-medium leading-[1.5]"
        >
          간편 문의하기
          <FiChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}

function ContactItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-3 text-[16px] leading-[1.5]">
      <strong>{label}</strong>
      <span className="font-medium text-[#4d4d4d]">{value}</span>
    </div>
  );
}

function TavernFooter() {
  return (
    <footer className="flex flex-col gap-12 bg-[#1a1a1a] px-5 pb-[124px] pt-16 text-white">
      <div className="flex items-end gap-1">
        <span className="font-serif text-[14px] font-black italic leading-none">
          The Grand Moment
        </span>
        <span className="text-[14px] font-black leading-none text-[#ff3d3d]">KNU80</span>
      </div>
      <nav className="flex flex-col gap-5 text-[16px] font-bold leading-[1.5]">
        <a href="/map">지도 정보</a>
        <a href="/guestbook">롤링페이퍼</a>
        <a href="#insta">인스타팅</a>
        <a href="#photo">포토부스</a>
        <a href="#notice">공지사항</a>
      </nav>
      <div className="flex flex-col gap-4 text-[14px] leading-none">
        <a href="#privacy" className="underline">
          개인정보 보호
        </a>
        <a href="#terms" className="underline">
          서비스 이용 약관
        </a>
        <a href="#cookies" className="underline">
          쿠키 설정
        </a>
      </div>
      <p className="text-[14px] leading-none">© 2026 경북대학교 대동제. copyright</p>
      <p className="text-[14px] leading-none">멋쟁이 사자처럼 X 경북대학교 디자인학과</p>
    </footer>
  );
}
