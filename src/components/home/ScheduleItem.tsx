import type { ScheduleEntry } from '@/types/home';

type ScheduleItemProps = {
  entry: ScheduleEntry;
};

export default function ScheduleItem({ entry }: ScheduleItemProps) {
  const colorClass = entry.isActive ? 'text-primary' : 'text-text-muted';

  return (
    <div className={`flex w-[235px] shrink-0 h-9.5 items-start justify-between ${colorClass}`}>
      <span className="text-body2">{entry.name}</span>
      <span className="flex flex-col text-right text-body2 font-bold">
        <span className="pr-3">{entry.startTime}</span>
        <span>~ {entry.endTime}</span>
      </span>
    </div>
  );
}
