import { ArrowDown } from 'lucide-react';
import CountdownTimer from '@/components/home/CountdownTimer';
import ContentCard from '@/components/home/ContentCard';
import GlassCircleButton from '@/components/home/GlassCircleButton';
import SectionBlock from '@/components/home/SectionBlock';
import TodayLineup from '@/components/home/TodayLineup';
import type { DayLineup } from '@/types/home';

const MOCK_LINEUP: DayLineup[] = [
  {
    day: 20,
    artists: [
      { src: 'https://picsum.photos/seed/artist1/312/312', alt: '아티스트 1' },
      { src: 'https://picsum.photos/seed/artist2/312/312', alt: '아티스트 2' },
      { src: 'https://picsum.photos/seed/artist3/312/312', alt: '아티스트 3' },
    ],
    schedules: [
      { name: '무대 관객 입장', startTime: '18:00', endTime: '18:30' },
      { name: '오프닝 공연', startTime: '18:30', endTime: '19:30' },
      { name: '메인 공연', startTime: '19:30', endTime: '22:00' },
    ],
  },
  {
    day: 21,
    artists: [
      { src: 'https://picsum.photos/seed/artist4/312/312', alt: '아티스트 4' },
      { src: 'https://picsum.photos/seed/artist5/312/312', alt: '아티스트 5' },
    ],
    schedules: [
      { name: '무대 관객 입장', startTime: '17:00', endTime: '17:30' },
      { name: '메인 공연', startTime: '18:00', endTime: '22:00' },
    ],
  },
  {
    day: 22,
    artists: [{ src: 'https://picsum.photos/seed/artist6/312/312', alt: '아티스트 6' }],
    schedules: [
      { name: '무대 관객 입장', startTime: '17:00', endTime: '17:30' },
      { name: '클로징 공연', startTime: '18:00', endTime: '21:00' },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col pb-16">
      <section
        className="flex min-h-dvh flex-col pb-10 pt-20"
        style={{
          background: 'linear-gradient(160deg, #ff4242 0%, #ffaf55 22%, #ff4242 45%)',
        }}
      >
        <div className="flex flex-1 flex-col justify-end px-5">
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
          <p className="mt-1 text-body2 text-ink opacity-50">
            2026 경북대학교 대동제 하푸르나를 함께하세요.
          </p>
        </div>
        <div className="mt-10 flex justify-center">
          <GlassCircleButton icon={<ArrowDown className="size-6 text-ink" />} />
        </div>
      </section>

      <div className="pt-16 flex flex-col gap-32 bg-background">
        <SectionBlock label="Count Down" title="축제까지 남은 시간">
          <div className="px-5">
            <CountdownTimer />
          </div>
        </SectionBlock>

        <SectionBlock
          label="Festival Start"
          title="대동제의 주요 콘텐츠 확인하기"
          viewAllTo="/popular"
        >
          <div className="px-5">
            <ContentCard
              category="Map"
              title="캠퍼스 지도에서 이벤트 부스와 주막 위치를 확인하기"
              to="/popular"
            />
          </div>
          <div className="px-5">
            <ContentCard
              category="Festival booth"
              title="원하는 주막에 실시간 대기 등록하기"
              to="/popular"
            />
          </div>
        </SectionBlock>

        <SectionBlock
          label="Time Table"
          title="올해 대동제를 빛내줄 축제 라인업 확인하기"
          viewAllTo="/timetable"
        >
          <TodayLineup data={MOCK_LINEUP} />
        </SectionBlock>

        <SectionBlock
          label="Popular"
          title="주막의 열기를 실시간으로 느껴보기"
          description={`축제를 즐기는 누구나\n인기 투표할 수 있는 실시간 주막 랭킹`}
          viewAllTo="/popular"
        >
          <div className="px-5">
            <ContentCard category="인기 주막" title="실시간 주막 랭킹 확인하기" to="/popular" />
          </div>
        </SectionBlock>

        <SectionBlock
          label="Event"
          title="올해만 진행되는 2026 하푸르나만의 혜택"
          viewAllTo="/popular"
        >
          <div className="px-5">
            <ContentCard category="Memory Board" title="80주년 롤링페이퍼" to="/popular" />
          </div>

          <div className="px-5">
            <ContentCard category="Insta date" title="두근두근 인스타팅" to="/popular" />
          </div>

          <div className="px-5">
            <ContentCard category="Photo Booth" title="포토부스" to="/popular" />
          </div>
        </SectionBlock>
      </div>
    </div>
  );
}
