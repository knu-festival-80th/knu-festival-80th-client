import step1Bg from '@/assets/instating/stepCard/step1_bg.webp';
import step1Illust from '@/assets/instating/stepCard/step1_illust.webp';
import step2Bg from '@/assets/instating/stepCard/step2_bg.webp';
import step2Illust from '@/assets/instating/stepCard/step2_illust.webp';
import step3Bg from '@/assets/instating/stepCard/step3_bg.webp';
import step3Illust from '@/assets/instating/stepCard/step3_illust.webp';
import step4Bg from '@/assets/instating/stepCard/step4_bg.webp';
import step4Illust from '@/assets/instating/stepCard/step4_illust.webp';
import type { FaqItem } from '@/components/common/FaqAccordion';
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

export const instatingFaqItems: FaqItem[] = [
  {
    question: 'Q1. 인스타팅이 무엇인가요?',
    answer:
      '두근두근 인스타팅은 대동제에서 진행하는 소개팅 이벤트입니다. 이름, 인스타그램 아이디, 전화번호를 입력해 신청하면, 마감 후 정해진 시간에 매칭된 상대방의 정보를 알려드립니다. 축제의 설렘을 함께 나눌 특별한 인연을 만들어보세요! ',
  },
  {
    question: 'Q2. 신청은 언제 할 수 있나요?',
    answer:
      '축제 기간 3일 동안 매일 오전 11시부터 21시까지 신청 가능합니다. 총 3번의 세션이 진행되니 놓치지 마세요!',
  },
  {
    question: 'Q3. 신청은 어떻게 하나요?',
    answer:
      '상단의 [인스타팅 신청하기] 탭에서 신청이 가능합니다. 이름, 인스타그램 아이디, 전화번호를 입력하면 신청이 완료됩니다.',
  },
  {
    question: 'Q4. 매칭 결과는 언제 알 수 있나요?',
    answer:
      '매일 신청 마감 후, 22시에 매칭 결과를 확인할 수 있습니다. 매칭 결과 확인은 당일 22시부터 다음 날 11시까지 가능합니다.',
  },
  {
    question: 'Q5. 매칭 결과는 어떻게 확인하나요?',
    answer:
      '매일 22시에 현재 웹사이트의 [두근두근 인스타팅 - 결과 조회] 페이지에서 확인할 수 있습니다. ',
  },
  {
    question: 'Q6. 성비 불균형이 발생하면 어떻게 되나요?',
    answer:
      '성비 불균형 발생 시, 신청자가 적은 성별의 인원 수에 맞춰 "선착순"으로 대상자가 제한(컷오프)된 후 최종 매칭이 진행됩니다.',
  },
  {
    question: 'Q7. 매칭이 안 될 수도 있나요?',
    answer:
      '성비 불균형으로 인해 컷오프가 적용될 경우 매칭 대상에서 제외될 수 있습니다. 다음 날 다시 신청해주세요!',
  },
];
