import { useEffect, useState } from 'react';

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export const getTimeLeft = (deadline: Date): TimeLeft => {
  const diff = Math.max(0, isNaN(deadline.getTime()) ? 0 : deadline.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const pad = (n: number) => String(n).padStart(2, '0');

export function useTimeLeft(deadline: Date | null): TimeLeft | null {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!deadline) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return deadline ? getTimeLeft(deadline) : null;
}

export function useCountdown(deadline: Date | null): string {
  const t = useTimeLeft(deadline);
  if (!t) return '--:--:--:--';
  return `${pad(t.days)}:${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)}`;
}
