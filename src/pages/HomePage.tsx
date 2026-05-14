import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import heroBg from '@/assets/home/hero-bg.png';
import cardBg1 from '@/assets/home/card-bg-1.png';
import cardBg2 from '@/assets/home/card-bg-2.png';
import cardBg3 from '@/assets/home/card-bg-3.png';
import illustStemp from '@/assets/home/illust-stemp.png';
import illustGoods from '@/assets/home/illust-goods.png';
import illustMap from '@/assets/home/illust-map.png';
import illustBooth from '@/assets/home/illust-booth.png';
import illustRolling from '@/assets/home/illust-rolling.png';
import illustInstaing from '@/assets/home/illust-instaing.png';
import illustPhotobooth from '@/assets/home/illust-photobooth.png';
import CountdownTimer from '@/components/home/CountdownTimer';
import ContentCard from '@/components/home/ContentCard';
import GlassCircleButton from '@/components/home/GlassCircleButton';
import SectionBlock from '@/components/home/SectionBlock';
import TodayLineup from '@/components/home/TodayLineup';
import { FaqAccordion } from '@/components/common/FaqAccordion';
import { ContactSection } from '@/components/common/ContactSection';
import { MOCK_LINEUP } from '@/mocks/home';
import { MOCK_FAQ } from '@/mocks/faq';

export default function HomePage() {
  const countdownRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col pb-16">
      <section className="relative flex min-h-dvh flex-col pb-25 pt-20">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <img
            src={heroBg}
            alt=""
            className="absolute inset-0 size-full max-w-none object-bottom"
          />
          <div
            className="absolute inset-0 mix-blend-lighten"
            style={{
              backgroundImage:
                'linear-gradient(180deg, #ff4242 0%, #ffaf55 22.115%, #ff4242 44.712%, #ff4242 100%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.2)] to-transparent mix-blend-soft-light" />
        </div>
        <div className="relative flex flex-1 flex-col justify-end px-5">
          <h1 className="text-hero text-ink">
            THE
            <br />
            GRAND
            <br />
            MOMENT
            <br />
            80TH
          </h1>
          <p className="mt-4 text-body1 font-bold text-ink">위대한 순간, 경북대 80주년</p>
          <p className="mt-1 text-body2 text-ink opacity-60">
            2026 경북대학교 대동제를 함께하세요.
          </p>
        </div>
        <motion.div
          className="relative mt-10 flex justify-center"
          animate={{ y: [10, 0, 10] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <GlassCircleButton
            icon={<ArrowDown className="size-6 text-ink" />}
            onClick={() => countdownRef.current?.scrollIntoView({ behavior: 'smooth' })}
          />
        </motion.div>
      </section>

      <div className="pt-16 flex flex-col gap-32 bg-background overflow-x-hidden">
        <div ref={countdownRef}>
          <SectionBlock label="Count Down" title="축제까지 남은 시간">
            <div className="px-5">
              <CountdownTimer />
            </div>
          </SectionBlock>
        </div>

        <SectionBlock label="Festival Start" title="대동제의 주요 콘텐츠 확인하기">
          <div className="px-5">
            <ContentCard
              category="Stamp"
              title={`부스를 방문하고 스탬프를 모아\n상품을 응모하세요`}
              imageSrc={cardBg1}
              illustrationSrc={illustStemp}
              to="/stamptour"
            />
          </div>
          <div className="px-5">
            <ContentCard
              category="Goods"
              title={`2026 대동제만의\n특별한 굿즈를 만나보세요`}
              imageSrc={cardBg1}
              illustrationSrc={illustGoods}
              illustrationClassName="scale-115"
              to="/goods"
            />
          </div>
        </SectionBlock>

        <SectionBlock
          label="Time Table"
          title="올해 대동제를 빛내줄 축제 공연"
          viewAllTo="/timetable"
        >
          <TodayLineup data={MOCK_LINEUP} />
        </SectionBlock>

        <SectionBlock label="Festival Start" title="대동제의 주요 콘텐츠 확인하기">
          <div className="px-5">
            <ContentCard
              category="Map"
              title={`캠퍼스 지도에서\n이벤트 부스와 주막 위치를 확인하기`}
              imageSrc={cardBg2}
              illustrationSrc={illustMap}
              illustrationClassName="scale-110"
              to="/map"
            />
          </div>
          <div className="px-5">
            <ContentCard
              category="Festival booth"
              title="원하는 주막에 실시간 대기 등록하기"
              imageSrc={cardBg1}
              illustrationSrc={illustBooth}
              illustrationClassName="top-7 scale-120"
              to="/taverns"
            />
          </div>
        </SectionBlock>

        <SectionBlock label="Event" title="올해만 진행되는 2026 대동제 이벤트">
          <div className="px-5">
            <ContentCard
              category="Memory Board"
              title="80주년 롤링페이퍼"
              description={`수천 명의 축제 참여자들과 함께\n추억 기록하기`}
              imageSrc={cardBg2}
              illustrationSrc={illustRolling}
              illustrationClassName="top-5 scale-120"
              to="/rolling-paper"
            />
          </div>

          <div className="px-5">
            <ContentCard
              category="Insta date"
              title="두근두근 인스타팅"
              description="축제에서 만날 특별한 사람 매칭하기"
              imageSrc={cardBg1}
              illustrationSrc={illustInstaing}
              to="/instating"
            />
          </div>

          <div className="px-5">
            <ContentCard
              category="Photo Booth"
              title="호반우스타그램"
              description="80주년 만의 카메라 필터로 특별한 추억 만들기"
              imageSrc={cardBg3}
              illustrationSrc={illustPhotobooth}
              illustrationClassName="top-3"
              to="/hobanustagram"
            />
          </div>
        </SectionBlock>

        <FaqAccordion items={MOCK_FAQ} />
        <ContactSection />
      </div>
    </div>
  );
}
