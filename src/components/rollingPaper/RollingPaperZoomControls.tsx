import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { Circle, Minus, Plus } from 'lucide-react';
import {
  ROLLING_PAPER_ZOOM,
  clampRollingPaperScale,
  type RollingPaperPan,
} from '@/lib/rollingPaperLayout';

type RollingPaperZoomControlsProps = {
  scale: number;
  pan: RollingPaperPan;
  onScaleChange: Dispatch<SetStateAction<number>>;
  onPanChange: (pan: RollingPaperPan) => void;
  onResetView?: () => void;
};

type ControlButtonProps = {
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
};

function ControlButton({ icon, label, disabled = false, onClick }: ControlButtonProps) {
  return (
    <button
      type="button"
      className={`flex flex-1 items-center justify-center gap-1 rounded-full border px-4 py-2.5 font-wanted-sans text-sm font-medium leading-[1.5] backdrop-blur-[2px] transition ${
        disabled
          ? 'cursor-not-allowed border-black/5 bg-black/[0.02] text-ink/35'
          : 'border-black/10 bg-black/[0.03] text-ink'
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function RollingPaperZoomControls({
  scale,
  pan,
  onScaleChange,
  onPanChange,
  onResetView,
}: RollingPaperZoomControlsProps) {
  return (
    <>
      <div className="mt-[20px] flex justify-center gap-3 px-5">
        <ControlButton
          icon={<Minus className="size-5" />}
          label="축소"
          disabled={scale <= ROLLING_PAPER_ZOOM.min}
          onClick={() => {
            onScaleChange((prevScale) =>
              clampRollingPaperScale(prevScale - ROLLING_PAPER_ZOOM.step),
            );
          }}
        />
        <ControlButton
          icon={<Circle className="size-5" />}
          label="원점"
          disabled={scale === ROLLING_PAPER_ZOOM.default && pan.x === 0 && pan.y === 0}
          onClick={() => {
            if (onResetView) {
              onResetView();
              return;
            }

            onScaleChange(ROLLING_PAPER_ZOOM.default);
            onPanChange({ x: 0, y: 0 });
          }}
        />
        <ControlButton
          icon={<Plus className="size-5" />}
          label="확대"
          disabled={scale >= ROLLING_PAPER_ZOOM.max}
          onClick={() => {
            onScaleChange((prevScale) =>
              clampRollingPaperScale(prevScale + ROLLING_PAPER_ZOOM.step),
            );
          }}
        />
      </div>
      <p className="mt-3 px-5 text-center font-wanted-sans text-[12px] font-medium leading-[1.4] tracking-[-0.02em] text-gray/80">
        포스트잇을 누르면 해당 메시지로 확대되고, 두 손가락으로 확대/축소할 수 있어요
      </p>
    </>
  );
}
