import type { FaqItem } from '@/components/common/FaqAccordion';
import hobanuImg from '@/assets/hobanustagram/hobanu.webp';
import smileHobanuImg from '@/assets/hobanustagram/smile_hobanu.webp';
import smileHobanuInclineImg from '@/assets/hobanustagram/smile_hobanu_incline.webp';
import type { CharacterKey, OverlayStyle } from '@/types/hobanustagram';

export const CHARACTER_LIST: {
  key: CharacterKey;
  src: string;
  label: string;
  overlayStyle: OverlayStyle;
  mirrorOverlayStyle?: OverlayStyle;
}[] = [
  {
    key: 'hobanu',
    src: hobanuImg,
    label: '기본',
    overlayStyle: { left: '8.3%', top: '38%', width: '83.7%' },
    mirrorOverlayStyle: { right: '8.3%', top: '38%', width: '83.7%' },
  },
  {
    key: 'smile_hobanu',
    src: smileHobanuImg,
    label: '웃는',
    overlayStyle: { left: '6.0%', top: '41%', width: '83.7%' },
    mirrorOverlayStyle: { right: '10.0%', top: '41%', width: '83.7%' },
  },
  {
    key: 'smile_hobanu_incline',
    src: smileHobanuInclineImg,
    label: '기울어진',
    overlayStyle: {
      left: '-27%',
      bottom: 'calc(6rem - 36vw)',
      width: '83.7%',
      transform: 'rotate(21.5deg)',
    },
    mirrorOverlayStyle: {
      left: '-27%',
      bottom: 'calc(6rem - 36vw)',
      width: '83.7%',
      transform: 'rotate(21.5deg)',
    },
  },
];

export const hobanustagramFaqItems: FaqItem[] = [
  {
    question: 'Q1. 호반우스타그램이 무엇인가요?',
    answer:
      '호반우스타그램은 경북대학교 마스코트 호반우를 테마로 한 포토부스 이벤트입니다. 귀여운 호반우 프레임과 필터로 추억을 남겨보세요! 🐮',
  },
  {
    question: 'Q2. 어떤 포토 기능을 이용할 수 있나요?',
    answer:
      '두 가지 기능을 제공합니다. 호반우 테마 프레임 2종으로 인생두컷을 찍을 수 있고, 호반우 AR 필터 3종도 이용하실 수 있습니다.',
  },
  {
    question: 'Q3. 촬영한 사진은 저장하거나 공유할 수 있나요?',
    answer: '촬영한 사진은 내 기기에 저장하거나 SNS로 바로 공유할 수 있습니다.',
  },
  {
    question: 'Q4. 사진 촬영 시 개인정보는 안전한가요?',
    answer:
      '촬영한 사진은 서버에 저장되거나 전송되지 않으며, 본인 기기에만 저장됩니다. 안심하고 이용해 주세요!',
  },
];
