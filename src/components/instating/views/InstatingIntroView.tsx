import { GradientBanner } from '@/components/common/GradientBanner';
import ApplicantsNumberSection from '@/components/instating/intro/ApplicantsNumberSection';
import CountDownSection from '@/components/instating/intro/CountDownSection';
import InstatingContent from '../intro/InstatingContent';

const InstatingIntroView = () => {
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
