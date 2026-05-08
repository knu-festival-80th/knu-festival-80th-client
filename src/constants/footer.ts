// TODO: 페이지 확정 후 각 경로 연결
export const NAV_LINKS = [
  { label: '지도 정보', to: '/map' },
  { label: '롤링페이퍼', to: '/rolling-paper' },
  { label: '인스타팅', to: '/' },
  { label: '포토부스', to: '/' },
  { label: '공지사항', to: '/' },
] as const;

// TODO: 페이지 확정 후 각 경로 연결
export const FOOTER_LINKS = [
  { label: '개인정보 보호', to: '/' },
  { label: '서비스 이용 약관', to: '/' },
  { label: '쿠키 설정', to: '/' },
] as const;
