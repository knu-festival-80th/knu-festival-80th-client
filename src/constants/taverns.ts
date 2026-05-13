import type { BoothListItem } from '@/apis/modules/booth';

export type TavernSortKey = 'popular' | 'shortWait' | 'simple';

export const festivalMap = {
  id: 'knu-festival-2026-final-map',
  version: 1,
  width: 1364,
  height: 1179,
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
};

export function boothToTavern(booth: BoothListItem): Tavern {
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
    xRatio: booth.xRatio ?? 0.5,
    yRatio: booth.yRatio ?? 0.5,
  };
}

export const tavernSortOptions: Array<{ key: TavernSortKey; label: string }> = [
  { key: 'popular', label: '인기순' },
  { key: 'shortWait', label: '대기 적은 순' },
  { key: 'simple', label: '간단히' },
];

export const tavernFaqs = [
  {
    question: '대기 등록은 어떻게 하나요?',
    answer:
      '지도에서 원하는 주막을 선택한 후 대기 등록 버튼을 누르면 됩니다. 이름, 인원수, 휴대폰 번호를 입력하면 대기 번호가 발급됩니다.',
  },
  {
    question: '대기 등록은 언제 취소되나요?',
    answer: '호출 전까지 예약 조회 화면에서 취소할 수 있습니다.',
  },
  {
    question: '대기 등록은 여러 개 가능한가요?',
    answer: '최대 3곳까지 동시에 대기 등록이 가능합니다. 단, 같은 주막에 중복 등록은 불가합니다.',
  },
  {
    question: '대기 순서는 어떻게 확인하나요?',
    answer: '예약 조회에서 현재 내 앞의 대기 팀 수를 확인할 수 있습니다.',
  },
  {
    question: '대기 등록은 무료인가요?',
    answer: '대기 등록 자체는 무료이며, 결제는 현장에서 진행합니다.',
  },
];
