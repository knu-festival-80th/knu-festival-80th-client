import downArrowIcon from '@/assets/instating/arrowIcon/downArrowIcon.svg';

const HeroSection = () => {
  return (
    <section className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden">
      {/* Background layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(255, 67, 67, 0.2) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(180deg, #FF3EBB 0%, #FF6ECC 48%, #FFB4FE 60.58%, #FF6ECC 78%, #FF465F 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-white/0 mix-blend-soft-light" />
      </div>

      {/* Content - constrained to 375px */}
      <div className="relative mx-auto h-full max-w-[375px]">
        {/* Hero text */}
        <div className="absolute left-5 top-[568px] flex flex-col gap-5 pr-5">
          <h1 className="font-wanted-sans w-[335px] text-[40px] font-bold leading-none tracking-[-0.08px] text-black">
            설렘의 시작
          </h1>
          <p className="font-wanted-sans text-base leading-tight text-black/70">
            지금, 대동제에서 만나는 더 특별한 순간을
            <br />
            만들어보세요
          </p>
        </div>

        {/* Scroll down button */}
        <div className="absolute bottom-[38px] left-1/2 -translate-x-1/2">
          <button
            type="button"
            aria-label="아래로 스크롤"
            className="flex size-12 items-center justify-center rounded-full bg-white/20"
          >
            <img alt="" className="size-12" src={downArrowIcon} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
