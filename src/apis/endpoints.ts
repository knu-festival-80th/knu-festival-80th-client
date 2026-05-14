export const ENDPOINTS = {
  health: '/health',

  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
  },

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
    my: '/waitings/my',
  },

  matchings: {
    register: '/matchings',
    result: '/matchings/result',
    status: '/matchings/status',
    applicantsCount: '/matchings/applicants/count',
    unmatched: '/matchings/unmatched',
  },

  canvas: {
    questions: '/canvas/questions',
    boards: '/canvas/boards',
    postits: '/canvas/postits',
  },

  admin: {
    uploadImage: '/admin/uploads/images',
    booths: '/admin/booths',
    boothById: (boothId: number) => `/admin/booths/${boothId}`,
    boothPassword: (boothId: number) => `/admin/booths/${boothId}/password`,
    waitings: (boothId: number) => `/admin/booths/${boothId}/waitings`,
    waitingInsert: (boothId: number) => `/admin/booths/${boothId}/waitings/insert`,
    waitingToggle: (boothId: number) => `/admin/booths/${boothId}/waitings/toggle`,
    waitingCall: (waitingId: number) => `/admin/waitings/${waitingId}/call`,
    waitingEnter: (waitingId: number) => `/admin/waitings/${waitingId}/enter`,
    waitingCancel: (waitingId: number) => `/admin/waitings/${waitingId}/cancel`,
    waitingSkip: (waitingId: number) => `/admin/waitings/${waitingId}/skip`,
    waitingReorder: (waitingId: number) => `/admin/waitings/${waitingId}/reorder`,
    waitingResendSms: (waitingId: number) => `/admin/waitings/${waitingId}/resend-sms`,

    matchingStatus: '/admin/matchings/status',
    matchingJobs: '/admin/matchings/jobs',
    matchingJobForDay: (festivalDay: string) => `/admin/matchings/jobs/${festivalDay}`,
    matchingParticipants: '/admin/matchings/participants',
    matchingParticipantById: (participantId: number) =>
      `/admin/matchings/participants/${participantId}`,
    matchingParticipantReset: (participantId: number) =>
      `/admin/matchings/participants/${participantId}/reset`,

    canvas: {
      boards: '/admin/canvas/boards',
      postitById: (postitId: number) => `/admin/canvas/postits/${postitId}`,
    },
  },
} as const;
