import { GradientBanner } from '@/components/common/GradientBanner';
import ApplicantsNumberSection from '@/components/instating/intro/ApplicantsNumberSection';
import CountDownSection from '@/components/instating/intro/CountDownSection';
import InstatingContent from '../intro/InstatingContent';

const InstatingIntroView = () => {
  // TODO: error boundary 체크(최종 배포 시 제거)
  // throw new Error('테스트');
  return (
    <>
      <GradientBanner title="두근두근 인스타팅" />
      <CountDownSection />
      <ApplicantsNumberSection />
      <InstatingContent />
    </>
  );
};

export default InstatingIntroView;
