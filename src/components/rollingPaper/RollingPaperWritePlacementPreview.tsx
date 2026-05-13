import { useRef } from 'react';
import type { PointerEvent } from 'react';
import type { RollingPaperStickerColorId } from '@/constants/rollingPaper';
import {
  ROLLING_PAPER_CANVAS_DIMENSIONS,
  ROLLING_PAPER_NOTE_WIDTH,
  ROLLING_PAPER_PREVIEW_VIEWPORT,
  clampRollingPaperPan,
  clampRollingPaperPlacement,
  clampRollingPaperScale,
  getRollingPaperBlockedFrameRect,
  getRollingPaperFitScale,
  getRollingPaperFrameRect,
  type PlacedRollingPaperNote,
  type RollingPaperPan,
  type RollingPaperPlacement,
} from '@/lib/rollingPaperLayout';
import { rollingPaperBoardFrames } from './rollingPaperBoardAssets';
import RollingPaperSticker from './RollingPaperSticker';

type PointerSnapshot = {
  x: number;
  y: number;
};

type CanvasPoint = {
  x: number;
  y: number;
};

type PinchGestureSnapshot = {
  anchorCanvasPoint: CanvasPoint;
  startDistance: number;
  startScale: number;
};

type RollingPaperWritePlacementPreviewProps = {
  boardVariant: number;
  colorId: RollingPaperStickerColorId;
  message: string;
  occupiedNotes: PlacedRollingPaperNote[];
  selectedPlacement: RollingPaperPlacement | null;
  scale: number;
  pan: RollingPaperPan;
  onPlacementChange: (placement: RollingPaperPlacement) => void;
  onPanChange: (pan: RollingPaperPan) => void;
  onScaleChange: (scale: number) => void;
};

const previewFitScale = getRollingPaperFitScale(
  ROLLING_PAPER_PREVIEW_VIEWPORT.width,
  ROLLING_PAPER_PREVIEW_VIEWPORT.height,
);

function getDistance(firstPoint: PointerSnapshot, secondPoint: PointerSnapshot) {
  return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
}

function getMidpoint(firstPoint: PointerSnapshot, secondPoint: PointerSnapshot) {
  return {
    x: (firstPoint.x + secondPoint.x) / 2,
    y: (firstPoint.y + secondPoint.y) / 2,
  };
}

