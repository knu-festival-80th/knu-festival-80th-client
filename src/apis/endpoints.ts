// 모든 path 는 root(/) 기준으로 작성한다.
// 환경별 host/prefix 는 axios baseURL(=VITE_API_BASE_URL)이 결정한다.
// - dev:  http://localhost:8080
// - prod: https://chcse.knu.ac.kr/festival/api  (학교 ingress 가 /festival/api 를 strip 후 백엔드 root 로 전달)

export const ENDPOINTS = {
  health: '/health',

  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
  },

  // 공개 API (인증 불필요)
  booths: {
    list: '/booths',
    detail: (boothId: number) => `/booths/${boothId}`,
    map: '/booths/map',
    likes: (boothId: number) => `/booths/${boothId}/likes`,
    waitingStatus: (boothId: number) => `/booths/${boothId}/waitings/status`,
    registerWaiting: (boothId: number) => `/booths/${boothId}/waitings`,
  },
  waitings: {
    detail: (waitingId: number) => `/waitings/${waitingId}`,
  },

  // 관리자 API (세션 쿠키 필요)
  admin: {
    booths: '/admin/booths',
    boothById: (boothId: number) => `/admin/booths/${boothId}`,
    boothPassword: (boothId: number) => `/admin/booths/${boothId}/password`,
    menus: (boothId: number) => `/admin/booths/${boothId}/menus`,
    menuById: (boothId: number, menuId: number) => `/admin/booths/${boothId}/menus/${menuId}`,
    menuSoldOut: (boothId: number, menuId: number) =>
      `/admin/booths/${boothId}/menus/${menuId}/sold-out`,
    waitings: (boothId: number) => `/admin/booths/${boothId}/waitings`,
    waitingInsert: (boothId: number) => `/admin/booths/${boothId}/waitings/insert`,
    waitingToggle: (boothId: number) => `/admin/booths/${boothId}/waitings/toggle`,
    waitingCall: (waitingId: number) => `/admin/waitings/${waitingId}/call`,
    waitingEnter: (waitingId: number) => `/admin/waitings/${waitingId}/enter`,
    waitingCancel: (waitingId: number) => `/admin/waitings/${waitingId}/cancel`,
    waitingSkip: (waitingId: number) => `/admin/waitings/${waitingId}/skip`,
    waitingReorder: (waitingId: number) => `/admin/waitings/${waitingId}/reorder`,
    waitingResendSms: (waitingId: number) => `/admin/waitings/${waitingId}/resend-sms`,
  },
} as const;
