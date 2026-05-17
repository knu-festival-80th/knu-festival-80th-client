import step1Bg from '@/assets/instating/stepCard/step1_bg.webp';
import step1Illust from '@/assets/instating/stepCard/step1_illust.webp';
import step2Bg from '@/assets/instating/stepCard/step2_bg.webp';
import step2Illust from '@/assets/instating/stepCard/step2_illust.webp';
import step3Bg from '@/assets/instating/stepCard/step3_bg.webp';
import step3Illust from '@/assets/instating/stepCard/step3_illust.webp';
import step4Bg from '@/assets/instating/stepCard/step4_bg.webp';
import step4Illust from '@/assets/instating/stepCard/step4_illust.webp';
import type { ReactNode } from 'react';

export type InstatingStep = {
  step: string;
  title: string;
  description: ReactNode;
  bgSrc: string;
  illustSrc: string;
};

export const INSTATING_STEPS: InstatingStep[] = [
  {
    step: '1단계',
    title: '매칭 신청하기',
    description: (
      <>
        <strong>오전 11시 ~ 오후 9시</strong>, 매칭을 신청하세요.
      </>
    ),
    bgSrc: step1Bg,
    illustSrc: step1Illust,
  },
  {
    step: '2단계',
    title: '밤 10시, 매칭 결과 공개',
    description: (
      <>
        <strong>밤 10시</strong>, 두근두근 당신의 매칭상대가 정해졌어요.
      </>
    ),
    bgSrc: step2Bg,
    illustSrc: step2Illust,
  },
  {
    step: '3단계',
    title: '매칭 상대 확인',
    description: (
      <>
        <strong>밤 10시 ~ 다음 날 11시</strong>, <br /> 복권을 긁어 설레는 결과를 확인하세요.
      </>
    ),
    bgSrc: step3Bg,
    illustSrc: step3Illust,
  },
  {
    step: '4단계',
    title: 'DM으로 먼저 말을 걸어보세요',
    description: (
      <>
        <strong>링크</strong>를 통해 상대방 프로필로 바로 이동할 수 있어요.
      </>
    ),
    bgSrc: step4Bg,
    illustSrc: step4Illust,
  },
];
