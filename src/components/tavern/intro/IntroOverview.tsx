import { FiArrowRight, FiChevronDown } from 'react-icons/fi';

import mapIconImage from '@/assets/images/map-icon.png';
import reservationIconImage from '@/assets/images/reservation-icon.png';
import tavernGuideMapImage from '@/assets/images/tavern-guide-map.png';
import tavernGuideReservationImage from '@/assets/images/tavern-guide-reservation.png';
import tavernHeroBgImage from '@/assets/images/tavern-hero-bg.png';
import tavernMapImage from '@/assets/images/tavern-map.svg';
import ContentCard from '@/components/home/ContentCard';
import SectionBlock from '@/components/home/SectionBlock';
import SectionHeading from '@/components/tavern/shared/SectionHeading';
import type { TopTab } from '@/components/tavern/types';
import { tavernFaqs } from '@/constants/taverns';

type IntroOverviewProps = {
  onTabChange: (tab: TopTab) => void;
};

export default function IntroOverview({ onTabChange }: IntroOverviewProps) {
  return (
    <>
      <section className="relative flex h-[270px] flex-col justify-center overflow-hidden px-5 py-[42px]">
        <img
          src={tavernHeroBgImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-bottom"
        />
        <div className="absolute inset-0 mix-blend-screen bg-[linear-gradient(-55.793deg,#ffe76e_4.7427%,#ff6568_82.479%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-white/0 mix-blend-soft-light" />
        <div className="relative flex flex-col gap-[30px]">
          <h1 className="text-[40px] font-bold leading-[1.4] tracking-[-0.8px] text-[#1a1a1a]">
            지도 및
            <br />
            주막 정보
          </h1>
          <button
            type="button"
            className="flex w-fit items-center gap-1.5 rounded-full border border-white/50 bg-white/20 py-2.5 pl-5 pr-3.5 text-[14px] font-medium leading-none text-[#1a1a1a]"
            onClick={() => onTabChange('list')}
          >
            인기 주막 둘러보기
            <FiArrowRight size={24} />
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-12 bg-white px-5 py-16">
        <SectionBlock
          label="How to use"
          title={`지도에서 주막 위치를 확인하고 \n빠르게 예약해요`}
          animate={false}
          className="flex flex-col gap-12"
          headingClassName="flex flex-col gap-1.5 px-0"
          labelClassName="text-[16px] font-bold leading-none tracking-[-0.32px] text-black"
          titleClassName="whitespace-pre-line text-[20px] font-bold leading-[1.4] tracking-[-0.4px] text-black"
        >
          <div className="flex flex-col gap-12">
            <IntroGuideCard
              category="Map"
              title="원하는 주막 아이콘 터치하기"
              description="메뉴와 대기 시간을 확인할 수 있어요."
              imageSrc={tavernGuideMapImage}
              illustrationSrc={mapIconImage}
            />
            <IntroGuideCard
              category="Reservation"
              title="실시간 대기 현황 확인 및 예약"
              description={`총 3곳까지 미리 예약해\n줄을 서지 않고 기다릴 수 있어요.`}
              imageSrc={tavernGuideReservationImage}
              illustrationSrc={reservationIconImage}
            />
          </div>
        </SectionBlock>

        <SectionBlock
          label="Map"
          title="지도에서 모든 주막 리스트를 확인해요."
          animate={false}
          className="flex flex-col gap-8"
          headingClassName="flex flex-col px-0"
          labelClassName="text-[16px] font-bold leading-none tracking-[-0.32px] text-black"
          titleClassName="mt-2.5 text-[20px] font-bold leading-none tracking-[-0.4px] text-black"
          action={<IntroPillButton label="주막 전체보기" onClick={() => onTabChange('map')} />}
          actionClassName="mt-4"
        >
          <MapPreviewIllustration />
        </SectionBlock>
      </section>

      <FaqSection />
      <ContactSection />
    </>
  );
}

type IntroGuideCardProps = {
  category: string;
  title: string;
  description: string;
  imageSrc: string;
  illustrationSrc: string;
};

function IntroGuideCard({
  category,
  title,
  description,
  imageSrc,
  illustrationSrc,
}: IntroGuideCardProps) {
  return (
    <ContentCard
      category={category}
      title={title}
      description={description}
      imageSrc={imageSrc}
      illustrationSrc={illustrationSrc}
      className="h-[430px] rounded-[6px] p-6"
      contentClassName="relative z-10 flex w-full flex-col items-start gap-2.5"
      categoryClassName="text-[16px] font-medium leading-none tracking-[-0.32px] text-[#333333]"
      titleClassName="text-[18px] font-bold leading-none text-[#1a1a1a]"
      descriptionClassName="whitespace-pre-line text-[16px] font-normal leading-[1.4] tracking-[-0.32px] text-[#808080]"
      showAction={false}
    />
  );
}

function IntroPillButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="flex w-fit items-center gap-1.5 rounded-full border border-[#1a1a1a] py-2.5 pl-5 pr-3.5 text-[14px] font-medium leading-none tracking-[-0.28px] text-[#1a1a1a]"
      onClick={onClick}
    >
      {label}
      <FiArrowRight size={24} />
    </button>
  );
}

function MapPreviewIllustration() {
  return (
    <div className="relative h-[240px] overflow-hidden bg-[#f9f9f9]">
      <img
        src={tavernMapImage}
        alt="주막 지도 미리보기"
        className="absolute left-1/2 top-1/2 w-[235%] max-w-none -translate-x-[73%] -translate-y-[57%]"
      />
    </div>
  );
}

function FaqSection() {
  return (
    <section className="flex flex-col gap-12 px-5 py-8">
      <SectionHeading eyebrow="FAQ" title="자주 묻는 질문" variant="small" />
      <div className="flex flex-col gap-2.5">
        {tavernFaqs.map((faq, index) => (
          <details key={faq.question} className="bg-[#f9f9f9] p-5" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[16px] font-bold leading-none tracking-[-0.32px]">
              {faq.question}
              <FiChevronDown size={20} />
            </summary>
            <p className="mt-3 text-[16px] font-medium leading-[1.5] text-[#4d4d4d]">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="flex flex-col gap-12 px-5 py-16">
      <div className="flex flex-col gap-1.5">
        <SectionHeading eyebrow="Contact" title="문의하기" variant="small" />
        <p className="text-[16px] font-medium leading-[1.4] tracking-[-0.32px] text-[#808080]">
          축제 운영팀에 언제든 연락하세요
        </p>
      </div>
      <div className="grid gap-5 bg-[#f9f9f9] p-5">
        <ContactItem label="이메일" value="likelion_knu@knu.ac.kr" />
        <ContactItem label="전화" value="02-1234-5678" />
        <ContactItem label="위치" value="경북대학교 본관" />
      </div>
      <div className="flex flex-col gap-5">
        <h2 className="text-[18px] font-bold leading-[1.4] tracking-[-0.36px]">
          궁금한 점 간편하게 문의하기
        </h2>
        <button
          type="button"
          className="flex w-fit items-center gap-1.5 rounded-full border border-black py-2.5 pl-5 pr-3.5 text-[14px] font-medium leading-none"
        >
          간편 문의하기
          <FiArrowRight size={24} />
        </button>
      </div>
    </section>
  );
}

function ContactItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-3 text-[16px] leading-[1.5]">
      <strong>{label}</strong>
      <span className="font-medium text-[#4d4d4d]">{value}</span>
    </div>
  );
}
