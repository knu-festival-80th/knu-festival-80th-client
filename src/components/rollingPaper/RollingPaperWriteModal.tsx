import { useEffect, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { ArrowLeft, Circle, Minus, Plus, X } from 'lucide-react';
import {
  ROLLING_PAPER_DEFAULT_MESSAGE,
  ROLLING_PAPER_MAX_MESSAGE_LENGTH,
  ROLLING_PAPER_STICKER_COLORS,
  type RollingPaperStickerColorId,
} from '@/constants/rollingPaper';
import {
  ROLLING_PAPER_CANVAS_DIMENSIONS,
  ROLLING_PAPER_MAX_NOTES_PER_BOARD,
  ROLLING_PAPER_NOTE_WIDTH,
  ROLLING_PAPER_PREVIEW_VIEWPORT,
  ROLLING_PAPER_ZOOM,
  clampRollingPaperPan,
  clampRollingPaperScale,
  clampRollingPaperPlacement,
  findNearestAvailableRollingPaperPlacement,
  getRollingPaperBlockedFrameRect,
  getPlacedNotesForBoard,
  getRollingPaperFitScale,
  getRollingPaperFrameRect,
  type RollingPaperPan,
  type PlacedRollingPaperNote,
  type RollingPaperPlacement,
} from '@/lib/rollingPaperLayout';
import { rollingPaperBoardFrames } from './rollingPaperBoardAssets';
import RollingPaperSticker from './RollingPaperSticker';

type WriteStep = 'compose' | 'place';

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

type RollingPaperWriteModalProps = {
  isOpen: boolean;
  boardVariant: number;
  placedNotes: PlacedRollingPaperNote[];
  onClose: () => void;
  onPlace: (note: PlacedRollingPaperNote) => void;
};

const stickerPreviewClassNames: Record<RollingPaperStickerColorId, string> = {
  red: 'w-8',
  yellow: 'w-8',
  green: 'w-6',
  blue: 'w-10',
  purple: 'w-8',
  pink: 'w-8',
};

const previewFitScale = getRollingPaperFitScale(
  ROLLING_PAPER_PREVIEW_VIEWPORT.width,
  ROLLING_PAPER_PREVIEW_VIEWPORT.height,
);

function createNoteId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getDistance(firstPoint: PointerSnapshot, secondPoint: PointerSnapshot) {
  return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
}

function getMidpoint(firstPoint: PointerSnapshot, secondPoint: PointerSnapshot) {
  return {
    x: (firstPoint.x + secondPoint.x) / 2,
    y: (firstPoint.y + secondPoint.y) / 2,
  };
}

function ModalHeader({
  step,
  onBack,
  onClose,
}: {
  step: WriteStep;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex h-[30px] items-center justify-between px-5">
      <button
        type="button"
        aria-label={step === 'compose' ? '작성 모달 닫기' : '메시지 작성으로 돌아가기'}
        className="flex size-[30px] items-center justify-center text-black"
        onClick={onBack}
      >
        <ArrowLeft className="size-6" />
      </button>
      <h2 className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.02em] text-black">
        메세지 작성하기
      </h2>
      <button
        type="button"
        aria-label="작성 모달 닫기"
        className="flex size-[30px] items-center justify-center text-black"
        onClick={onClose}
      >
        <X className="size-6" />
      </button>
    </div>
  );
}

