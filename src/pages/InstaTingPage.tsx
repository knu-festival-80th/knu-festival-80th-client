import { GradientBanner } from '@/components/common/GradientBanner';
import ApplicantsSection from '@/components/instating/ApplicantsSection';
import CountDownSection from '@/components/instating/CountDownSection';
import InstaTingContent from '@/components/instating/InstaTingContent';

const InstaTingPage = () => {
  return (
    <>
      <GradientBanner title="두근두근 인스타팅" />
      <CountDownSection />
      <ApplicantsSection maleCount={200} femaleCount={100} />
      <InstaTingContent />
    </>
  );
};

export default InstaTingPage;
