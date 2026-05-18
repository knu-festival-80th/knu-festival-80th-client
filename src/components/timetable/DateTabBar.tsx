type DateTabBarProps = {
  days: number[];
  selectedDay: number;
  onSelect: (day: number) => void;
  disabledDays?: number[];
};

export default function DateTabBar({
  days,
  selectedDay,
  onSelect,
  disabledDays = [],
}: DateTabBarProps) {
  return (
    <div className="flex items-center gap-6">
      {days.map((day) => {
        const isSelected = day === selectedDay;
        const isDisabled = disabledDays.includes(day);
        return (
          <button
            key={day}
            onClick={() => !isDisabled && onSelect(day)}
            disabled={isDisabled}
            className={`text-body1 transition-colors duration-300 ${
              isDisabled
                ? 'font-normal text-text-disabled cursor-default'
                : isSelected
                  ? 'font-bold text-sub-red'
                  : 'font-normal text-ink'
            }`}
          >
            5.{day}
          </button>
        );
      })}
    </div>
  );
}
