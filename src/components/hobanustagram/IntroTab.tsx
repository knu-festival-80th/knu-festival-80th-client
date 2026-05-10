import { ArrowRight } from 'lucide-react';

import photoboothImage from '@/assets/hobanustagram/photobooth.png';
import { ContactSection } from '@/components/common/ContactSection';
import { FaqAccordion } from '@/components/common/FaqAccordion';
import { GradientBanner } from '@/components/common/GradientBanner';
import { hobanustagramFaqItems } from '@/constants/hobanustagram';

export const IntroTab = () => {
  return (
    <>
      <GradientBanner title="호반우스타그램" />

      <section className="flex flex-col gap-12 bg-white px-5 pb-12 pt-16">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <p className="font-wanted-sans text-base font-bold leading-[1.4] tracking-[-0.02rem] text-black">
              Web Photo Booth
            </p>
            <p className="font-wanted-sans text-[18px] font-semibold leading-[1.4] tracking-[-0.02rem] text-black">
              웹 포토부스 알아보기
            </p>
            <p className="whitespace-pre-line font-wanted-sans text-base font-medium leading-[1.4] tracking-[-0.02rem] text-black/50">
              {
                '축제 순간을 촬영하거나 업로드하고,\n프레임·스티커로 꾸민 뒤 다운로드 및 SNS 공유!\n실시간 피드에서 다른 사진도 감상하고 좋아요까지'
              }
            </p>
          </div>
          <button
            type="button"
            className="flex w-fit items-center gap-1.5 rounded-full border border-ink py-2.5 pl-5 pr-3.5"
          >
            <span className="font-wanted-sans text-sm font-medium leading-none tracking-[-0.02em] text-ink">
              호반우 필터로 사진찍기
            </span>
            <ArrowRight className="size-6 text-ink" />
          </button>
        </div>

        <div className="flex justify-center">
          <img
            src={photoboothImage}
            alt="웹 포토부스 미리보기"
            className="w-71.75 object-contain"
          />
        </div>
      </section>

      <section className="py-16">
        <FaqAccordion items={hobanustagramFaqItems} />
      </section>

      <section className="py-16">
        <ContactSection />
      </section>
    </>
  );
};
