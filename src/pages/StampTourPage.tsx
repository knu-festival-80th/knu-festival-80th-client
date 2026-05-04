import PageHero from '@/components/common/PageHero';
import StampTourContext from '@/components/stampTour/StampTourContext';

const StampTourPage = () => {
  return (
    <div>
      <PageHero
        title={
          <>
            대동제 <br /> 스탬프 투어
          </>
        }
      />
      <StampTourContext />
    </div>
  );
};

export default StampTourPage;
