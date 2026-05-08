import { Fragment, useState, useEffect } from 'react';

const INSTATING_DEADLINE = new Date('2026-05-18T23:59:59');

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const getTimeLeft = (): TimeLeft => {
  const diff = Math.max(0, INSTATING_DEADLINE.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const CountDownSection = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { value: String(timeLeft.days).padStart(2, '0'), unit: '일' },
    { value: String(timeLeft.hours).padStart(2, '0'), unit: '시간' },
    { value: String(timeLeft.minutes).padStart(2, '0'), unit: '분' },
    { value: String(timeLeft.seconds).padStart(2, '0'), unit: '초' },
  ];

  return (
    <div className="flex w-full flex-col gap-6 bg-white px-5 pb-16 pt-8">
      <div className="flex flex-col gap-1.5">
        <p className="font-wanted-sans text-[16px] font-bold leading-[1.4] tracking-[-0.32px] text-ink">
          Count Down
        </p>
        <p className="font-wanted-sans text-[18px] font-medium leading-[1.4] tracking-[-0.36px] text-ink">
          인스타팅 신청 마감까지
        </p>
      </div>

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
    </div>
  );
};

export default CountDownSection;
