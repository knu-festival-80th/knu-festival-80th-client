import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import photoboothImage from '@/assets/hobanustagram/photobooth.webp';
import { ContactSection } from '@/components/common/ContactSection';
import { FaqAccordion } from '@/components/common/FaqAccordion';
import { GradientBanner } from '@/components/common/GradientBanner';
import { hobanustagramFaqItems } from '@/constants/hobanustagram';
import { fadeUpVariant } from '@/constants/animation';

export interface IntroTabProps {
  onNavigateToPhotobooth: () => void;
  onPhotoboothIntent?: () => void;
}

export const IntroTab = ({ onNavigateToPhotobooth, onPhotoboothIntent }: IntroTabProps) => {
  return (
    <>
      <GradientBanner title="호반우스타그램" />

      <section className="flex flex-col gap-12 bg-white px-5 pb-12 pt-16">
        <motion.div className="flex flex-col gap-5" {...fadeUpVariant}>
          <div className="flex flex-col gap-1.5">
            <p className="font-wanted-sans text-base font-bold leading-[1.4] tracking-[-0.02rem] text-black">
              Web Photo Booth
            </p>
            <p className="font-wanted-sans text-[18px] font-semibold leading-[1.4] tracking-[-0.02rem] text-black">
              웹 포토부스 알아보기
            </p>
            <p className="whitespace-pre-line font-wanted-sans text-base font-medium leading-[1.4] tracking-[-0.02rem] text-black/50">
              {'프레임·필터 속의 호반우와 함께 사진을 촬영하고,\n다운로드 및 SNS에 공유해보세요!'}
            </p>
            <p className="whitespace-pre-line font-wanted-sans text-sm font-medium leading-[1.4] tracking-[-0.02rem] text-black/35">
              {'촬영한 사진은 서버에 저장되거나 전송되지 않으며,\n본인 기기에만 저장돼요.'}
            </p>
          </div>
          <button
            type="button"
            className="flex w-fit items-center gap-1.5 rounded-full border border-ink py-2.5 pl-5 pr-3.5"
            onFocus={onPhotoboothIntent}
            onClick={onNavigateToPhotobooth}
            onPointerEnter={onPhotoboothIntent}
            onTouchStart={onPhotoboothIntent}
          >
            <span className="font-wanted-sans text-sm font-medium leading-none tracking-[-0.02em] text-ink">
              호반우 필터로 사진찍기
            </span>
            <ArrowRight className="size-6 text-ink" />
          </button>
        </motion.div>

        <motion.div
          className="flex justify-center"
          {...fadeUpVariant}
          transition={{ ...fadeUpVariant.transition, delay: 0.1 }}
        >
          <img
            src={photoboothImage}
            alt="웹 포토부스 미리보기"
            className="w-71.75 object-contain"
          />
        </motion.div>
      </section>

      <motion.section className="py-16" {...fadeUpVariant}>
        <FaqAccordion items={hobanustagramFaqItems} />
      </motion.section>

      <motion.section
        className="py-16"
        {...fadeUpVariant}
        transition={{ ...fadeUpVariant.transition, delay: 0.1 }}
      >
        <ContactSection />
      </motion.section>
    </>
  );
};
