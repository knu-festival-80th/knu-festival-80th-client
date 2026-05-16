import stampHero from '@/assets/stampTour/stampHero.webp';
import step1Bg from '@/assets/stampTour/step_1_bg.webp';
import step1Img from '@/assets/stampTour/step_1.webp';
import step2Bg from '@/assets/stampTour/step_2_bg.webp';
import step2Img from '@/assets/stampTour/step_2.webp';
import step3Bg from '@/assets/stampTour/step_3_bg.webp';
import step3Img from '@/assets/stampTour/step_3.webp';
import prizeStars from '@/assets/stampTour/prize_stars.webp';
import prize1 from '@/assets/stampTour/prize_1.webp';
import prize2 from '@/assets/stampTour/prize_2.webp';
import prize3 from '@/assets/stampTour/prize_3.webp';
import { useNavigate } from 'react-router-dom';
import OutlineButton from '@/components/common/OutlineButton';
import ProcessCard from '@/components/common/ProcessCard';

const steps = [
  {
    step: 'Step 1',
    title: '축제 구석구석 부스 방문하기',
    description: (
      <>
        축제 지도에 표시된 다양한 테마 부스를
        <br />
        탐방해 보세요. 축제 맵(Map)을 확인하면
        <br />더 효율적으로 이동할 수 있어요!
      </>
    ),
    bgSrc: step1Bg,
    illustSrc: step1Img,
  },
  {
    step: 'Step 2',
    title: '미션 수행하고 스탬프 받기',
    description:
      '총 16개의 부스에서 준비한 간단한 미션이나 퀴즈를 완료해 주세요. 미션 성공 시, 스탬프 북에 소중한 참여 인증 도장을 찍어드립니다.',
    bgSrc: step2Bg,
    illustSrc: step2Img,
  },
  {
    step: 'Step 3',
    title: '스탬프 모아 상품 응모하기',
    description:
      '모든 미션을 완료해 경품 응모권으로 교환하거나, 럭키 드로우에 참여할 기회를 잡으세요.',
    bgSrc: step3Bg,
    illustSrc: step3Img,
  },
];

const prizes = [
  { rank: '1위', name: '애플워치', imgSrc: prize1 },
  { rank: '2위', name: '신세계 상품권\n10만원', imgSrc: prize2 },
  { rank: '3위', name: '배달의 민족\n3만원', imgSrc: prize3 },
];

const StampTourContext = () => {
  const navigate = useNavigate();
  const goToBooths = () => navigate('/stamptour/booths');

  return (
    <section className="w-full bg-white">
      <div className="mx-auto flex w-full flex-col items-center gap-12 px-5 pb-[200px] pt-16">
        {/* Section header */}
        <div className="flex w-full flex-col gap-4 pt-8">
          <div className="flex flex-col gap-2.5">
            <p className="font-wanted-sans text-body1 font-bold tracking-tight text-ink">
              2026 Stamp Tour
            </p>
            <h2 className="font-wanted-sans text-subheading font-bold tracking-tight text-ink">
              2026 대동제 스탬프 투어
            </h2>
            <p className="font-wanted-sans text-body1 leading-[1.4] tracking-tight text-gray">
              부스 방문하고 스탬프를 모아보세요! <br />
              전용 스탬프를 모두 채우시면 대동제 기획팀이 준비한 특별한 선물을 드려요.
            </p>
          </div>
          <OutlineButton label="부스 위치 확인하기" showArrow variant="red" onClick={goToBooths} />
        </div>

        <img src={stampHero} alt="스탬프 투어 카드" className="w-[297px]" />

        {/* Step cards */}
        <ol className="flex w-full flex-col gap-[30px]">
          {steps.map((s) => (
            <li key={s.step}>
              <ProcessCard {...s} />
            </li>
          ))}
        </ol>

        {/* Prizes */}
        <div className="flex w-full flex-col gap-12">
          <div className="flex flex-col gap-2.5">
            <p className="font-wanted-sans text-body1 font-bold tracking-tight text-ink">
              Stamp Prizes
            </p>
            <h2 className="font-wanted-sans text-subheading font-bold tracking-tight text-ink">
              2026 대동제가 준비한 상품
            </h2>
          </div>
          <ul className="flex flex-col gap-8">
            {prizes.map(({ rank, name, imgSrc }) => (
              <li
                key={rank}
                className="flex h-[196px] items-end justify-center gap-[30px] rounded-lg bg-[rgba(255,61,61,0.03)] px-[30px] py-5"
              >
                <div className="flex shrink-0 flex-col items-center justify-between self-stretch py-2.5">
                  <div className="flex w-full flex-col items-center">
                    <div className="-mb-[5px] h-[37px] w-[80px] shrink-0">
                      <img
                        src={prizeStars}
                        alt=""
                        aria-hidden
                        className="pointer-events-none size-full object-bottom"
                      />
                    </div>
                    <p className="font-wanted-sans text-[16px] font-bold leading-none tracking-tight text-[#da131c] whitespace-nowrap">
                      {rank}
                    </p>
                  </div>
                  <div className="flex flex-[1_0_0] flex-col justify-center">
                    <p className="text-center font-wanted-sans text-[24px] font-bold leading-none tracking-tight text-ink whitespace-pre-line">
                      {name}
                    </p>
                  </div>
                </div>
                <img
                  src={imgSrc}
                  alt={name.replace('\n', ' ')}
                  className="shrink-0 size-[156px] object-contain"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default StampTourContext;
