import type { DayLineup } from '@/types/home';
import kwoneunbi from '@/assets/lineup/권은비.webp';
import nctWish from '@/assets/lineup/NCT위시.webp';
import aichillin from '@/assets/lineup/아이칠린.webp';
import zico from '@/assets/lineup/지코.webp';
import sunmi from '@/assets/lineup/선미.webp';
import leeyoungji from '@/assets/lineup/이영지.webp';
import ambio from '@/assets/lineup/AMbiO.webp';

export const MOCK_LINEUP: DayLineup[] = [
  {
    day: 20,
    artists: [],
    schedules: [
      { name: '무대 관객 입장', startTime: '18:00', endTime: '18:30' },
      { name: '오프닝 공연', startTime: '18:30', endTime: '19:30' },
      { name: '메인 공연', startTime: '19:30', endTime: '22:00' },
    ],
  },
  {
    day: 21,
    artists: [
      { src: ambio, alt: 'AMbiO' },
      { src: nctWish, alt: 'NCT WISH' },
      { src: kwoneunbi, alt: '권은비' },
    ],
    schedules: [
      { name: 'KNU 가요제\n및 시상식', startTime: '18:30', endTime: '19:30' },
      { name: '개회식', startTime: '19:30', endTime: '19:50' },
      { name: '드론쇼', startTime: '19:50', endTime: '20:00' },
      {
        name: "DJ와 함께하는\n워터파티\n'도미노보이즈,\n할리퀸'",
        startTime: '20:00',
        endTime: '21:00',
      },
      { name: "축하공연\n'AMbiO'", startTime: '21:00', endTime: '21:30' },
      { name: "축하공연\n'NCT WISH'", startTime: '21:30', endTime: '22:00' },
      { name: "축하공연\n'권은비'", startTime: '22:00', endTime: '22:30' },
    ],
  },
  {
    day: 22,
    artists: [
      { src: zico, alt: '지코' },
      { src: aichillin, alt: '아이칠린' },
      { src: sunmi, alt: '선미' },
      { src: leeyoungji, alt: '이영지' },
    ],
    schedules: [
      { name: '동아리 공연', startTime: '18:30', endTime: '19:30' },
      { name: "축하공연\n'지코'", startTime: '19:30', endTime: '20:00' },
      { name: "축하공연\n'아이칠린'", startTime: '20:00', endTime: '20:30' },
      { name: '불꽃쇼', startTime: '20:30', endTime: '20:40' },
      { name: "축하공연\n'선미'", startTime: '20:40', endTime: '21:10' },
      { name: "축하공연\n'이영지'", startTime: '21:10', endTime: '21:40' },
    ],
  },
];
