import stampHero from '@/assets/stampTour/stampHero.webp';
import prizeStars from '@/assets/stampTour/prize_stars.webp';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import OutlineButton from '@/components/common/OutlineButton';
import ProcessCard from '@/components/common/ProcessCard';
import { fadeUpVariant } from '@/constants/animation';
import { STAMP_TOUR_STEPS, STAMP_TOUR_PRIZES } from '@/constants/stampTour';

const StampTourContext = () => {
  const navigate = useNavigate();
  const goToBooths = () => navigate('/stamptour/booths');

  return (
    <section className="w-full bg-white">
      <div className="mx-auto flex w-full flex-col items-center gap-12 px-5 pb-[200px] pt-16">
        {/* Section header */}
        <motion.div className="flex w-full flex-col gap-4 pt-8" {...fadeUpVariant}>
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
        </motion.div>

        <motion.img
          src={stampHero}
          alt="스탬프 투어 카드"
          fetchPriority="high"
          width={297}
          height={245}
          className="w-[297px]"
          {...fadeUpVariant}
        />

        {/* Step cards */}
        <motion.ol className="flex w-full flex-col gap-[30px]" {...fadeUpVariant}>
          {STAMP_TOUR_STEPS.map((s) => (
            <li key={s.step}>
              <ProcessCard {...s} />
            </li>
          ))}
        </motion.ol>

        {/* Prizes */}
        <motion.div className="flex w-full flex-col gap-12" {...fadeUpVariant}>
          <div className="flex flex-col gap-2.5">
            <p className="font-wanted-sans text-body1 font-bold tracking-tight text-ink">
              Stamp Prizes
            </p>
            <h2 className="font-wanted-sans text-subheading font-bold tracking-tight text-ink">
              2026 대동제가 준비한 상품
            </h2>
          </div>
          <ul className="flex flex-col gap-8">
            {STAMP_TOUR_PRIZES.map(({ rank, name, imgSrc }) => (
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
                        loading="lazy"
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
                  loading="lazy"
                  className="shrink-0 size-[156px] object-contain"
                />
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default StampTourContext;
