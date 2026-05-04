const PUBLIC_API_PREFIX = '/api/v1';
const ADMIN_AUTH_PREFIX = '/admin/v1/auth';
const ADMIN_SUPER_PREFIX = '/admin/v1/super';
const ADMIN_BOOTH_PREFIX = '/admin/v1/booth';

export const ENDPOINTS = {
  health: `${PUBLIC_API_PREFIX}/health`,

  auth: {
    login: `${ADMIN_AUTH_PREFIX}/login`,
    logout: `${ADMIN_AUTH_PREFIX}/logout`,
  },

  super: {
    booths: `${ADMIN_SUPER_PREFIX}/booths`,
    boothById: (boothId: number) => `${ADMIN_SUPER_PREFIX}/booths/${boothId}`,
    boothPassword: (boothId: number) => `${ADMIN_SUPER_PREFIX}/booths/${boothId}/password`,
  },

  booth: {
    booths: `${ADMIN_BOOTH_PREFIX}/booths`,
    boothById: (boothId: number) => `${ADMIN_BOOTH_PREFIX}/booths/${boothId}`,
    menus: (boothId: number) => `${ADMIN_BOOTH_PREFIX}/booths/${boothId}/menus`,
    menuById: (boothId: number, menuId: number) =>
      `${ADMIN_BOOTH_PREFIX}/booths/${boothId}/menus/${menuId}`,
    menuSoldOut: (boothId: number, menuId: number) =>
      `${ADMIN_BOOTH_PREFIX}/booths/${boothId}/menus/${menuId}/sold-out`,
    waitings: (boothId: number) => `${ADMIN_BOOTH_PREFIX}/booths/${boothId}/waitings`,
    waitingInsert: (boothId: number) => `${ADMIN_BOOTH_PREFIX}/booths/${boothId}/waitings/insert`,
    waitingToggle: (boothId: number) => `${ADMIN_BOOTH_PREFIX}/booths/${boothId}/waitings/toggle`,
    waitingCall: (waitingId: number) => `${ADMIN_BOOTH_PREFIX}/waitings/${waitingId}/call`,
    waitingEnter: (waitingId: number) => `${ADMIN_BOOTH_PREFIX}/waitings/${waitingId}/enter`,
    waitingCancel: (waitingId: number) => `${ADMIN_BOOTH_PREFIX}/waitings/${waitingId}/cancel`,
    waitingSkip: (waitingId: number) => `${ADMIN_BOOTH_PREFIX}/waitings/${waitingId}/skip`,
    waitingReorder: (waitingId: number) => `${ADMIN_BOOTH_PREFIX}/waitings/${waitingId}/reorder`,
    waitingResendSms: (waitingId: number) =>
      `${ADMIN_BOOTH_PREFIX}/waitings/${waitingId}/resend-sms`,
  },
} as const;
