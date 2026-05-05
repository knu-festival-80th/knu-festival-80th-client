import { useState, useEffect } from 'react';

const FESTIVAL_START = new Date('2026-05-20T18:00:00');

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const getTimeLeft = (): TimeLeft => {
  const diff = Math.max(0, FESTIVAL_START.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

export default function CountdownTimer() {
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
    <div className="flex flex-col">
      {items.map(({ value, unit }) => (
        <div key={unit} className="flex items-baseline tracking-[-0.02em]">
          <span className="text-countdown text-ink tabular-nums">{value}</span>
          <span className="text-countdown text-border">{unit}</span>
        </div>
      ))}
    </div>
  );
}
