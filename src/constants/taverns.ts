export type TavernSortKey = 'popular' | 'shortWait' | 'simple';

export type Tavern = {
  id: string;
  department: string;
  category: string;
  name: string;
  description: string;
  location: string;
  waitTeams: number;
  availableSeats: number;
  totalSeats: number;
  popularity: number;
  menu: string[];
  mapPosition: {
    left: string;
    top: string;
  };
};

export const tavernSortOptions: Array<{ key: TavernSortKey; label: string }> = [
  { key: 'popular', label: '인기순' },
  { key: 'shortWait', label: '대기 적은 순' },
  { key: 'simple', label: '간단히' },
];

export const taverns: Tavern[] = [
  {
    id: 'itaewon-class',
    department: '전자 E반',
    category: '일식',
    name: 'E태원 클라쓰',
    description: '바삭한 야키소바와 시원한 하이볼을 준비했어요.',
    location: '공대 9호관 앞',
    waitTeams: 0,
    availableSeats: 5,
    totalSeats: 25,
    popularity: 86,
    menu: ['야키소바', '오코노미야끼', '치킨 가라아게'],
    mapPosition: { left: '54%', top: '38%' },
  },
  {
    id: 'startup',
    department: '컴퓨터학부',
    category: '분식',
    name: 'Start-up',
    description: '떡볶이와 튀김, 간단한 안주를 빠르게 즐길 수 있어요.',
    location: 'IT대학 2호관 앞',
    waitTeams: 1,
    availableSeats: 0,
    totalSeats: 25,
    popularity: 93,
    menu: ['국물 떡볶이', '모둠 튀김', '어묵탕'],
    mapPosition: { left: '64%', top: '52%' },
  },
  {
    id: 'stationery',
    department: '자율학부1',
    category: '분식',
    name: '문방구 옆 분식집',
    description: '학교 앞 분식집 감성의 메뉴를 모았습니다.',
    location: '복현회관 잔디광장',
    waitTeams: 8,
    availableSeats: 0,
    totalSeats: 25,
    popularity: 71,
    menu: ['순대볶음', '컵밥', '라면'],
    mapPosition: { left: '43%', top: '58%' },
  },
  {
    id: 'sim-mong',
    department: '심리학과',
    category: '중식',
    name: '심몽시공',
    description: '매콤한 중식 안주와 함께 축제 분위기를 즐겨보세요.',
    location: '사회과학대학 앞',
    waitTeams: 7,
    availableSeats: 0,
    totalSeats: 25,
    popularity: 64,
    menu: ['마라샹궈', '꿔바로우', '짬뽕탕'],
    mapPosition: { left: '35%', top: '42%' },
  },
  {
    id: 'nursing-pub',
    department: '간호대학',
    category: '분식',
    name: '간호대에서 술먹자',
    description: '든든한 분식 메뉴와 논알콜 음료도 준비했습니다.',
    location: '간호대학 입구',
    waitTeams: 10,
    availableSeats: 0,
    totalSeats: 25,
    popularity: 78,
    menu: ['치즈 떡볶이', '김말이', '주먹밥'],
    mapPosition: { left: '71%', top: '31%' },
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
    answer: '혼잡 방지를 위해 한 번에 한 주막만 등록할 수 있습니다.',
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
