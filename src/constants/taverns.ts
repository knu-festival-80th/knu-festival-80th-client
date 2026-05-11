export type TavernSortKey = 'popular' | 'shortWait' | 'simple';

export const festivalMap = {
  id: 'knu-festival-2026-final-map',
  version: 1,
  width: 1364,
  height: 1179,
} as const;

export type TavernMapPosition = {
  mapId: string;
  mapVersion: number;
  xRatio: number;
  yRatio: number;
  label: string;
};

export type Tavern = {
  id: string;
  boothId: number;
  department: string;
  name: string;
  description: string;
  location: string;
  waitTeams: number;
  waitingOpen: boolean;
  popularity: number;
  mapPosition: TavernMapPosition;
};

export const tavernSortOptions: Array<{ key: TavernSortKey; label: string }> = [
  { key: 'popular', label: '인기순' },
  { key: 'shortWait', label: '대기 적은 순' },
  { key: 'simple', label: '간단히' },
];

export const taverns: Tavern[] = [
  {
    id: 'itaewon-class',
    boothId: 1,
    department: '전자 E반',
    name: 'E태원 클라쓰',
    description: '바삭한 야키소바와 시원한 하이볼을 준비했어요.',
    location: '공대 9호관 앞',
    waitTeams: 0,
    waitingOpen: false,
    popularity: 86,
    mapPosition: {
      mapId: festivalMap.id,
      mapVersion: festivalMap.version,
      xRatio: 0.38,
      yRatio: 0.18,
      label: '공대 9호관 앞',
    },
  },
  {
    id: 'startup',
    boothId: 2,
    department: '컴퓨터학부',
    name: 'Start-up',
    description: '떡볶이와 튀김, 간단한 안주를 빠르게 즐길 수 있어요.',
    location: 'IT대학 2호관 앞',
    waitTeams: 1,
    waitingOpen: false,
    popularity: 93,
    mapPosition: {
      mapId: festivalMap.id,
      mapVersion: festivalMap.version,
      xRatio: 0.24,
      yRatio: 0.24,
      label: 'IT대학 2호관 앞',
    },
  },
  {
    id: 'stationery',
    boothId: 3,
    department: '자율학부1',
    name: '문방구 옆 분식집',
    description: '학교 앞 분식집 감성의 메뉴를 모았습니다.',
    location: '복현회관 잔디광장',
    waitTeams: 8,
    waitingOpen: false,
    popularity: 71,
    mapPosition: {
      mapId: festivalMap.id,
      mapVersion: festivalMap.version,
      xRatio: 0.62,
      yRatio: 0.39,
      label: '복현회관 잔디광장',
    },
  },
  {
    id: 'sim-mong',
    boothId: 4,
    department: '심리학과',
    name: '심몽시공',
    description: '매콤한 중식 안주와 함께 축제 분위기를 즐겨보세요.',
    location: '사회과학대학 앞',
    waitTeams: 7,
    waitingOpen: false,
    popularity: 64,
    mapPosition: {
      mapId: festivalMap.id,
      mapVersion: festivalMap.version,
      xRatio: 0.76,
      yRatio: 0.5,
      label: '사회과학대학 앞',
    },
  },
  {
    id: 'nursing-pub',
    boothId: 5,
    department: '간호대학',
    name: '간호대에서 술먹자',
    description: '든든한 분식 메뉴와 논알콜 음료도 준비했습니다.',
    location: '간호대학 입구',
    waitTeams: 10,
    waitingOpen: false,
    popularity: 78,
    mapPosition: {
      mapId: festivalMap.id,
      mapVersion: festivalMap.version,
      xRatio: 0.34,
      yRatio: 0.33,
      label: '간호대학 입구',
    },
  },
  {
    id: 'gosu-restaurant',
    boothId: 6,
    department: '고고학과',
    name: '고스토랑',
    description: '따뜻한 국물 안주와 구이 메뉴를 준비했어요.',
    location: '글로벌플라자 앞',
    waitTeams: 3,
    waitingOpen: false,
    popularity: 82,
    mapPosition: {
      mapId: festivalMap.id,
      mapVersion: festivalMap.version,
      xRatio: 0.49,
      yRatio: 0.28,
      label: '글로벌플라자 앞',
    },
  },
  {
    id: 'hobanu-pocha',
    boothId: 7,
    department: '농업생명과학대학',
    name: '호반우포차',
    description: '포차 감성의 안주와 음료를 가볍게 즐길 수 있어요.',
    location: '농대 운동장 앞',
    waitTeams: 2,
    waitingOpen: false,
    popularity: 76,
    mapPosition: {
      mapId: festivalMap.id,
      mapVersion: festivalMap.version,
      xRatio: 0.47,
      yRatio: 0.49,
      label: '농대 운동장 앞',
    },
  },
  {
    id: 'come-eat',
    boothId: 8,
    department: '식품공학부',
    name: '밥먹으러오세요',
    description: '든든한 식사 메뉴와 축제용 간식을 함께 판매합니다.',
    location: '학생주차장 옆',
    waitTeams: 5,
    waitingOpen: false,
    popularity: 69,
    mapPosition: {
      mapId: festivalMap.id,
      mapVersion: festivalMap.version,
      xRatio: 0.62,
      yRatio: 0.6,
      label: '학생주차장 옆',
    },
  },
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
