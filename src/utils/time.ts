export const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const getNow = () => new Date();

const FESTIVAL_MONTH = 5;
const FESTIVAL_DAYS = [20, 21, 22];

export function isScheduleActive(startTime: string, endTime: string, day: number): boolean {
  const now = getNow();
  const isToday =
    now.getMonth() + 1 === FESTIVAL_MONTH &&
    FESTIVAL_DAYS.includes(now.getDate()) &&
    now.getDate() === day;
  if (!isToday) return false;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes >= toMinutes(startTime) && currentMinutes < toMinutes(endTime);
}
