import type { ReactNode } from 'react';
import { Circle, Minus, Plus } from 'lucide-react';
import type { RollingPaperStickerColorId } from '@/constants/rollingPaper';
import {
  ROLLING_PAPER_MAX_NOTES_PER_BOARD,
  ROLLING_PAPER_PREVIEW_VIEWPORT,
  ROLLING_PAPER_ZOOM,
  clampRollingPaperPan,
  clampRollingPaperScale,
  type PlacedRollingPaperNote,
  type RollingPaperPan,
  type RollingPaperPlacement,
} from '@/lib/rollingPaperLayout';
import RollingPaperWritePlacementPreview from './RollingPaperWritePlacementPreview';

type RollingPaperWritePlaceStepProps = {
  boardVariant: number;
  colorId: RollingPaperStickerColorId;
  message: string;
  occupiedNotes: PlacedRollingPaperNote[];
  selectedPlacement: RollingPaperPlacement | null;
  isPlacementAvailable: boolean;
  scale: number;
  pan: RollingPaperPan;
  onPlacementChange: (placement: RollingPaperPlacement) => void;
  onScaleChange: (scale: number) => void;
  onPanChange: (pan: RollingPaperPan) => void;
  onPlaceDisabled: boolean;
  isSubmitting?: boolean;
  onPlace: () => void;
};

function PlacementControlButton({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`flex h-10 flex-1 items-center justify-center gap-1 rounded-full border font-wanted-sans text-[14px] font-medium leading-none transition ${
        disabled
          ? 'cursor-not-allowed border-[#f0f0f0] bg-[#fafafa] text-black/30'
          : 'border-[#e5e5e5] bg-white text-black'
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function RollingPaperWritePlaceStep({
  boardVariant,
  colorId,
  message,
  occupiedNotes,
  selectedPlacement,
  isPlacementAvailable,
  scale,
  pan,
  onPlacementChange,
  onScaleChange,
  onPanChange,
  onPlaceDisabled,
  isSubmitting = false,
  onPlace,
}: RollingPaperWritePlaceStepProps) {
  const remainingCount = ROLLING_PAPER_MAX_NOTES_PER_BOARD - occupiedNotes.length;

  const updateScale = (nextScale: number) => {
    onScaleChange(nextScale);
    onPanChange(
      clampRollingPaperPan(
        pan,
        ROLLING_PAPER_PREVIEW_VIEWPORT.width,
        ROLLING_PAPER_PREVIEW_VIEWPORT.height,
        nextScale,
      ),
    );
  };

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mt-4">
        <RollingPaperWritePlacementPreview
          boardVariant={boardVariant}
          colorId={colorId}
          message={message}
          occupiedNotes={occupiedNotes}
          selectedPlacement={selectedPlacement}
          isPlacementAvailable={isPlacementAvailable}
          scale={scale}
          pan={pan}
          onPlacementChange={onPlacementChange}
          onPanChange={onPanChange}
          onScaleChange={onScaleChange}
        />
      </div>

      <p className="mt-1 px-15 font-wanted-sans text-[10px] font-medium leading-[1.4] tracking-[-0.02em] text-gray/80">
        {isPlacementAvailable
          ? '한 손가락으로 포스트잇 위치를 정하고, 두 손가락으로 확대/축소와 화면 이동을 할 수 있어요'
          : '이미 붙은 포스트잇과 겹쳐요. 빈 위치로 옮겨주세요'}
      </p>

      <div className="mt-3 flex w-[287px] gap-3">
        <PlacementControlButton
          icon={<Minus className="size-5" />}
          label="축소"
          disabled={scale <= ROLLING_PAPER_ZOOM.min}
          onClick={() => updateScale(clampRollingPaperScale(scale - ROLLING_PAPER_ZOOM.step))}
        />
        <PlacementControlButton
          icon={<Circle className="size-5" />}
          label="원점"
          disabled={scale === ROLLING_PAPER_ZOOM.default && pan.x === 0 && pan.y === 0}
          onClick={() => {
            onScaleChange(ROLLING_PAPER_ZOOM.default);
            onPanChange({ x: 0, y: 0 });
          }}
        />
        <PlacementControlButton
          icon={<Plus className="size-5" />}
          label="확대"
          disabled={scale >= ROLLING_PAPER_ZOOM.max}
          onClick={() => updateScale(clampRollingPaperScale(scale + ROLLING_PAPER_ZOOM.step))}
        />
      </div>

      <button
        type="button"
        className={`mt-auto h-[50px] w-[287px] rounded-lg font-wanted-sans text-[16px] font-medium leading-none text-white transition ${
          onPlaceDisabled ? 'cursor-not-allowed bg-gray/40' : 'bg-[#ff3d3d]'
        }`}
        disabled={onPlaceDisabled}
        onClick={onPlace}
      >
        {isSubmitting
          ? '붙이는 중이에요'
          : remainingCount === 0
            ? '보드가 가득 찼어요'
            : '롤링페이퍼 붙이기'}
      </button>
    </div>
  );
}