function StickerColorPicker({
  selectedColorId,
  onSelect,
}: {
  selectedColorId: RollingPaperStickerColorId;
  onSelect: (colorId: RollingPaperStickerColorId) => void;
}) {
  return (
    <div className="flex flex-col gap-3 px-6">
      <p className="font-wanted-sans text-[16px] font-semibold leading-none tracking-[-0.02em] text-black">
        포스트잇
      </p>
      <div className="flex items-center justify-between gap-2">
        {ROLLING_PAPER_STICKER_COLORS.map((color) => {
          const isSelected = selectedColorId === color.id;

          return (
            <button
              key={color.id}
              type="button"
              aria-label={`${color.label} 포스트잇 선택`}
              aria-pressed={isSelected}
              className={`flex size-10 items-center justify-center rounded-xl border bg-white transition ${
                isSelected
                  ? 'border-sub-red shadow-[0_0_0_2px_rgba(255,61,61,0.14)]'
                  : 'border-black/10'
              }`}
              onClick={() => onSelect(color.id)}
            >
              <RollingPaperSticker
                colorId={color.id}
                message=""
                hideText
                className={stickerPreviewClassNames[color.id]}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ComposeStep({
  message,
  colorId,
  onMessageChange,
  onColorChange,
  onNext,
}: {
  message: string;
  colorId: RollingPaperStickerColorId;
  onMessageChange: (message: string) => void;
  onColorChange: (colorId: RollingPaperStickerColorId) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="relative mt-4 h-[360px] w-[266px] overflow-hidden">
        <RollingPaperSticker
          colorId={colorId}
          message={message}
          className="absolute left-1/2 top-1/2 w-[230px] -translate-x-1/2 -translate-y-1/2"
        >
          <textarea
            aria-label="롤링페이퍼 메시지"
            value={message}
            maxLength={ROLLING_PAPER_MAX_MESSAGE_LENGTH}
            className="h-full w-full resize-none bg-transparent p-0 text-center font-wanted-sans text-[inherit] font-medium leading-[inherit] tracking-[-0.03em] text-black outline-none placeholder:text-black/35"
            placeholder="축하 메시지를 남겨주세요"
            onChange={(event) =>
              onMessageChange(event.target.value.slice(0, ROLLING_PAPER_MAX_MESSAGE_LENGTH))
            }
          />
        </RollingPaperSticker>
        <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 font-wanted-sans text-[12px] font-medium leading-none text-white">
          {message.length} / {ROLLING_PAPER_MAX_MESSAGE_LENGTH}
        </div>
      </div>

      <div className="mt-3 w-full">
        <StickerColorPicker selectedColorId={colorId} onSelect={onColorChange} />
      </div>

      <button
        type="button"
        className="mt-auto h-[50px] w-[287px] rounded-lg bg-[#ff3d3d] font-wanted-sans text-[16px] font-medium leading-none text-white disabled:bg-gray/40"
        disabled={!message.trim()}
        onClick={onNext}
      >
        다음으로
      </button>
    </div>
  );
}

function PlacementPreview({
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
}: {
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
}) {
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

function PlaceStep({
  boardVariant,
  colorId,
  message,
  occupiedNotes,
  selectedPlacement,
  scale,
  pan,
  onPlacementChange,
  onScaleChange,
  onPanChange,
  onPlaceDisabled,
  onPlace,
}: {
  boardVariant: number;
  colorId: RollingPaperStickerColorId;
  message: string;
  occupiedNotes: PlacedRollingPaperNote[];
  selectedPlacement: RollingPaperPlacement | null;
  scale: number;
  pan: RollingPaperPan;
  onPlacementChange: (placement: RollingPaperPlacement) => void;
  onScaleChange: (scale: number) => void;
  onPanChange: (pan: RollingPaperPan) => void;
  onPlaceDisabled: boolean;
  onPlace: () => void;
}) {
  const remainingCount = ROLLING_PAPER_MAX_NOTES_PER_BOARD - occupiedNotes.length;

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mt-4">
        <PlacementPreview
          boardVariant={boardVariant}
          colorId={colorId}
          message={message}
          occupiedNotes={occupiedNotes}
          selectedPlacement={selectedPlacement}
          scale={scale}
          pan={pan}
          onPlacementChange={onPlacementChange}
          onPanChange={onPanChange}
          onScaleChange={onScaleChange}
        />
      </div>

      <p className="mt-4 font-wanted-sans text-[13px] font-medium leading-none tracking-[-0.02em] text-gray">
        남은 포스트잇 {remainingCount} / {ROLLING_PAPER_MAX_NOTES_PER_BOARD}
      </p>
      <p className="mt-2 font-wanted-sans text-[12px] font-medium leading-[1.4] tracking-[-0.02em] text-gray/80">
        한 손가락으로 포스트잇 위치를 정하고, 두 손가락으로 확대/축소와 화면 이동을 할 수 있어요
      </p>

      <div className="mt-5 flex w-[287px] gap-3">
        <PlacementControlButton
          icon={<Minus className="size-5" />}
          label="축소"
          disabled={scale <= ROLLING_PAPER_ZOOM.min}
          onClick={() => {
            const nextScale = clampRollingPaperScale(scale - ROLLING_PAPER_ZOOM.step);
            onScaleChange(nextScale);
            onPanChange(
              clampRollingPaperPan(
                pan,
                ROLLING_PAPER_PREVIEW_VIEWPORT.width,
                ROLLING_PAPER_PREVIEW_VIEWPORT.height,
                nextScale,
              ),
            );
          }}
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
          onClick={() => {
            const nextScale = clampRollingPaperScale(scale + ROLLING_PAPER_ZOOM.step);
            onScaleChange(nextScale);
            onPanChange(
              clampRollingPaperPan(
                pan,
                ROLLING_PAPER_PREVIEW_VIEWPORT.width,
                ROLLING_PAPER_PREVIEW_VIEWPORT.height,
                nextScale,
              ),
            );
          }}
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
        {remainingCount === 0 ? '보드가 가득 찼어요' : '롤링페이퍼 붙이기'}
      </button>
    </div>
  );
}

export default function RollingPaperWriteModal({
  isOpen,
  boardVariant,
  placedNotes,
  onClose,
  onPlace,
}: RollingPaperWriteModalProps) {
  const [step, setStep] = useState<WriteStep>('compose');
  const [message, setMessage] = useState(ROLLING_PAPER_DEFAULT_MESSAGE);
  const [colorId, setColorId] = useState<RollingPaperStickerColorId>('red');
  const [requestedPlacement, setRequestedPlacement] = useState<RollingPaperPlacement>({
    x: 50,
    y: 50,
  });
  const [scale, setScale] = useState<number>(ROLLING_PAPER_ZOOM.default);
  const [pan, setPan] = useState<RollingPaperPan>({ x: 0, y: 0 });

  const occupiedNotes = getPlacedNotesForBoard(placedNotes, boardVariant);
  const selectedPlacement = findNearestAvailableRollingPaperPlacement(
    requestedPlacement,
    colorId,
    occupiedNotes,
    boardVariant,
  );

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const trimmedMessage = message.trim();

  const handlePlace = () => {
    if (!trimmedMessage || !selectedPlacement) return;

    onPlace({
      id: createNoteId(),
      message: trimmedMessage,
      colorId,
      x: selectedPlacement.x,
      y: selectedPlacement.y,
      boardVariant,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rolling-paper-write-title"
      className="fixed inset-0 z-[100] flex justify-center overflow-y-auto bg-black/30 px-5 pt-[101px] pb-10"
    >
      <div className="flex h-[612px] w-full max-w-[335px] flex-col overflow-hidden rounded-xl bg-white pt-4 pb-6 shadow-[0_16px_60px_rgba(0,0,0,0.2)]">
        <ModalHeader
          step={step}
          onBack={() => {
            if (step === 'compose') {
              onClose();
              return;
            }

            setStep('compose');
          }}
          onClose={onClose}
        />
        <span id="rolling-paper-write-title" className="sr-only">
          롤링페이퍼 메시지 작성
        </span>

        {step === 'compose' ? (
          <ComposeStep
            message={message}
            colorId={colorId}
            onMessageChange={setMessage}
            onColorChange={setColorId}
            onNext={() => {
              setRequestedPlacement({ x: 50, y: 50 });
              setScale(ROLLING_PAPER_ZOOM.default);
              setPan({ x: 0, y: 0 });
              setStep('place');
            }}
          />
        ) : (
          <PlaceStep
            boardVariant={boardVariant}
            colorId={colorId}
            message={trimmedMessage}
            occupiedNotes={occupiedNotes}
            selectedPlacement={selectedPlacement}
            scale={scale}
            pan={pan}
            onPlacementChange={setRequestedPlacement}
            onScaleChange={setScale}
            onPanChange={setPan}
            onPlaceDisabled={
              !selectedPlacement || occupiedNotes.length >= ROLLING_PAPER_MAX_NOTES_PER_BOARD
            }
            onPlace={handlePlace}
          />
        )}
      </div>
    </div>
  );
}
