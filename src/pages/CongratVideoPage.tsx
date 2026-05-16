import SectionBlock from '@/components/home/SectionBlock';
import VideoCard from '@/components/congratVideo/VideoCard';
import { CONGRAT_VIDEOS } from '@/constants/congratVideo';
import heroBg from '@/assets/home/hero-bg.webp';
import heroDecoration from '@/assets/congratVideo/hero-decoration.svg';
import about80thImg from '@/assets/congratVideo/about-80th.webp';
import anniversaryFundImg from '@/assets/congratVideo/anniversary-fund.webp';

export default function CongratVideoPage() {
  return (
    <div className="flex flex-col min-h-dvh pb-16">
      <section className="relative h-64 flex flex-col justify-end overflow-hidden px-5 py-[42px]">
        <div
          aria-hidden="true"
          className="absolute h-64 -left-[45px] top-0 w-[420px] opacity-20 overflow-clip pointer-events-none"
        >
          <img src={heroDecoration} alt="" className="absolute inset-0 size-full max-w-none" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 h-64 pointer-events-none">
          <img
            src={heroBg}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-10 max-w-none"
          />
          <div
            className="absolute inset-0 mix-blend-lighten"
            style={{
              backgroundImage:
                'linear-gradient(180deg, #ff4242 0%, #ffaf55 22.115%, #ff4242 44.712%, #ff4242 100%)',
            }}
          />
        </div>
        <div className="relative flex flex-col items-start w-full">
          <p className="text-display1 text-ink font-bold uppercase tracking-tighter leading-none mb-4.5">
            경북대학교
          </p>
          <p className="text-display1 text-ink font-bold uppercase tracking-tighter leading-none">
            80주년
          </p>
        </div>
      </section>

      <div className="pt-16 pb-32 flex flex-col gap-12 bg-surface overflow-x-hidden">
        <SectionBlock
          label="About 80th"
          title="경북대학교 80년을 맞이하다"
          description={
            '80년의 시간 속에서 견고히 쌓아 올린\n경북대학교의 위대한 이름이\n이제 새로운 미래의 문을 열고 있습니다.\n지금, 우리의 가장 빛나는 순간이 새롭게 시작됩니다.'
          }
          viewAllTo="https://www.knu.ac.kr/wbbs/knu80th.action"
          viewAllLabel="80주년 더보기"
          viewAllClassName="border-sub-red text-sub-red"
        >
          <div className="px-5">
            <img
              src={about80thImg}
              alt="경북대학교 80주년"
              className="w-full aspect-335/242 object-cover"
            />
          </div>
        </SectionBlock>

        <SectionBlock label="Official Video" title="80년의 기록과 보존, 홍보영상">
          <div className="flex flex-col gap-8 px-5">
            {CONGRAT_VIDEOS.map((video) => (
              <VideoCard key={video.badge} badge={video.badge} videoUrl={video.videoUrl} />
            ))}
          </div>
        </SectionBlock>

        <SectionBlock
          label="Anniversary Fund"
          title="80주년의 새로운 영광을 함께, 발전기금"
          description={'함께 만드는 80년의 자부심.\n여러분의 후원으로 더 밝은 내일을 열어갑니다.'}
          viewAllTo="http://fund.knu.ac.kr/pages/index.htm"
          viewAllLabel="발전기금"
          viewAllClassName="border-sub-red text-sub-red"
        >
          <div className="px-5">
            <img
              src={anniversaryFundImg}
              alt="발전기금"
              className="w-full aspect-square object-cover"
            />
          </div>
        </SectionBlock>
      </div>
    </div>
  );
}
