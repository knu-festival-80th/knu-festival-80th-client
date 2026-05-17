import OutlineButton from '@/components/common/OutlineButton';
import ProcessCard from '@/components/common/ProcessCard';
import { fadeUpVariant } from '@/constants/animation';
import { INSTATING_STEPS } from '@/constants/instating';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const InstatingContent = () => {
  const navigate = useNavigate();
  const goApplyPage = () => navigate('/instating/apply');
  const goResultPage = () => navigate('/instating/result');

  return (
    <section className="w-full bg-white">
      <div className="mx-auto flex w-full flex-col items-center gap-12 px-5 pb-16 pt-8">
        {/* Section header */}
        <motion.div className="flex w-full flex-col gap-4 pt-8" {...fadeUpVariant}>
          <div className="flex flex-col gap-2.5">
            <p className="font-wanted-sans text-body1 font-bold tracking-tight text-ink">Process</p>
            <h2 className="font-wanted-sans text-subheading font-bold tracking-tight text-ink">
              축제로 시작된 두근두근 인연
            </h2>
            <p className="font-wanted-sans text-body1 leading-[1.4] tracking-tight text-gray">
              올해의 새로운 인연과 만나보세요!
            </p>
          </div>
          <OutlineButton label="바로 신청하기" showArrow onClick={goApplyPage} />
        </motion.div>

        {/* Step cards */}
        <motion.ol className="flex w-full flex-col gap-5" {...fadeUpVariant}>
          {INSTATING_STEPS.map((s) => (
            <li key={s.step}>
              <ProcessCard {...s} />
            </li>
          ))}
        </motion.ol>

        {/* CTA banner */}
        <motion.div className="flex w-full flex-col gap-5 px-4 py-8" {...fadeUpVariant}>
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
            <OutlineButton label="신청하기" showArrow onClick={goApplyPage} />
            <OutlineButton label="결과 확인하기" variant="dark" onClick={goResultPage} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InstatingContent;
