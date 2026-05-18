import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import rollingIntroIllust from '@/assets/rollingPaper/Group 425.svg';
import { INTRO_HERO_BACKGROUND_IMAGE } from '@/components/common/GradientBanner';
import RollingPaperPageTransition from './RollingPaperPageTransition';
import RollingPaperTabs from './RollingPaperTabs';
import { rollingPaperItemMotion } from './rollingPaperMotion';

export default function RollingPaperIntro() {
  return (
    <>
      <RollingPaperTabs active="intro" />
      <RollingPaperPageTransition className="bg-white">
        <section
          className="relative flex min-h-[270px] items-end overflow-hidden px-5 py-[42px]"
          style={{ backgroundImage: INTRO_HERO_BACKGROUND_IMAGE }}
        >
          <h1 className="relative font-wanted-sans text-[40px] font-bold leading-[1.4] tracking-[-0.02em] text-ink">
            80주년
            <br />
            롤링페이퍼
          </h1>
        </section>

        <section className="flex flex-col gap-12 px-5 pt-16 pb-12">
          <motion.div className="flex flex-col gap-5" {...rollingPaperItemMotion}>
            <div className="flex flex-col gap-1.5">
              <p className="font-wanted-sans text-body1 font-bold leading-[1.4] tracking-[-0.02em] text-black">
                Rolling Paper
              </p>
              <h2 className="font-wanted-sans text-[18px] font-semibold leading-[1.4] tracking-[-0.02em] text-black">
                함께 만드는 80년의 기억
              </h2>
              <p className="font-wanted-sans text-body1 font-medium leading-[1.4] tracking-[-0.02em] text-black/50">
                수천 명이 동시에 하나의 가상 도화지에 메시지를 남깁니다. 당신의 글과 그림이
                실시간으로 다른 사람들의 것과 어우러져 하나의 거대한 작품이 됩니다.
              </p>
            </div>
            <Link
              to="/rolling-paper/categories"
              className="flex w-fit items-center gap-1.5 rounded-full border border-ink py-2.5 pl-5 pr-3.5"
            >
              <span className="font-wanted-sans text-sm font-medium leading-[1.5] text-ink">
                메시지 남기러 가기
              </span>
              <ArrowRight className="size-6 text-ink" />
            </Link>
          </motion.div>

          <motion.img
            src={rollingIntroIllust}
            alt=""
            className="mx-auto w-[287px] max-w-full object-contain"
            {...rollingPaperItemMotion}
          />
        </section>

        <div className="h-[52px]" />
      </RollingPaperPageTransition>
    </>
  );
}
