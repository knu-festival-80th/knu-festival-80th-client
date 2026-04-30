import { useState } from 'react';
import DateTabBar from '@/components/timetable/DateTabBar';
import DayScheduleBlock from '@/components/timetable/DayScheduleBlock';
import { MOCK_LINEUP } from '@/mocks/home';

const DAYS = [20, 21, 22];

const DAY_DESCRIPTIONS: Record<number, string> = {
  20: '축제의 문이 열립니다.\n모든 주막과 공연이 시작됩니다.',
  21: '대동제의 열기가 가득한 날.\n더욱 다양한 공연이 펼쳐집니다.',
  22: '80주년 대동제의 마지막 날.\n모두 함께 축제의 마무리를 함께해요.',
};

export default function TimeTablePage() {
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const dayData = MOCK_LINEUP.find((d) => d.day === selectedDay) ?? MOCK_LINEUP[0];

  return (
    <div className="bg-surface flex flex-col min-h-dvh pb-16">
      <div className="px-5 pt-5 pb-10">
        <h1 className="text-body1 font-bold text-ink">Time Table</h1>
        <div className="mt-3">
          <DateTabBar days={DAYS} selectedDay={selectedDay} onSelect={setSelectedDay} />
        </div>
      </div>
      <DayScheduleBlock
        key={selectedDay}
        data={dayData}
        description={DAY_DESCRIPTIONS[selectedDay]}
      />
    </div>
  );
}
