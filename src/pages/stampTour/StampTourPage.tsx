import { GradientBanner } from '@/components/common/GradientBanner';
import StampTourContext from '@/components/stampTour/StampTourContext';

const StampTourPage = () => {
  return (
    <div>
      <GradientBanner title="대동제 스탬프 투어" />
      <StampTourContext />
    </div>
  );
};

export default StampTourPage;
