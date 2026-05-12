import { GradientBanner } from '@/components/common/GradientBanner';
import ApplicantsNumberSection from '@/components/instating/intro/ApplicantsNumberSection';
import CountDownSection from '@/components/instating/intro/CountDownSection';
import InstaTingContent from '@/components/instating/intro/InstaTingContent';

const InstaTingIntroView = () => {
  return (
    <>
      <GradientBanner title="두근두근 인스타팅" />
      <CountDownSection />
      <ApplicantsNumberSection />
      <InstaTingContent />
    </>
  );
};

export default InstaTingIntroView;
