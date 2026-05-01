import ProcessCard from './ProcessCard';
import step_1 from '@/assets/instating/processCard/step_1.svg';
import step_2 from '@/assets/instating/processCard/step_2.svg';
import step_3 from '@/assets/instating/processCard/step_3.svg';
import step_4 from '@/assets/instating/processCard/step_4.svg';
import forwardArrowIcon from '@/assets/instating/arrowIcon/forwardArrowIcon.svg';
import OutlineButton from './OutlineButton';

const InstaTingContent = () => {
  return (
    <section className="w-full bg-white">
      {/* Process section */}
      <div className="mx-auto flex w-full max-w-[375px] flex-col items-center gap-12 px-5 py-16">
        {/* Section header */}
        <div className="flex w-full flex-col gap-4 pt-8">
          <div className="flex flex-col gap-2.5">
            <span className="font-wanted-sans text-[16px] font-bold leading-none tracking-[-0.032px] text-black">
              Process
            </span>
            <h2 className="font-wanted-sans text-[20px] leading-none tracking-[-0.4px] text-black">
              축제로 시작된 두근두근 인연
            </h2>
            <p className="font-wanted-sans text-[16px] leading-none tracking-[-0.032px] text-[#808080]">
              올해의 새로운 인연과 만나보세요!
            </p>
          </div>
          <div>
            <OutlineButton label="신청하기" icon={forwardArrowIcon} />
          </div>
        </div>

        {/* Step cards */}
        <ol className="flex flex-col gap-5">
          <li>
            <ProcessCard
              imgSrc={step_1}
              imgAlt="1단계 매칭 신청하기 - 프로필을 작성하고 매칭을 신청합니다"
            />
          </li>
          <li>
            <ProcessCard
              imgSrc={step_2}
              imgAlt="2단계 지정 시간 공개 기다리기 - Time Drop으로 정해진 시간에 결과가 공개됩니다"
            />
          </li>
          <li>
            <ProcessCard
              imgSrc={step_3}
              imgAlt="3단계 매칭 결과 확인하기 - 스크래치 UI로 설렘을 느끼며 결과를 확인합니다"
            />
          </li>
          <li>
            <ProcessCard
              imgSrc={step_4}
              imgAlt="4단계 인스타그램으로 연결하기 - 딥링크로 바로 메시지를 보낼 수 있습니다"
            />
          </li>
        </ol>

        {/* CTA banner */}
        <div className="flex w-full flex-col gap-5 px-4 py-8">
          <div className="flex w-full flex-col gap-2.5">
            <p className="font-wanted-sans text-[20px] font-bold leading-[1.4] tracking-[-0.04px] text-black">
              지금 바로 인연을 찾아보세요
            </p>
            <p className="font-wanted-sans text-[16px] leading-none tracking-[-0.032px] text-[#808080]">
              대동제에서 만난 사람들과 더 깊은 연결을
              <br />
              만들어보세요
            </p>
          </div>
          <div className="flex w-full items-center gap-4">
            <OutlineButton label="신청하기" icon={forwardArrowIcon} />
            <OutlineButton label="결과 확인하기" dark />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstaTingContent;
