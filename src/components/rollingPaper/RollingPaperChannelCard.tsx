import type { RollingPaperChannel } from '@/constants/rollingPaper';

type RollingPaperChannelCardProps = {
  channel: RollingPaperChannel;
  noteCount?: number;
  isActive?: boolean;
  onClick?: () => void;
};

export default function RollingPaperChannelCard({
  channel,
  noteCount = channel.noteCount,
  isActive = false,
  onClick,
}: RollingPaperChannelCardProps) {
  const progress = Math.min(1, noteCount / channel.capacity);
  const progressDegree = `${Math.round(progress * 360)}deg`;

  return (
    <button
      type="button"
      className={`flex h-[137px] w-full flex-col items-center justify-between rounded-sm border px-2 py-6 text-center transition ${
        isActive
          ? 'border-sub-red bg-white shadow-[0_8px_18px_rgba(255,61,61,0.16)]'
          : 'border-transparent bg-[#d9d9d9] hover:bg-[#d0d0d0]'
      }`}
      onClick={onClick}
    >
      <span className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.02em] text-black">
        {channel.label}
      </span>
      <span
        className="flex size-11 items-center justify-center rounded-full bg-black"
        style={{
          background: `conic-gradient(#000 ${progressDegree}, transparent ${progressDegree})`,
        }}
        aria-hidden="true"
      >
        <span className="size-[34px] rounded-full bg-[#d9d9d9]" />
      </span>
      <span className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.02em] text-black tabular">
        {noteCount}/{channel.capacity}
      </span>
    </button>
  );
}
