import { Fragment, useEffect, useState } from 'react';

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const getTimeLeft = (deadline: Date): TimeLeft => {
  const diff = Math.max(0, isNaN(deadline.getTime()) ? 0 : deadline.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const isZero = (t: TimeLeft) => t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0;

const CountDownTimer = ({ deadline }: { deadline: Date }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(deadline));

  useEffect(() => {
    if (isZero(getTimeLeft(deadline))) return;

    const id = setInterval(() => {
      const next = getTimeLeft(deadline);
      setTimeLeft(next);
      if (isZero(next)) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

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
