import type { ScheduleEntry } from '@/types/home';
import { isScheduleActive } from '@/utils/time';

type TimeTableScheduleItemProps = {
  entry: ScheduleEntry;
};

export default function TimeTableScheduleItem({ entry }: TimeTableScheduleItemProps) {
  const active = isScheduleActive(entry.startTime, entry.endTime);

  return (
    <div
      className={`flex items-start gap-6 px-6 py-5 ${
        active ? 'bg-sub-red text-surface' : 'text-gray'
      }`}
    >
      <span className="text-body1 font-bold w-[120px] shrink-0 whitespace-nowrap">
        {entry.startTime} ~ {entry.endTime}
      </span>
      <span className="text-body1 font-medium flex-1">{entry.name}</span>
    </div>
  );
}
