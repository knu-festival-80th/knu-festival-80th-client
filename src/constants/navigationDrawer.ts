import type { NavItem, NavSection } from '@/types/navigationDrawer';

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'grand-moment',
    label: 'THE GRAND MOMENT 80주년',
    children: [
      { label: '80주년 롤링페이퍼', to: '/rolling-paper' },
      { label: '축전 영상', to: '/congrat-video' },
      { label: '경북대학교 80주년', to: '/congrat-video' },
    ],
  },
  {
    id: 'map-info',
    label: '지도 및 주막 정보',
    children: [
      { label: '소개', to: '/map?tab=intro' },
      { label: '지도', to: '/map' },
      { label: '주막 목록', to: '/taverns' },
      { label: '예약 조회', to: '/taverns?tab=reservation' },
    ],
  },
  {
    id: 'instating',
    label: '두근두근 인스타팅',
    children: [
      { label: '소개', to: '/instating' },
      { label: '예약 조회', to: '/instating/result' },
    ],
  },
  {
    id: 'event',
    label: '이벤트',
    children: [
      { label: '축제의 스탬프 투어', to: '/stamptour' },
      { label: '호반우스타그램', to: '/hobanustagram' },
      { label: '축제 굿즈', to: '/goods' },
    ],
  },
];

export const FIRST_SECTION_ID = (
  NAV_ITEMS.find((item): item is NavSection => 'children' in item) ?? { id: '' }
).id;

export const ALL_SECTION_IDS = NAV_ITEMS.filter(
  (item): item is NavSection => 'children' in item,
).map((item) => item.id);
