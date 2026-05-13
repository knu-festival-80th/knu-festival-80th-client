import type { ScheduleEntry } from '@/types/home';

type ScheduleItemProps = {
  entry: ScheduleEntry;
};

export default function ScheduleItem({ entry }: ScheduleItemProps) {
  const colorClass = entry.isActive ? 'text-sub-red' : 'text-gray';

  return (
    <div className={`flex items-start gap-3 ml-10 ${colorClass}`}>
      <div className="flex w-[60px] shrink-0 flex-col text-body2 font-bold">
        <span>{entry.startTime} ~ </span>
        <span>{entry.endTime}</span>
      </div>
      <span className="flex-1 text-body2 whitespace-pre-line">{entry.name}</span>
    </div>
  );
}
