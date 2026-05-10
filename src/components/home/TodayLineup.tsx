import type { DayLineup } from '@/types/home';
import { isScheduleActive } from '@/utils/time';
import LineupImageCarousel from './LineupImageCarousel';
import ScheduleItem from './ScheduleItem';

const FESTIVAL_MONTH = 5;
const FESTIVAL_DAYS = [20, 21, 22];

type TodayLineupProps = {
  data: DayLineup[];
};

export default function TodayLineup({ data }: TodayLineupProps) {
  const now = new Date();
  const today = now.getDate();
  const isFestivalDay = now.getMonth() + 1 === FESTIVAL_MONTH && FESTIVAL_DAYS.includes(today);
  const activeDay = isFestivalDay ? today : 21;
  const dayData = data.find((d) => d.day === activeDay) ?? data[0];
  if (!dayData) return null;

  return (
    <div className="flex flex-col gap-12 px-5">
      <LineupImageCarousel artists={dayData.artists} />
      <div className="flex items-start gap-7.5">
        <span className="text-display2 text-ink">{dayData.day}</span>
        <div className="flex flex-1 flex-col gap-5 py-1.5">
          {dayData.schedules.map((entry) => (
            <ScheduleItem
              key={entry.name}
              entry={{
                ...entry,
                isActive: isScheduleActive(entry.startTime, entry.endTime),
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
