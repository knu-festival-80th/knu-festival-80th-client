import BoothCard from '@/components/stampTour/BoothCard';
import mapImage from '@/assets/stampTour/mapImage.svg';

const StampBoothListPage = () => {
  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          'linear-gradient(to bottom, rgba(255,218,61,0.3) 0%, rgba(255,141,101,0.3) 49%, rgba(255,61,144,0.3) 100%)',
      }}
    >
      <div className="mx-auto flex w-full max-w-[375px] flex-col gap-[30px] px-5 pb-32 pt-7">
        <p className="font-wanted-sans text-subheading font-bold tracking-tight text-ink">
          부스 목록
        </p>

        <BoothCard
          variant="expanded"
          zone="ZONE 1"
          name="~부스"
          description="'하푸르나: 첨성'의 상징을 담은 공식 굿즈 판매 & 수령존과 이번 축제 드레스코드 인증 이벤트가 패션 플래닛에서 여러분을 기다립니다."
          location="벛꽃 로드"
          time="13:00~18:00"
          target="경북대학교 재적생 및 방문자"
          imageSrc={mapImage}
          imageAlt="부스 지도"
        />

        {Array.from({ length: 12 }).map((_, i) => (
          <BoothCard
            key={i}
            zone="ZONE 2"
            name="~부스"
            description="'하푸르나: 첨성'의 상징을 담은 공식 굿즈 판매 & 수령존과 이번 축제 드레스코드 인증 이벤트가 패션 플래닛에서 여러분을 기다립니다."
            onDetailClick={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default StampBoothListPage;
