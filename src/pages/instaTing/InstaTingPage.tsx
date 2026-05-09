import { GradientBanner } from '@/components/common/GradientBanner';
import ApplicantsNumberSection from '@/components/instating/ApplicantsNumberSection';
import CountDownSection from '@/components/instating/CountDownSection';
import InstaTingContent from '@/components/instating/InstaTingContent';

const InstaTingPage = () => {
  return (
    <>
      <GradientBanner title="두근두근 인스타팅" />
      <CountDownSection />
      <ApplicantsNumberSection />
      <InstaTingContent />
    </>
  );
};

export default InstaTingPage;
