import { useEffect, useId, useRef, useState } from 'react';
import type { RollingPaperChannel } from '@/constants/rollingPaper';

const PROGRESS_SIZE = 67;
const PROGRESS_CENTER = PROGRESS_SIZE / 2;
const PROGRESS_STROKE_WIDTH = 5;
const PROGRESS_RADIUS = 30;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;
const PROGRESS_MAX_SWEEP_RATIO = 1;
const PROGRESS_START_ANGLE = -85;

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
  const progressGradientId = useId().replace(/:/g, '');
  const [isPressed, setIsPressed] = useState(false);
  const progress = Math.min(1, noteCount / Math.max(1, channel.capacity));
  const progressDashLength = PROGRESS_CIRCUMFERENCE * progress * PROGRESS_MAX_SWEEP_RATIO;
  const progressDashGap = PROGRESS_CIRCUMFERENCE - progressDashLength;
  const isFull = noteCount >= channel.capacity;
  const isPressFeedbackVisible = isPressed && !isFull;
  const isRedState = isPressFeedbackVisible;
  const labelNumber = channel.label.replace(/[^0-9]/g, '').padStart(2, '0') || '01';
  const cardClassName = isRedState
    ? 'border-sub-red bg-sub-red text-white'
    : isActive
      ? 'border-sub-red bg-white text-black'
      : 'border-border bg-white text-black hover:border-sub-red/50';
  const labelClassName = isRedState ? 'text-white' : isActive ? 'text-sub-red' : 'text-[#4d4d4d]';

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
        className="relative mx-auto flex size-[67px] items-center justify-center"
        aria-hidden="true"
      >
        <svg
          className="absolute inset-0 size-full"
          viewBox={`0 0 ${PROGRESS_SIZE} ${PROGRESS_SIZE}`}
          fill="none"
        >
          <circle
            cx={PROGRESS_CENTER}
            cy={PROGRESS_CENTER}
            r={PROGRESS_RADIUS}
            stroke={isRedState ? 'rgba(255,255,255,0.35)' : '#e5e5e5'}
            strokeWidth={PROGRESS_STROKE_WIDTH}
          />
          {progressDashLength > 0 && (
            <circle
              cx={PROGRESS_CENTER}
              cy={PROGRESS_CENTER}
              r={PROGRESS_RADIUS}
              stroke={isRedState ? '#fff' : `url(#${progressGradientId})`}
              strokeWidth={PROGRESS_STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={`${progressDashLength} ${progressDashGap}`}
              transform={`rotate(${PROGRESS_START_ANGLE} ${PROGRESS_CENTER} ${PROGRESS_CENTER})`}
            />
          )}
          <defs>
            <linearGradient
              id={progressGradientId}
              x1={PROGRESS_CENTER}
              y1="0"
              x2={PROGRESS_CENTER}
              y2={PROGRESS_SIZE}
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#ff3d3d" />
              <stop offset="1" stopColor="#ff8a2a" />
            </linearGradient>
          </defs>
        </svg>
        <span className="relative flex flex-col items-center justify-center">
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
