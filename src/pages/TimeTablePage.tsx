import { useState } from 'react';
import DateTabBar from '@/components/timetable/DateTabBar';
import DayScheduleBlock from '@/components/timetable/DayScheduleBlock';
import Day20Placeholder from '@/components/timetable/Day20Placeholder';
import PerformanceLocationSection from '@/components/timetable/PerformanceLocationSection';
import { MOCK_LINEUP } from '@/mocks/home';
import { getNow } from '@/utils/time';

const DAYS = [20, 21, 22];

function getDefaultDay() {
  const today = getNow().getDate();
  return DAYS.includes(today) ? today : 20;
}

export default function TimeTablePage() {
  const [selectedDay, setSelectedDay] = useState(getDefaultDay);
  const dayData = MOCK_LINEUP.find((d) => d.day === selectedDay) ?? MOCK_LINEUP[0];

  return (
    <div className="bg-surface flex flex-col min-h-dvh pb-16">
      <div className="px-5 pt-5 pb-10">
        <h1 className="text-body1 font-bold text-ink">Time Table</h1>
        <div className="mt-3">
          <DateTabBar days={DAYS} selectedDay={selectedDay} onSelect={setSelectedDay} />
        </div>
      </div>
      {selectedDay === 20 ? (
        <Day20Placeholder />
      ) : (
        <DayScheduleBlock key={selectedDay} data={dayData} />
      )}
      <PerformanceLocationSection />
    </div>
  );
}
