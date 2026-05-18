import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowRight, FiChevronDown } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { fadeUpVariant } from '@/constants/animation';

import mapIconImage from '@/assets/images/map-icon.png';
import mapPreviewImage from '@/assets/images/map-preview.png';
import reservationIconImage from '@/assets/images/reservation-icon.png';
import tavernGuideMapImage from '@/assets/images/tavern-guide-map.png';
import tavernGuideReservationImage from '@/assets/images/tavern-guide-reservation.png';
import { INTRO_HERO_BACKGROUND_IMAGE } from '@/components/common/GradientBanner';
import SectionBlock from '@/components/home/SectionBlock';
import SectionHeading from '@/components/tavern/shared/SectionHeading';
import type { TopTab } from '@/components/tavern/types';
import { tavernFaqs } from '@/constants/taverns';

type IntroOverviewProps = {
  onTabChange: (tab: TopTab) => void;
};

const MAP_PREVIEW_OBJECT_POSITION = '20% 70%';
const GUIDE_CARD_BACKGROUND_OVERLAY =
  'linear-gradient(132.09deg, #ffffff 34.45%, rgba(255, 255, 255, 0) 100%)';

export default function IntroOverview({ onTabChange }: IntroOverviewProps) {
  return (
    <>
      <section
        className="relative flex h-[270px] flex-col justify-center overflow-hidden px-5 py-[42px]"
        style={{ backgroundImage: INTRO_HERO_BACKGROUND_IMAGE }}
      >
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
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
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
                illustrationClassName="p-2 bottom-[30px] left-1/2 h-[256px] w-[335px] -translate-x-1/2"
              />
              <IntroGuideCard
                category="Reservation"
                title="실시간 대기 현황 확인 및 예약"
                description={`총 3곳까지 미리 예약해\n줄을 서지 않고 기다릴 수 있어요.`}
                imageSrc={tavernGuideReservationImage}
                illustrationSrc={reservationIconImage}
                illustrationClassName="p-2 bottom-[15px] left-1/2 h-[286px] w-[256px] -translate-x-1/2"
              />
            </div>
          </SectionBlock>
        </motion.div>

        <SectionBlock
          label="Map"
          title="지도에서 모든 주막 리스트를 확인해요."
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
  illustrationClassName: string;
};

function IntroGuideCard({
  category,
  title,
  description,
  imageSrc,
  illustrationSrc,
  illustrationClassName,
}: IntroGuideCardProps) {
  return (
    <article className="relative flex h-[430px] w-full flex-col items-start overflow-hidden rounded-[6px] bg-black/[0.02]">
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[6px]">
        <img src={imageSrc} alt="" className="size-full rounded-[6px] object-cover" />
        <div
          className="absolute inset-0 rounded-[6px]"
          style={{ backgroundImage: GUIDE_CARD_BACKGROUND_OVERLAY }}
        />
      </div>

      <div className="relative z-10 flex h-[104px] w-full shrink-0 flex-col items-start p-6">
        <div className="flex w-full flex-col items-start gap-2.5">
          <div className="flex w-full flex-col items-start gap-2.5">
            <p className="w-full break-words font-wanted-sans text-[16px] font-medium leading-none tracking-[-0.32px] text-[#333333]">
              {category}
            </p>
            <h3 className="w-full break-words font-wanted-sans text-[18px] font-bold leading-none text-[#1a1a1a]">
              {title}
            </h3>
          </div>
          <p className="w-full whitespace-pre-line break-words font-wanted-sans text-[16px] font-normal leading-[1.4] tracking-[-0.32px] text-[#808080]">
            {description}
          </p>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[104px]">
        <img
          src={illustrationSrc}
          alt=""
          className={`absolute max-w-none object-contain ${illustrationClassName}`}
        />
      </div>
    </article>
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
      <span className="absolute left-3 top-3 z-10 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-medium leading-none tracking-[-0.22px] text-white">
        미리보기
      </span>
      <img
        src={mapPreviewImage}
        alt="주막 지도 미리보기"
        className="size-full object-cover"
        style={{ objectPosition: MAP_PREVIEW_OBJECT_POSITION }}
      />
    </div>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <motion.section className="flex flex-col gap-12 px-5 py-8" {...fadeUpVariant}>
      <SectionHeading eyebrow="FAQ" title="자주 묻는 질문" variant="small" />
      <div className="flex flex-col gap-2.5">
        {tavernFaqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={faq.question} className="bg-[#f9f9f9] p-5">
              <button
                type="button"
                className="flex w-full cursor-pointer items-start justify-between gap-4 text-left text-[16px] font-bold leading-none tracking-[-0.32px]"
                aria-expanded={isOpen}
                onClick={() => toggle(index)}
              >
                {faq.question}
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <FiChevronDown size={20} />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 text-[16px] font-medium leading-[1.5] text-[#4d4d4d]">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}

function ContactSection() {
  return (
    <motion.section className="flex flex-col gap-12 px-5 py-16" {...fadeUpVariant}>
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
    </motion.section>
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
