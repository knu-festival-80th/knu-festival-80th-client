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
    question: '웹 포토부스는 어떻게 이용하나요?',
    answer:
      '포토부스 탭에서 카메라를 실행하거나 사진을 업로드한 후, 원하는 프레임과 스티커를 선택해 꾸밀 수 있어요. 완성된 사진은 다운로드하거나 SNS에 바로 공유할 수 있습니다.',
  },
  {
    question: '호반우 필터는 무엇인가요?',
    answer:
      '경북대학교 마스코트 호반우를 활용한 특별 AR 필터예요. 포토부스에서 사진 촬영 시 적용할 수 있습니다.',
  },
  {
    question: '촬영한 사진은 어디서 확인할 수 있나요?',
    answer:
      '피드 탭에서 본인이 업로드한 사진과 다른 사람들의 사진을 실시간으로 감상할 수 있어요. 마음에 드는 사진에 좋아요도 남길 수 있습니다.',
  },
  {
    question: '사진 업로드 시 개인정보는 안전한가요?',
    answer: '업로드된 사진은 축제 기간 동안만 보관되며, 축제 종료 후 안전하게 삭제됩니다.',
  },
  {
    question: '포토부스 이용에 제한이 있나요?',
    answer: '누구나 무료로 이용할 수 있어요. 단, 부적절한 이미지 업로드는 제한될 수 있습니다.',
  },
];
