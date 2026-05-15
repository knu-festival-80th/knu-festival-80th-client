import sloganBack from '@/assets/goods/slogan_back.webp';
import sloganFront from '@/assets/goods/slogan_front.webp';
import tattoo2 from '@/assets/goods/tattoosticker_2.webp';
import uniform1Back from '@/assets/goods/uniform1_back.webp';
import uniform1Front from '@/assets/goods/uniform1_front.webp';
import uniform2Back from '@/assets/goods/uniform2_back.webp';
import uniform2Front from '@/assets/goods/uniform2_front.webp';
import uniform3Back from '@/assets/goods/uniform3_back.webp';
import uniform3Front from '@/assets/goods/uniform3_front.webp';

import type { GoodsItem } from '@/types/goods';

export const POPULAR_GOODS: GoodsItem[] = [
  {
    id: 1,
    name: '축구 유니폼 1',
    description: '2026 대동제 공식 유니폼',
    images: [uniform1Front, uniform1Back],
  },
  {
    id: 2,
    name: '축구유니폼 2',
    description: '2026 대동제 공식 유니폼',
    images: [uniform2Front, uniform2Back],
  },
  {
    id: 3,
    name: '응원 수건',
    description: '2026 대동제 응원 수건 굿즈',
    images: [sloganFront, sloganBack],
  },
  { id: 4, name: '타투스티커', description: '2026 대동제 타투스티커', images: [tattoo2] },
];

export const ALL_GOODS: GoodsItem[] = [
  {
    id: 1,
    name: '축구 유니폼 1',
    description: '2026 대동제 공식 유니폼',
    images: [uniform1Front, uniform1Back],
  },
  {
    id: 2,
    name: '축구 유니폼 2',
    description: '2026 대동제 공식 유니폼',
    images: [uniform2Front, uniform2Back],
  },
  {
    id: 3,
    name: '야구 유니폼 3',
    description: '2026 대동제 공식 유니폼',
    images: [uniform3Front, uniform3Back],
  },
  {
    id: 4,
    name: '응원 수건',
    description: '2026 대동제 응원 수건 굿즈',
    images: [sloganFront, sloganBack],
  },
  { id: 5, name: '타투스티커', description: '2026 대동제 타투스티커', images: [tattoo2] },
];
