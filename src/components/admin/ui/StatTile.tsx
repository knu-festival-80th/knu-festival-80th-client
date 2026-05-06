interface StatTileProps {
  label: string;
  value: number;
  color: string;
}

export default function StatTile({ label, value, color }: StatTileProps) {
  return (
    <div
      className="flex flex-col gap-0.5 rounded-xl p-3"
      style={{ backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)` }}
    >
      <span className="text-xs font-medium" style={{ color }}>
        {label}
      </span>
      <span className="tabular text-2xl font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
