import type { DayLineup } from '@/types/home';
import LineupImageCarousel from '@/components/home/LineupImageCarousel';
import TimeTableScheduleItem from './TimeTableScheduleItem';

type DayScheduleBlockProps = {
  data: DayLineup;
  description: string;
};

export default function DayScheduleBlock({ data, description }: DayScheduleBlockProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="px-5">
        <LineupImageCarousel artists={data.artists} />
      </div>
      <div className="flex flex-col gap-1 px-5">
        <h2 className="text-subheading font-bold text-ink">DAY {data.day - 19}</h2>
        <p className="text-body2 text-text-muted whitespace-pre-line">{description}</p>
      </div>
      <div className="mx-5 rounded-lg overflow-hidden bg-primary/5">
        {data.schedules.map((entry, index) => (
          <div key={entry.name}>
            {index !== 0 && <div className="mx-4" />}
            <TimeTableScheduleItem entry={entry} />
          </div>
        ))}
      </div>
    </div>
  );
}