export default function RollingPaperWritePlacementPreview({
  boardVariant,
  colorId,
  message,
  occupiedNotes,
  selectedPlacement,
  scale,
  pan,
  onPlacementChange,
  onPanChange,
  onScaleChange,
}: RollingPaperWritePlacementPreviewProps) {
  const previewRef = useRef<HTMLButtonElement>(null);
  const activePointersRef = useRef(new Map<number, PointerSnapshot>());
  const pinchGestureRef = useRef<PinchGestureSnapshot | null>(null);
  const frameRect = getRollingPaperFrameRect(boardVariant);
  const blockedFrameRect = getRollingPaperBlockedFrameRect(boardVariant);

  const getCanvasPointFromScreen = (
    clientX: number,
    clientY: number,
    nextScale = scale,
    nextPan = pan,
  ) => {
    const preview = previewRef.current;

    if (!preview) {
      return {
        x: ROLLING_PAPER_CANVAS_DIMENSIONS.width / 2,
        y: ROLLING_PAPER_CANVAS_DIMENSIONS.height / 2,
      };
    }

    const rect = preview.getBoundingClientRect();
    const renderedScale = previewFitScale * nextScale;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    return {
      x:
        (clientX - centerX - nextPan.x) / renderedScale + ROLLING_PAPER_CANVAS_DIMENSIONS.width / 2,
      y:
        (clientY - centerY - nextPan.y) / renderedScale +
        ROLLING_PAPER_CANVAS_DIMENSIONS.height / 2,
    };
  };

  const getPlacementFromScreen = (
    clientX: number,
    clientY: number,
    nextScale = scale,
    nextPan = pan,
  ) => {
    const canvasPoint = getCanvasPointFromScreen(clientX, clientY, nextScale, nextPan);

    return clampRollingPaperPlacement(
      {
        x: (canvasPoint.x / ROLLING_PAPER_CANVAS_DIMENSIONS.width) * 100,
        y: (canvasPoint.y / ROLLING_PAPER_CANVAS_DIMENSIONS.height) * 100,
      },
      colorId,
    );
  };

  const startPinchGesture = () => {
    const activePointers = [...activePointersRef.current.values()];

    if (activePointers.length < 2) {
      pinchGestureRef.current = null;
      return;
    }

    const [firstPointer, secondPointer] = activePointers;
    const midpoint = getMidpoint(firstPointer, secondPointer);
    const anchorCanvasPoint = getCanvasPointFromScreen(midpoint.x, midpoint.y);

    pinchGestureRef.current = {
      anchorCanvasPoint,
      startDistance: getDistance(firstPointer, secondPointer),
      startScale: scale,
    };
  };

  const handlePinchGesture = () => {
    const preview = previewRef.current;
    const activePointers = [...activePointersRef.current.values()];
    const pinchGesture = pinchGestureRef.current;

    if (!preview || activePointers.length < 2 || !pinchGesture) {
      return;
    }

    const [firstPointer, secondPointer] = activePointers;
    const midpoint = getMidpoint(firstPointer, secondPointer);
    const distance = getDistance(firstPointer, secondPointer);
    const nextScale = clampRollingPaperScale(
      pinchGesture.startScale * (distance / pinchGesture.startDistance),
    );
    const rect = preview.getBoundingClientRect();
    const renderedScale = previewFitScale * nextScale;
    const nextPan = clampRollingPaperPan(
      {
        x:
          midpoint.x -
          rect.left -
          rect.width / 2 -
          (pinchGesture.anchorCanvasPoint.x - ROLLING_PAPER_CANVAS_DIMENSIONS.width / 2) *
            renderedScale,
        y:
          midpoint.y -
          rect.top -
          rect.height / 2 -
          (pinchGesture.anchorCanvasPoint.y - ROLLING_PAPER_CANVAS_DIMENSIONS.height / 2) *
            renderedScale,
      },
      ROLLING_PAPER_PREVIEW_VIEWPORT.width,
      ROLLING_PAPER_PREVIEW_VIEWPORT.height,
      nextScale,
    );

    onScaleChange(nextScale);
    onPanChange(nextPan);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (activePointersRef.current.size === 1) {
      onPlacementChange(getPlacementFromScreen(event.clientX, event.clientY));
      return;
    }

    if (activePointersRef.current.size === 2) {
      startPinchGesture();
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!activePointersRef.current.has(event.pointerId)) {
      return;
    }

    event.preventDefault();
    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (activePointersRef.current.size === 1) {
      onPlacementChange(getPlacementFromScreen(event.clientX, event.clientY));
      return;
    }

    if (activePointersRef.current.size >= 2) {
      if (!pinchGestureRef.current) {
        startPinchGesture();
      }

      handlePinchGesture();
    }
  };

  const handlePointerRelease = (event: PointerEvent<HTMLButtonElement>) => {
    activePointersRef.current.delete(event.pointerId);

    if (activePointersRef.current.size < 2) {
      pinchGestureRef.current = null;
    }
  };

  return (
    <button
      ref={previewRef}
      type="button"
      aria-label="롤링페이퍼를 자유롭게 붙일 위치 선택"
      className="relative h-[375px] w-[287px] touch-none overflow-hidden rounded-[24px] bg-[#ececec] text-left"
      onPointerCancel={handlePointerRelease}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerRelease}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: `${ROLLING_PAPER_CANVAS_DIMENSIONS.width}px`,
          height: `${ROLLING_PAPER_CANVAS_DIMENSIONS.height}px`,
          marginLeft: `${-ROLLING_PAPER_CANVAS_DIMENSIONS.width / 2}px`,
          marginTop: `${-ROLLING_PAPER_CANVAS_DIMENSIONS.height / 2}px`,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${previewFitScale * scale})`,
          transformOrigin: 'center center',
        }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[34px] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.12)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(244,244,244,1))]" />

          <div
            className="absolute rounded-[38px] border border-dashed border-sub-red/30 bg-sub-red/[0.04]"
            style={{
              left: `${blockedFrameRect.left}px`,
              top: `${blockedFrameRect.top}px`,
              width: `${blockedFrameRect.right - blockedFrameRect.left}px`,
              height: `${blockedFrameRect.bottom - blockedFrameRect.top}px`,
            }}
          />

          <img
            src={rollingPaperBoardFrames[boardVariant] ?? rollingPaperBoardFrames[0]}
            alt=""
            className="absolute object-contain"
            style={{
              left: `${frameRect.x}px`,
              top: `${frameRect.y}px`,
              width: `${frameRect.width}px`,
              height: `${frameRect.height}px`,
            }}
          />

          {occupiedNotes.map((note) => (
            <RollingPaperSticker
              key={note.id}
              colorId={note.colorId}
              message={note.message}
              className="absolute z-20 opacity-70 saturate-75"
              style={{
                width: `${ROLLING_PAPER_NOTE_WIDTH}px`,
                left: `${note.x}%`,
                top: `${note.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {selectedPlacement && (
            <RollingPaperSticker
              colorId={colorId}
              message={message}
              className="absolute z-30"
              style={{
                width: `${ROLLING_PAPER_NOTE_WIDTH}px`,
                left: `${selectedPlacement.x}%`,
                top: `${selectedPlacement.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-black/8" />

      <div className="absolute right-3 bottom-3 z-30 h-[72px] w-[52px] rounded-[10px] border border-black/10 bg-white/84 p-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)] backdrop-blur">
        <div className="relative h-full w-full overflow-hidden rounded-[7px] bg-[#f4f4f4]">
          <div className="absolute inset-[3px] rounded-[6px] bg-white" />
          <div
            className="absolute rounded-[4px] bg-sub-red/15"
            style={{
              left: `${(blockedFrameRect.left / ROLLING_PAPER_CANVAS_DIMENSIONS.width) * 100}%`,
              top: `${(blockedFrameRect.top / ROLLING_PAPER_CANVAS_DIMENSIONS.height) * 100}%`,
              width: `${((blockedFrameRect.right - blockedFrameRect.left) / ROLLING_PAPER_CANVAS_DIMENSIONS.width) * 100}%`,
              height: `${((blockedFrameRect.bottom - blockedFrameRect.top) / ROLLING_PAPER_CANVAS_DIMENSIONS.height) * 100}%`,
            }}
          />
          <img
            src={rollingPaperBoardFrames[boardVariant] ?? rollingPaperBoardFrames[0]}
            alt=""
            className="absolute object-contain opacity-90"
            style={{
              left: `${(frameRect.x / ROLLING_PAPER_CANVAS_DIMENSIONS.width) * 100}%`,
              top: `${(frameRect.y / ROLLING_PAPER_CANVAS_DIMENSIONS.height) * 100}%`,
              width: `${(frameRect.width / ROLLING_PAPER_CANVAS_DIMENSIONS.width) * 100}%`,
              height: `${(frameRect.height / ROLLING_PAPER_CANVAS_DIMENSIONS.height) * 100}%`,
            }}
          />
          {selectedPlacement && (
            <span
              className="absolute size-2 rounded-full bg-sub-red"
              style={{
                left: `${selectedPlacement.x}%`,
                top: `${selectedPlacement.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
        </div>
      </div>
    </button>
  );
}
