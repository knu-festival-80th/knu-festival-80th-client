import step1Bg from '@/assets/instating/stepCard/step1_bg.png';
import step1Illust from '@/assets/instating/stepCard/step1_illust.svg';
import step2Bg from '@/assets/instating/stepCard/step2_bg.png';
import step2Illust from '@/assets/instating/stepCard/step2_illust.svg';
import step3Bg from '@/assets/instating/stepCard/step3_bg.png';
import step3Illust from '@/assets/instating/stepCard/step3_illust.svg';
import step4Bg from '@/assets/instating/stepCard/step4_bg.png';
import step4Illust from '@/assets/instating/stepCard/step4_illust.svg';
import forwardArrowIcon from '@/assets/instating/icon/forwardArrowIcon.svg';
import OutlineButton from './OutlineButton';
import ProcessCard from './ProcessCard';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    step: '1단계',
    title: '매칭 신청하기',
    description: '프로필을 작성하고 매칭을 신청합니다.',
    bgSrc: step1Bg,
    illustSrc: step1Illust,
  },
  {
    step: '2단계',
    title: '지정 시간 공개 기다리기',
    description: 'Time Drop으로 정해진 시간에 결과가 공개됩니다.',
    bgSrc: step2Bg,
    illustSrc: step2Illust,
  },
  {
    step: '3단계',
    title: '매칭 결과 확인하기',
    description: '스크래치 UI로 설렘을 느끼며 결과를 확인합니다.',
    bgSrc: step3Bg,
    illustSrc: step3Illust,
  },
  {
    step: '4단계',
    title: '인스타그램으로 연결하기',
    description: '딥링크로 바로 메시지를 보낼 수 있습니다.',
    bgSrc: step4Bg,
    illustSrc: step4Illust,
  },
];

const InstaTingContent = () => {
  const navigate = useNavigate();
  const goApplyPage = () => navigate('/instating/apply');
  const goResultPage = () => navigate('/instating/result');

  return (
    <section className="w-full bg-white">
      <div className="mx-auto flex w-full flex-col items-center gap-12 px-5 pb-16 pt-16">
        {/* Section header */}
        <div className="flex w-full flex-col gap-4 pt-8">
          <div className="flex flex-col gap-2.5">
            <p className="font-wanted-sans text-body1 font-bold tracking-tight text-ink">Process</p>
            <h2 className="font-wanted-sans text-subheading font-bold tracking-tight text-ink">
              축제로 시작된 두근두근 인연
            </h2>
            <p className="font-wanted-sans text-body1 leading-[1.4] tracking-tight text-gray">
              올해의 새로운 인연과 만나보세요!
            </p>
          </div>
          <OutlineButton label="바로 신청하기" icon={forwardArrowIcon} onClick={goApplyPage} />
        </div>

        {/* Step cards */}
        <ol className="flex w-full flex-col gap-5">
          {steps.map((s) => (
            <li key={s.step}>
              <ProcessCard {...s} />
            </li>
          ))}
        </ol>

        {/* CTA banner */}
        <div className="flex w-full flex-col gap-5 px-4 py-8">
          <div className="flex flex-col gap-2.5">
            <p className="font-wanted-sans text-subheading font-bold tracking-tight text-ink">
              지금 바로 인연을 찾아보세요
            </p>
            <p className="font-wanted-sans text-body1 leading-[1.4] tracking-tight text-gray">
              대동제에서 만난 사람들과 더 깊은 연결을
              <br />
              만들어보세요
            </p>
          </div>
          <div className="flex items-center gap-4">
            <OutlineButton label="신청하기" icon={forwardArrowIcon} onClick={goApplyPage} />
            <OutlineButton label="결과 확인하기" dark onClick={goResultPage} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstaTingContent;
