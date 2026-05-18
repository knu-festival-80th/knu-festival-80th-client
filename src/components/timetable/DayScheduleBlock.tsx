import type { DayLineup } from '@/types/home';
import LineupImageCarousel from '@/components/home/LineupImageCarousel';
import TimeTableScheduleItem from './TimeTableScheduleItem';

type DayScheduleBlockProps = {
  data: DayLineup;
};

export default function DayScheduleBlock({ data }: DayScheduleBlockProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="px-5">
        <LineupImageCarousel artists={data.artists} />
      </div>
      <div className="px-5">
        <h2 className="text-heading2 font-black text-ink">DAY {data.day - 19}</h2>
      </div>
      <div className="mx-5 rounded-lg overflow-hidden bg-sub-red/2">
        {data.schedules.map((entry, index) => (
          <div key={entry.name}>
            {index !== 0 && <div className="mx-4" />}
            <TimeTableScheduleItem entry={entry} day={data.day} />
          </div>
        ))}
      </div>
    </div>
  );
}
