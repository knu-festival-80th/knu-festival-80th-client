import { useEffect, useState } from 'react';
import CountDownTimer from './CountDownTimer';
import { APPLY_DEADLINE, REVEAL_DEADLINE, ZERO_DEADLINE } from '../../constants/instaTingDeadline';

type TimerMode = 'apply' | 'reveal' | 'zero';

const getTimerMode = (): TimerMode => {
  const hour = new Date().getHours();
  if (hour >= 11 && hour < 21) return 'apply';
  if (hour >= 21 && hour < 22) return 'reveal';
  return 'zero'; // 22:00 - 11:00
};

const TIMER_CONFIG: Record<TimerMode, { label: string; deadline: Date }> = {
  apply: { label: '인스타팅 신청 마감까지', deadline: APPLY_DEADLINE },
  reveal: { label: '인스타팅 매칭 공개까지', deadline: REVEAL_DEADLINE },
  zero: {
    label: '결과를 확인하세요.\n결과는 다음날 오전 11시 까지 확인 가능합니다.',
    deadline: ZERO_DEADLINE,
  },
};

const CountDownSection = () => {
  const [mode, setMode] = useState<TimerMode>(getTimerMode);

  useEffect(() => {
    const id = setInterval(() => setMode(getTimerMode()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { label, deadline } = TIMER_CONFIG[mode];

  return (
    <div className="flex w-full flex-col gap-6 bg-white px-5 pb-16 pt-8">
      <div className="flex flex-col gap-1.5">
        <p className="font-wanted-sans text-[16px] font-bold leading-[1.4] tracking-[-0.32px] text-ink">
          Count Down
        </p>
        <p className="whitespace-pre-line font-wanted-sans text-[18px] font-medium leading-[1.4] tracking-[-0.36px] text-ink">
          {label}
        </p>
      </div>

      <CountDownTimer deadline={deadline} />
    </div>
  );
};

export default CountDownSection;
