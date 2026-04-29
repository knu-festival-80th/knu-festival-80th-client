import { useState } from 'react';
import DateTabBar from '@/components/timetable/DateTabBar';

const DAYS = [20, 21, 22];

export default function TimeTablePage() {
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);

  return (
    <div className="bg-surface flex flex-col min-h-dvh px-5 pt-16 pb-16">
      <h1 className="text-heading1">Time Table</h1>
      <div className="mt-6">
        <DateTabBar days={DAYS} selectedDay={selectedDay} onSelect={setSelectedDay} />
      </div>
    </div>
  );
}
