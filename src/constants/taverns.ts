import type { BoothListItem, BoothMapItem, BoothType } from '@/apis/modules/booth';

export type TavernSortKey = 'popular' | 'shortWait' | 'simple';

export const festivalMap = {
  id: 'knu-festival-2026-final-map',
  version: 2,
  width: 2942,
  height: 3404,
} as const;

export type Tavern = {
  id: string;
  boothId: number;
  department: string;
  name: string;
  location: string;
  waitTeams: number;
  waitingOpen: boolean;
  popularity: number;
  menuBoardImageUrl: string | null;
  xRatio: number;
  yRatio: number;
  type: BoothType;
  color: string;
  markerLabel?: string;
};

export const PERFORMANCE_LOCATION_DESCRIPTION = '모든 공연은 대공연장에서 진행됩니다.';

export const isPerformanceLocation = (tavern: Tavern | null | undefined) =>
  tavern?.type === 'STAGE';

export const isStampLocation = (tavern: Tavern | null | undefined) => tavern?.type === 'STAMP';

const normalizeRatio = (ratio: number | null | undefined) => ratio ?? 0.5;

const DEFAULT_COLORS: Record<BoothType, string> = {
  BOOTH: '#15ccb1',
  TAVERN: '#ff3d3d',
  STAGE: '#8B5CF6',
  STAMP: '#FFDBF5',
};

export function boothToTavern(booth: BoothListItem): Tavern {
  const type = booth.type ?? 'TAVERN';
  return {
    id: String(booth.boothId),
    boothId: booth.boothId,
    department: booth.department ?? '',
    name: booth.name,
    location: booth.location ?? '',
    waitTeams: booth.currentWaitingTeams,
    waitingOpen: booth.waitingOpen,
    popularity: booth.likeCount,
    menuBoardImageUrl: booth.menuBoardImageUrl,
    xRatio: normalizeRatio(booth.xRatio),
    yRatio: normalizeRatio(booth.yRatio),
    type,
    color: booth.color ?? DEFAULT_COLORS[type],
  };
}

export function mapBoothToTavern(booth: BoothMapItem): Tavern {
  const type = booth.type ?? 'TAVERN';
  return {
    id: String(booth.boothId),
    boothId: booth.boothId,
    department: '',
    name: booth.name,
    location: '',
    waitTeams: 0,
    waitingOpen: false,
    popularity: 0,
    menuBoardImageUrl: null,
    xRatio: normalizeRatio(booth.xRatio),
    yRatio: normalizeRatio(booth.yRatio),
    type,
    color: booth.color ?? DEFAULT_COLORS[type],
  };
}

export const tavernSortOptions: Array<{ key: TavernSortKey; label: string }> = [
  { key: 'popular', label: '인기순' },
  { key: 'shortWait', label: '대기 적은 순' },
  { key: 'simple', label: '간단히' },
];

export const tavernFaqs = [
  {
    question: 'Q1. 주막 대기 등록은 어떻게 하나요?',
    answer:
      '원하는 주막을 선택한 후 대기 등록 버튼을 누르면 됩니다. 이름, 인원수, 휴대폰 번호를 입력하면 대기 번호가 발급됩니다.',
  },
  {
    question: 'Q2. 대기 등록은 여러 개 가능한가요?',
    answer:
      '최대 3곳까지 동시에 대기 등록이 가능합니다. 단, 같은 주막에 중복 등록은 불가합니다. 이미 3곳에 예약한 후 다른 주막에 대기 등록하고 싶다면, 기존 대기 등록을 취소한 후 가능합니다. ',
  },
  {
    question: 'Q3. 대기 순서는 어떻게 확인하나요?',
    answer: '예약 조회에서 현재 내 앞의 대기 팀 수를 확인할 수 있습니다.',
  },
  {
    question: 'Q4. 대기를 직접 취소하려면 어떻게 하나요?',
    answer: ' 예약 조회 화면에서 취소하실 수 있습니다.',
  },
  {
    question: 'Q5. 주막 위치는 어디서 확인할 수 있나요?',
    answer: '현재 페이지 상단의 [지도] 탭에서 캠퍼스 내 주막 위치를 한눈에 확인할 수 있습니다.',
  },
  {
    question: 'Q6. 어떤 주막들이 운영되나요?',
    answer:
      '이번 대동제에는 총 38개의 주막이 운영됩니다. 자세한 목록은 [주막목록] 탭에서 확인해 주세요.',
  },
  {
    question: 'Q7. 주막별 메뉴나 정보는 어디서 볼 수 있나요?',
    answer:
      '지도나 주막 목록에서 원하는 주막을 선택하면 해당 주막의 메뉴 및 상세 정보를 확인할 수 있습니다.',
  },
];
