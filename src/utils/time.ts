export const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const FESTIVAL_MONTH = 5;
const FESTIVAL_DAYS = [20, 21, 22];

export function isScheduleActive(startTime: string, endTime: string): boolean {
  const now = new Date();
  const isFestivalDay =
    now.getMonth() + 1 === FESTIVAL_MONTH && FESTIVAL_DAYS.includes(now.getDate());
  if (!isFestivalDay) return false;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes >= toMinutes(startTime) && currentMinutes < toMinutes(endTime);
}
