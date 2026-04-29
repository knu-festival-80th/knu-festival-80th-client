import type { ScheduleEntry } from '@/types/home';
import { isScheduleActive } from '@/utils/time';

type TimeTableScheduleItemProps = {
  entry: ScheduleEntry;
};

export default function TimeTableScheduleItem({ entry }: TimeTableScheduleItemProps) {
  const active = isScheduleActive(entry.startTime, entry.endTime);
  const colorClass = active ? 'text-primary' : 'text-text-muted';

  return (
    <div className={`flex items-start gap-4 py-3.5 px-4 ${colorClass}`}>
      <span className="text-body2 font-bold shrink-0">
        {entry.startTime} ~ {entry.endTime}
      </span>
      <span className="text-body2">{entry.name}</span>
    </div>
  );
}
