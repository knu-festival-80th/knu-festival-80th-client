import type { DayLineup } from '@/types/home';

export const MOCK_LINEUP: DayLineup[] = [
  {
    day: 20,
    artists: [
      { src: 'https://picsum.photos/seed/artist1/312/312', alt: '아티스트 1' },
      { src: 'https://picsum.photos/seed/artist2/312/312', alt: '아티스트 2' },
      { src: 'https://picsum.photos/seed/artist3/312/312', alt: '아티스트 3' },
    ],
    schedules: [
      { name: '무대 관객 입장', startTime: '18:00', endTime: '18:30' },
      { name: '오프닝 공연', startTime: '18:30', endTime: '19:30' },
      { name: '메인 공연', startTime: '19:30', endTime: '22:00' },
    ],
  },
  {
    day: 21,
    artists: [
      { src: 'https://picsum.photos/seed/artist4/312/312', alt: '아티스트 4' },
      { src: 'https://picsum.photos/seed/artist5/312/312', alt: '아티스트 5' },
    ],
    schedules: [
      { name: '무대 관객 입장', startTime: '17:00', endTime: '17:30' },
      { name: '메인 공연', startTime: '18:00', endTime: '22:00' },
    ],
  },
  {
    day: 22,
    artists: [{ src: 'https://picsum.photos/seed/artist6/312/312', alt: '아티스트 6' }],
    schedules: [
      { name: '무대 관객 입장', startTime: '17:00', endTime: '17:30' },
      { name: '클로징 공연', startTime: '18:00', endTime: '21:00' },
    ],
  },
];
