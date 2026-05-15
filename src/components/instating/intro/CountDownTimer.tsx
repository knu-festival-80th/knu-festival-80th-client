import { Fragment } from 'react';
import { getTimeLeft, useTimeLeft } from '@/hooks/instating/useCountdown';

const CountDownTimer = ({ deadline }: { deadline: Date }) => {
  const timeLeft = useTimeLeft(deadline) ?? getTimeLeft(deadline);

  const items = [
    { value: String(timeLeft.days).padStart(2, '0'), unit: '일' },
    { value: String(timeLeft.hours).padStart(2, '0'), unit: '시간' },
    { value: String(timeLeft.minutes).padStart(2, '0'), unit: '분' },
    { value: String(timeLeft.seconds).padStart(2, '0'), unit: '초' },
  ];

  return (
    <div className="flex items-start gap-2">
      {items.map(({ value, unit }, i) => (
        <Fragment key={unit}>
          <div className="flex flex-col items-center">
            <span className="font-wanted-sans text-[40px] font-bold leading-[1.4] tracking-[-0.8px] text-sub-red tabular-nums">
              {value}
            </span>
            <span className="font-wanted-sans text-[16px] font-medium leading-none tracking-[-0.32px] text-text-disabled">
              {unit}
            </span>
          </div>
          {i < items.length - 1 && (
            <span className="font-wanted-sans text-[40px] font-normal leading-none tracking-[-0.8px] text-[#ccc]">
              :
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default CountDownTimer;
