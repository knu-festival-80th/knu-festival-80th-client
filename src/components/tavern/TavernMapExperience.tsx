import { useMemo, useState } from 'react';
import { FiChevronDown, FiChevronRight, FiMapPin, FiMenu, FiX } from 'react-icons/fi';

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
  const [activeTab, setActiveTab] = useState<TopTab>('map');
  const [sortKey, setSortKey] = useState<TavernSortKey>('shortWait');
  const [selectedTavern, setSelectedTavern] = useState<Tavern>(taverns[0]);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const [registeredTavern, setRegisteredTavern] = useState<Tavern | null>(null);

  const sortedTaverns = useMemo(() => sortTaverns(sortKey), [sortKey]);
  const visibleTaverns = activeTab === 'map' ? sortedTaverns.slice(0, 3) : sortedTaverns;

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
          selectedTavern={selectedTavern}
          onRegister={() => handleRegister(selectedTavern)}
        />
      ) : (
        <MapOverview
          expandedMenuId={expandedMenuId}
          selectedTavern={selectedTavern}
          sortKey={sortKey}
          taverns={visibleTaverns}
          onMenuToggle={setExpandedMenuId}
          onRegister={handleRegister}
          onSelectTavern={setSelectedTavern}
          onSortChange={setSortKey}
          onTabChange={setActiveTab}
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
              {selected && <span className="mt-[7px] h-px w-full bg-[#ff3d3d]" />}
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
  sortKey,
  taverns,
  onMenuToggle,
  onRegister,
  onSelectTavern,
  onSortChange,
  onTabChange,
}: {
  expandedMenuId: string | null;
  selectedTavern: Tavern;
  sortKey: TavernSortKey;
  taverns: Tavern[];
  onMenuToggle: (id: string | null) => void;
  onRegister: (tavern: Tavern) => void;
  onSelectTavern: (tavern: Tavern) => void;
  onSortChange: (key: TavernSortKey) => void;
  onTabChange: (tab: TopTab) => void;
}) {
  return (
    <>
      <section className="relative flex min-h-64 flex-col justify-center overflow-hidden px-5 py-[42px]">
        <div className="absolute inset-0 bg-[linear-gradient(132deg,#fff0a8_0%,#ff9d84_54%,#ffffff_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.65),transparent_150px)]" />
        <div className="relative flex flex-col gap-[30px]">
          <h1 className="text-[40px] font-bold uppercase leading-none tracking-[-2px] text-[#1a1a1a]">
            지도 및
            <br />
            주막 정보
          </h1>
          <button
            type="button"
            className="flex w-fit items-center gap-1.5 rounded-full border border-white/30 bg-white/20 py-2.5 pl-5 pr-3.5 text-[14px] font-medium text-[#1a1a1a]"
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

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <SectionHeading eyebrow="Map" title="지도에서 모든 주막 리스트를 확인해요." />
            <button
              type="button"
              className="flex w-fit items-center gap-1.5 rounded-full border border-black py-2.5 pl-5 pr-3.5 text-[14px] font-medium"
              onClick={() => onTabChange('list')}
            >
              주막 전체보기
              <FiChevronRight size={20} />
            </button>
          </div>
          <CampusMap selectedTavern={selectedTavern} onSelectTavern={onSelectTavern} />
        </div>

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

      <FaqSection />
      <ContactSection />
      <TavernFooter />
    </>
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
      <div className="relative flex h-[104px] flex-col justify-center p-6">
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
      <div className="absolute inset-x-0 bottom-0 h-[326px] overflow-hidden">
        <div className="absolute bottom-0 left-7 h-28 w-16 rounded-t-full bg-[#f7c35f]" />
        <div className="absolute bottom-12 left-24 h-32 w-24 bg-[#4b9b74] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
        <div className="absolute bottom-10 left-44 h-40 w-28 bg-[#2f7c61] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
        <div className="absolute bottom-8 right-5 h-24 w-20 bg-[#64b17d] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
        <div className="absolute bottom-6 left-10 h-14 w-24 border-b-[10px] border-l-[8px] border-[#7a3327]" />
        <div className="absolute bottom-4 h-6 w-full bg-[#e8f6dc]" />
      </div>
    </article>
  );
}

function CampusMap({
  selectedTavern,
  onSelectTavern,
}: {
  selectedTavern: Tavern;
  onSelectTavern: (tavern: Tavern) => void;
}) {
  return (
    <div className="relative h-[269px] overflow-hidden bg-[#d8e2f0]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0_44%,rgba(255,255,255,0.38)_44%_49%,transparent_49%),linear-gradient(18deg,transparent_0_36%,rgba(255,255,255,0.5)_36%_41%,transparent_41%)]" />
      <div className="absolute left-[-10%] top-[22%] h-7 w-[72%] rotate-[16deg] rounded-full bg-[#f6f0df]" />
      <div className="absolute right-[-18%] top-[8%] h-8 w-[78%] -rotate-[18deg] rounded-full bg-[#f6f0df]" />
      <div className="absolute bottom-[18%] left-[8%] h-12 w-[36%] rounded-sm bg-[#bdd5a7]" />
      <div className="absolute bottom-[12%] right-[8%] h-14 w-[42%] rounded-sm bg-[#bdd5a7]" />
      <div className="absolute left-[46%] top-[40%] h-24 w-20 rounded-full border-[10px] border-[#9fb5d1]" />
      {taverns.map((tavern) => {
        const selected = selectedTavern.id === tavern.id;

        return (
          <button
            key={tavern.id}
            type="button"
            aria-label={`${tavern.name} 지도 위치`}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ${
              selected ? 'size-9 bg-[#ff3d3d]' : 'size-7 bg-[#1a1a1a]'
            }`}
            style={{ left: tavern.mapPosition.left, top: tavern.mapPosition.top }}
            onClick={() => onSelectTavern(tavern)}
          >
            <FiMapPin className="m-auto text-white" size={selected ? 20 : 15} />
          </button>
        );
      })}
      <div className="absolute bottom-3 left-3 rounded-[8px] bg-white/90 px-3 py-2 shadow-sm">
        <p className="text-[12px] font-semibold text-[#808080]">{selectedTavern.department}</p>
        <p className="text-[14px] font-bold text-[#1a1a1a]">{selectedTavern.name}</p>
      </div>
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

function FaqSection() {
  return (
    <section className="flex flex-col gap-12 px-5 py-8">
      <SectionHeading eyebrow="FAQ" title="자주 묻는 질문" />
      <div className="flex flex-col gap-2.5">
        {tavernFaqs.map((faq, index) => (
          <details key={faq.question} className="bg-[#f9f9f9] p-5" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-start justify-between text-[16px] font-bold leading-[1.5]">
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
      <SectionHeading eyebrow="Contact" title="문의하기" />
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
          className="flex w-fit items-center gap-1.5 rounded-full border border-black py-2.5 pl-5 pr-3.5 text-[14px]"
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
