import type { CSSProperties } from 'react';
import frame1Url from '@/assets/hobanustagram/twoframephoto_frame1.webp?url';
import frame2Url from '@/assets/hobanustagram/twoframephoto_frame2.webp?url';
import preview1Url from '@/assets/hobanustagram/twoframephoto_preview1.webp?url';
import preview2Url from '@/assets/hobanustagram/twoframephoto_preview2.webp?url';

export const TWO_SHOT_FRAME_URLS: Record<1 | 2, string> = { 1: frame1Url, 2: frame2Url };
export const TWO_SHOT_PREVIEW_URLS: Record<1 | 2, string> = { 1: preview1Url, 2: preview2Url };

export const TWO_SHOT_PHOTO_SLOTS: Record<1 | 2, [CSSProperties, CSSProperties]> = {
  1: [
    { left: '9.1%', top: '8.4%', width: '81.6%', height: '35.6%' },
    { left: '9.5%', top: '46.1%', width: '81.8%', height: '35.2%' },
  ],
  2: [
    { left: '8.89%', top: '9%', width: '82.22%', height: '34.69%' },
    { left: '8.89%', top: '46.19%', width: '82.22%', height: '34.69%' },
  ],
};
