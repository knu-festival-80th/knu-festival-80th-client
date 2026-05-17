import { GradientBanner } from '@/components/common/GradientBanner';
import StampTourContext from '@/components/stampTour/StampTourContext';

const StampTourIntroView = () => {
  return (
    <div>
      <GradientBanner title={'대동제\n스탬프 투어'} />
      <StampTourContext />
    </div>
  );
};

export default StampTourIntroView;
