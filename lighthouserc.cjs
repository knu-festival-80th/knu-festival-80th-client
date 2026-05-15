const BASE_URL = process.env.LHCI_BASE_URL || 'https://chcse.knu.ac.kr/festival';

const PATHS = [
  '/',
  '/map',
  '/timetable',
  '/goods',
  '/stamptour',
  '/stamptour/booths',
  '/hobanustagram',
  '/instating',
  '/instating/apply',
  '/instating/result',
  '/congrat-video',
  '/rolling-paper',
  '/rolling-paper/categories',
  '/rolling-paper/board',
];

module.exports = {
  ci: {
    collect: {
      url: PATHS.map((p) => `${BASE_URL}${p}`),
      numberOfRuns: 1,
      settings: {
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 3,
          disabled: false,
        },
      },
    },
  },
};
