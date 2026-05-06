type TavernMetricProps = {
  label: string;
  value: number;
  suffix: string;
};

export default function TavernMetric({ label, value, suffix }: TavernMetricProps) {
  return (
    <div className="rounded-[8px] bg-[#f9f9f9] p-4">
      <p className="text-[14px] font-medium leading-[1.6] tracking-[-0.28px] text-[#808080]">
        {label}
      </p>
      <div className="flex items-end gap-1">
        <strong className="text-[28px] font-bold leading-[1.4] tracking-[-0.56px] text-[#ff3d3d]">
          {value}
        </strong>
        <span className="pb-1 text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
          {suffix}
        </span>
      </div>
    </div>
  );
}
