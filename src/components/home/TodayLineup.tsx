import type { DayLineup } from '@/types/home';
import { toMinutes } from '@/utils/time';
import LineupImageCarousel from './LineupImageCarousel';
import ScheduleItem from './ScheduleItem';

const FESTIVAL_MONTH = 5;
const FESTIVAL_DAYS = [20, 21, 22];

type TodayLineupProps = {
  data: DayLineup[];
};

export default function TodayLineup({ data }: TodayLineupProps) {
  const now = new Date();
  const isFestivalMonth = now.getMonth() + 1 === FESTIVAL_MONTH;
  const today = now.getDate();
  const isFestivalDay = isFestivalMonth && FESTIVAL_DAYS.includes(today);
  const activeDay = isFestivalDay ? today : 20;
  const dayData = data.find((d) => d.day === activeDay) ?? data[0];
  if (!dayData) return null;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="flex flex-col gap-12 px-5">
      <LineupImageCarousel artists={dayData.artists} />
      <div className="flex items-start gap-7.5">
        <span className="text-display1 text-base-deep">{dayData.day}</span>
        <div className="flex flex-col py-1 gap-5">
          {dayData.schedules.map((entry) => (
            <ScheduleItem
              key={entry.name}
              entry={{
                ...entry,
                isActive:
                  isFestivalDay &&
                  currentMinutes >= toMinutes(entry.startTime) &&
                  currentMinutes < toMinutes(entry.endTime),
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
