import { useEffect, useRef, useState } from 'react';
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
  const pressFeedbackTimeoutRef = useRef<number | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const progress = Math.min(1, noteCount / Math.max(1, channel.capacity));
  const progressDegree = Math.round(progress * 360);
  const isFull = noteCount >= channel.capacity;
  const isPressFeedbackVisible = isPressed && !isFull;
  const isRedState = isFull || isPressFeedbackVisible;
  const labelNumber = channel.label.replace(/[^0-9]/g, '').padStart(2, '0') || '01';
  const cardClassName = isRedState
    ? 'border-sub-red bg-sub-red text-white'
    : isActive
      ? 'border-sub-red bg-white text-black'
      : 'border-border bg-white text-black hover:border-sub-red/50';
  const labelClassName = isRedState ? 'text-white' : isActive ? 'text-sub-red' : 'text-black';

  const showPressFeedback = () => {
    if (pressFeedbackTimeoutRef.current) {
      window.clearTimeout(pressFeedbackTimeoutRef.current);
    }

    setIsPressed(true);
  };

  const hidePressFeedback = () => {
    if (pressFeedbackTimeoutRef.current) {
      window.clearTimeout(pressFeedbackTimeoutRef.current);
    }

    pressFeedbackTimeoutRef.current = window.setTimeout(() => {
      setIsPressed(false);
      pressFeedbackTimeoutRef.current = null;
    }, 140);
  };

  useEffect(() => {
    return () => {
      if (pressFeedbackTimeoutRef.current) {
        window.clearTimeout(pressFeedbackTimeoutRef.current);
      }
    };
  }, []);

  return (
    <button
      type="button"
      className={`flex h-[127px] w-full flex-col gap-4 rounded-xl border px-3 py-3.5 text-left transition ${cardClassName}`}
      onPointerDown={showPressFeedback}
      onPointerUp={hidePressFeedback}
      onPointerLeave={hidePressFeedback}
      onPointerCancel={hidePressFeedback}
      onBlur={() => setIsPressed(false)}
      onClick={onClick}
    >
      <span
        className={`flex w-full items-center gap-1 font-wanted-sans text-caption font-bold leading-none tracking-[-0.02em] ${
          labelClassName
        }`}
      >
        <span>BOR</span>
        <span>·</span>
        <span>{labelNumber}</span>
        {isActive && !isRedState && (
          <span className="ml-auto rounded-full bg-sub-red px-1.5 py-[3px] text-[10px] font-bold leading-none text-white">
            현재
          </span>
        )}
      </span>
      <span
        className="mx-auto flex size-[67px] items-center justify-center rounded-full"
        style={{
          background: isRedState
            ? `conic-gradient(#fff 0deg ${progressDegree}deg, rgba(255,255,255,0.35) ${progressDegree}deg 360deg)`
            : `conic-gradient(#ff3d3d 0deg ${Math.min(progressDegree, 70)}deg, #ff8a2a ${Math.min(progressDegree, 70)}deg ${progressDegree}deg, #e5e5e5 ${progressDegree}deg 360deg)`,
        }}
        aria-hidden="true"
      >
        <span
          className={`flex size-[55px] flex-col items-center justify-center rounded-full ${isRedState ? 'bg-sub-red' : 'bg-white'}`}
        >
          <span className="font-wanted-sans text-[20px] font-bold leading-none tracking-[-0.02em]">
            {noteCount}
          </span>
          <span
            className={`font-wanted-sans text-[10px] font-normal leading-none tracking-[-0.02em] ${isRedState ? 'text-white' : 'text-[#999]'}`}
          >
            /{channel.capacity}
          </span>
        </span>
      </span>
    </button>
  );
}
