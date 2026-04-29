type DateTabBarProps = {
  days: number[];
  selectedDay: number;
  onSelect: (day: number) => void;
};

export default function DateTabBar({ days, selectedDay, onSelect }: DateTabBarProps) {
  return (
    <div className="flex items-center gap-6">
      {days.map((day) => {
        const isSelected = day === selectedDay;
        return (
          <button
            key={day}
            onClick={() => onSelect(day)}
            className={`text-body1 transition-colors duration-300 ${
              isSelected ? 'font-bold text-primary' : 'font-medium text-text-muted'
            }`}
          >
            5.{day}
          </button>
        );
      })}
    </div>
  );
}
