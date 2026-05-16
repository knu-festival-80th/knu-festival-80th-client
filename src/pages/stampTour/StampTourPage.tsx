import { GradientBanner } from '@/components/common/GradientBanner';
import StampTourContext from '@/components/stampTour/StampTourContext';

const StampTourPage = () => {
  return (
    <div>
      <GradientBanner title={'축제의\n스탬프 투어'} />
      <StampTourContext />
    </div>
  );
};

export default StampTourPage;
