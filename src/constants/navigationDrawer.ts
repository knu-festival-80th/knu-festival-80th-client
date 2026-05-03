import type { NavItem, NavSection } from '@/types/navigationDrawer';

// TODO: 페이지 확정 후 각 경로 연결
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'grand-moment',
    label: 'THE GRAND MOMENT 80주년',
    children: [
      { label: '경북대학교 80주년', to: '/' },
      { label: '80주년 롤링페이퍼', to: '/' },
    ],
  },
  {
    id: 'map-info',
    label: '지도 및 주막 정보',
    children: [
      { label: '소개', to: '/' },
      { label: '지도', to: '/' },
      { label: '주막 목록', to: '/' },
      { label: '예약 조회', to: '/' },
    ],
  },
  {
    id: 'instating',
    label: '두근두근 인스타팅',
    children: [
      { label: '소개', to: '/' },
      { label: '예약 조회', to: '/' },
    ],
  },
  {
    id: 'event',
    label: '이벤트',
    children: [
      { label: '호반우스타그램', to: '/' },
      { label: '축제의 스탬프 투어', to: '/' },
    ],
  },
];

export const FIRST_SECTION_ID = (
  NAV_ITEMS.find((item): item is NavSection => 'children' in item) ?? { id: '' }
).id;

export const ALL_SECTION_IDS = NAV_ITEMS.filter(
  (item): item is NavSection => 'children' in item,
).map((item) => item.id);
