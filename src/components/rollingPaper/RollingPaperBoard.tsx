import { useEffect, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Circle, Minus, Plus } from 'lucide-react';
import rollingBoardFrameMain from '@/assets/rollingPaper/rolling-board-frame-main.png';
import rollingBoardFrameTypography from '@/assets/rollingPaper/rolling-board-frame-typography.png';
import {
  ROLLING_PAPER_BOARD_VIEWPORT,
  ROLLING_PAPER_CANVAS_DIMENSIONS,
  ROLLING_PAPER_MAX_NOTES_PER_BOARD,
  ROLLING_PAPER_NOTE_WIDTH,
  ROLLING_PAPER_ZOOM,
  clampRollingPaperPan,
  clampRollingPaperScale,
  findNearestAvailableRollingPaperPlacement,
  getRollingPaperRenderedScale,
  getRollingPaperFrameRect,
  getPlacedNotesForBoard,
  type RollingPaperPan,
  type PlacedRollingPaperNote,
} from '@/lib/rollingPaperLayout';
import RollingPaperSticker from './RollingPaperSticker';
import RollingPaperTabs from './RollingPaperTabs';
import RollingPaperWriteModal from './RollingPaperWriteModal';

const boardFrames = [rollingBoardFrameMain, rollingBoardFrameTypography] as const;
const BOARD_SCALE_MODE = 'cover';

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

type DragGestureSnapshot = {
  pointerId: number;
  startPointer: PointerSnapshot;
  startPan: RollingPaperPan;
};

type BoardViewport = {
  width: number;
  height: number;
};

function getDistance(firstPoint: PointerSnapshot, secondPoint: PointerSnapshot) {
  return Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);
}

function getMidpoint(firstPoint: PointerSnapshot, secondPoint: PointerSnapshot) {
  return {
    x: (firstPoint.x + secondPoint.x) / 2,
    y: (firstPoint.y + secondPoint.y) / 2,
  };
}

function BoardCanvas({
  variant,
  scale,
  pan,
  placedNotes,
  onPanChange,
  onScaleChange,
}: {
  variant: number;
  scale: number;
  pan: RollingPaperPan;
  placedNotes: PlacedRollingPaperNote[];
  onPanChange: (pan: RollingPaperPan) => void;
  onScaleChange: (scale: number) => void;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const activePointersRef = useRef(new Map<number, PointerSnapshot>());
  const pinchGestureRef = useRef<PinchGestureSnapshot | null>(null);
  const dragGestureRef = useRef<DragGestureSnapshot | null>(null);
  const [viewport, setViewport] = useState<BoardViewport>(ROLLING_PAPER_BOARD_VIEWPORT);
  const boardNotes = getPlacedNotesForBoard(placedNotes, variant);
  const renderedScale = getRollingPaperRenderedScale(
    viewport.width,
    viewport.height,
    scale,
    BOARD_SCALE_MODE,
  );
  const frameRect = getRollingPaperFrameRect(variant);

  useEffect(() => {
    const board = boardRef.current;

    if (!board) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      const nextViewport = {
        width: Number(entry.contentRect.width.toFixed(2)),
        height: Number(entry.contentRect.height.toFixed(2)),
      };

      setViewport((prevViewport) => {
        if (
          prevViewport.width === nextViewport.width &&
          prevViewport.height === nextViewport.height
        ) {
          return prevViewport;
        }

        return nextViewport;
      });
    });

    resizeObserver.observe(board);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const nextPan = clampRollingPaperPan(
      pan,
      viewport.width,
      viewport.height,
      scale,
      BOARD_SCALE_MODE,
    );

    if (nextPan.x !== pan.x || nextPan.y !== pan.y) {
      onPanChange(nextPan);
    }
  }, [onPanChange, pan, scale, viewport.height, viewport.width]);

  const getCanvasPointFromScreen = (
    clientX: number,
    clientY: number,
    nextScale = scale,
    nextPan = pan,
  ) => {
    const board = boardRef.current;

    if (!board) {
      return { x: 0, y: 0 };
    }

    const rect = board.getBoundingClientRect();
    const nextRenderedScale = getRollingPaperRenderedScale(
      rect.width,
      rect.height,
      nextScale,
      BOARD_SCALE_MODE,
    );

    return {
      x: (clientX - rect.left - rect.width / 2 - nextPan.x) / nextRenderedScale,
      y: (clientY - rect.top - rect.height / 2 - nextPan.y) / nextRenderedScale,
    };
  };

  const startPinchGesture = () => {
    const activePointers = [...activePointersRef.current.values()];

    if (activePointers.length < 2) {
      pinchGestureRef.current = null;
      return;
    }

    const [firstPointer, secondPointer] = activePointers;
    const midpoint = getMidpoint(firstPointer, secondPointer);

    pinchGestureRef.current = {
      anchorCanvasPoint: getCanvasPointFromScreen(midpoint.x, midpoint.y),
      startDistance: getDistance(firstPointer, secondPointer),
      startScale: scale,
    };
  };

  const handlePinchGesture = () => {
    const board = boardRef.current;
    const activePointers = [...activePointersRef.current.values()];
    const pinchGesture = pinchGestureRef.current;

    if (!board || activePointers.length < 2 || !pinchGesture) {
      return;
    }

    const [firstPointer, secondPointer] = activePointers;
    const midpoint = getMidpoint(firstPointer, secondPointer);
    const distance = getDistance(firstPointer, secondPointer);
    const nextScale = clampRollingPaperScale(
      pinchGesture.startScale * (distance / pinchGesture.startDistance),
    );
    const rect = board.getBoundingClientRect();
    const nextRenderedScale = getRollingPaperRenderedScale(
      rect.width,
      rect.height,
      nextScale,
      BOARD_SCALE_MODE,
    );
    const nextPan = clampRollingPaperPan(
      {
        x:
          midpoint.x -
          rect.left -
          rect.width / 2 -
          pinchGesture.anchorCanvasPoint.x * nextRenderedScale,
        y:
          midpoint.y -
          rect.top -
          rect.height / 2 -
          pinchGesture.anchorCanvasPoint.y * nextRenderedScale,
      },
      rect.width,
      rect.height,
      nextScale,
      BOARD_SCALE_MODE,
    );

    onScaleChange(nextScale);
    onPanChange(nextPan);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (activePointersRef.current.size === 1) {
      dragGestureRef.current = {
        pointerId: event.pointerId,
        startPointer: { x: event.clientX, y: event.clientY },
        startPan: pan,
      };
      return;
    }

    if (activePointersRef.current.size === 2) {
      dragGestureRef.current = null;
      startPinchGesture();
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(event.pointerId)) {
      return;
    }

    event.preventDefault();
    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (activePointersRef.current.size === 1) {
      const dragGesture = dragGestureRef.current;

      if (!dragGesture || dragGesture.pointerId !== event.pointerId) {
        return;
      }

      onPanChange(
        clampRollingPaperPan(
          {
            x: dragGesture.startPan.x + (event.clientX - dragGesture.startPointer.x),
            y: dragGesture.startPan.y + (event.clientY - dragGesture.startPointer.y),
          },
          viewport.width,
          viewport.height,
          scale,
          BOARD_SCALE_MODE,
        ),
      );
      return;
    }

    if (activePointersRef.current.size >= 2) {
      if (!pinchGestureRef.current) {
        startPinchGesture();
      }

      handlePinchGesture();
    }
  };

  const handlePointerRelease = (event: PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(event.pointerId);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (activePointersRef.current.size >= 2) {
      startPinchGesture();
      return;
    }

    pinchGestureRef.current = null;

    if (activePointersRef.current.size === 1) {
      const [pointerId, pointer] = activePointersRef.current.entries().next().value as [
        number,
        PointerSnapshot,
      ];

      dragGestureRef.current = {
        pointerId,
        startPointer: pointer,
        startPan: pan,
      };
      return;
    }

    dragGestureRef.current = null;
  };

  return (
    <div
      ref={boardRef}
      className="relative mx-auto h-[509px] w-full touch-none overflow-hidden rounded-[28px] bg-[#f1f1f1]"
      onPointerCancel={handlePointerRelease}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerRelease}
    >
      <div
        className="absolute left-1/2 top-1/2 transition-transform duration-200"
        style={{
          width: `${viewport.width}px`,
          height: `${viewport.height}px`,
          marginLeft: `${-viewport.width / 2}px`,
          marginTop: `${-viewport.height / 2}px`,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${renderedScale})`,
          transformOrigin: 'center center',
        }}
      >
        <div
          className="relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[34px] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.1)]"
          style={{
            width: `${ROLLING_PAPER_CANVAS_DIMENSIONS.width}px`,
            height: `${ROLLING_PAPER_CANVAS_DIMENSIONS.height}px`,
          }}
        >
          <img
            src={boardFrames[variant]}
            alt=""
            className="absolute object-contain"
            style={{
              left: `${frameRect.x}px`,
              top: `${frameRect.y}px`,
              width: `${frameRect.width}px`,
              height: `${frameRect.height}px`,
            }}
          />

          {boardNotes.map((note) => (
            <RollingPaperSticker
              key={note.id}
              colorId={note.colorId}
              message={note.message}
              className="absolute"
              style={{
                width: `${ROLLING_PAPER_NOTE_WIDTH}px`,
                left: `${note.x}%`,
                top: `${note.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-28 bg-gradient-to-b from-white/95 to-white/0" />
    </div>
  );
}

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

export default function RollingPaperBoard() {
  const [boardIndex, setBoardIndex] = useState(0);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [placedNotes, setPlacedNotes] = useState<PlacedRollingPaperNote[]>([]);
  const [boardScale, setBoardScale] = useState<number>(ROLLING_PAPER_ZOOM.default);
  const [boardPan, setBoardPan] = useState<RollingPaperPan>({ x: 0, y: 0 });

  const currentBoardNotes = getPlacedNotesForBoard(placedNotes, boardIndex);
  const isCurrentBoardFull = currentBoardNotes.length >= ROLLING_PAPER_MAX_NOTES_PER_BOARD;

  const showPreviousBoard = () => {
    setBoardScale(ROLLING_PAPER_ZOOM.default);
    setBoardPan({ x: 0, y: 0 });
    setBoardIndex((prev) => (prev === 0 ? boardFrames.length - 1 : prev - 1));
  };

  const showNextBoard = () => {
    setBoardScale(ROLLING_PAPER_ZOOM.default);
    setBoardPan({ x: 0, y: 0 });
    setBoardIndex((prev) => (prev + 1) % boardFrames.length);
  };

  return (
    <div className="bg-white">
      <RollingPaperTabs active="board" />

      <section className="min-h-[713px] bg-black/[0.02] pt-7 pb-16">
        <div className="flex flex-col gap-6 px-5">
          <div className="flex flex-col gap-2.5">
            <h1 className="font-wanted-sans text-[24px] font-bold leading-none tracking-[-0.02em] text-black">
              롤링페이퍼
            </h1>
            <p className="font-wanted-sans text-body1 font-normal leading-none tracking-[-0.02em] text-gray">
              경북대학교 80주년을 축하해주세요!
            </p>
          </div>

          <div className="flex items-end gap-7">
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <p className="font-wanted-sans text-body1 font-normal leading-none tracking-[-0.02em] text-gray">
                Board
              </p>
              <p className="font-wanted-sans text-[24px] font-bold leading-none tracking-[-0.02em] text-black">
                <span className="text-sub-red">{boardIndex + 1}</span>/{boardFrames.length}
              </p>
              <p className="font-wanted-sans text-[13px] font-medium leading-none tracking-[-0.02em] text-gray">
                포스트잇 {currentBoardNotes.length}/{ROLLING_PAPER_MAX_NOTES_PER_BOARD}
              </p>
            </div>
            <button
              type="button"
              className={`rounded-full px-5 py-2.5 font-wanted-sans text-sm font-medium leading-[1.5] text-white shadow-[0_6px_14px_rgba(255,61,61,0.22)] transition ${
                isCurrentBoardFull ? 'cursor-not-allowed bg-sub-red/45 shadow-none' : 'bg-sub-red'
              }`}
              disabled={isCurrentBoardFull}
              onClick={() => setIsWriteModalOpen(true)}
            >
              {isCurrentBoardFull ? '보드가 가득 찼어요' : '메시지 남기기'}
            </button>
          </div>
        </div>

        <div className="relative mt-6">
          <BoardCanvas
            variant={boardIndex}
            scale={boardScale}
            pan={boardPan}
            placedNotes={placedNotes}
            onPanChange={setBoardPan}
            onScaleChange={setBoardScale}
          />

          <div className="pointer-events-none absolute inset-x-0 top-[30px] z-40 flex justify-between px-4">
            <button
              type="button"
              aria-label="이전 롤링페이퍼 보드"
              className="pointer-events-auto flex size-12 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-ink backdrop-blur-[2px]"
              onClick={showPreviousBoard}
            >
              <ArrowLeft className="size-6" />
            </button>
            <button
              type="button"
              aria-label="다음 롤링페이퍼 보드"
              className="pointer-events-auto flex size-12 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-ink backdrop-blur-[2px]"
              onClick={showNextBoard}
            >
              <ArrowRight className="size-6" />
            </button>
          </div>
        </div>

        <div className="mt-[-40px] flex justify-center gap-3 px-5">
          <ControlButton
            icon={<Minus className="size-5" />}
            label="축소"
            disabled={boardScale <= ROLLING_PAPER_ZOOM.min}
            onClick={() => {
              setBoardScale((prevScale) => {
                return clampRollingPaperScale(prevScale - ROLLING_PAPER_ZOOM.step);
              });
            }}
          />
          <ControlButton
            icon={<Circle className="size-5" />}
            label="원점"
            disabled={
              boardScale === ROLLING_PAPER_ZOOM.default && boardPan.x === 0 && boardPan.y === 0
            }
            onClick={() => {
              setBoardScale(ROLLING_PAPER_ZOOM.default);
              setBoardPan({ x: 0, y: 0 });
            }}
          />
          <ControlButton
            icon={<Plus className="size-5" />}
            label="확대"
            disabled={boardScale >= ROLLING_PAPER_ZOOM.max}
            onClick={() => {
              setBoardScale((prevScale) => {
                return clampRollingPaperScale(prevScale + ROLLING_PAPER_ZOOM.step);
              });
            }}
          />
        </div>
        <p className="mt-3 px-5 text-center font-wanted-sans text-[12px] font-medium leading-[1.4] tracking-[-0.02em] text-gray/80">
          두 손가락으로 확대/축소하고, 확대된 상태에서는 드래그로 보드를 이동할 수 있어요
        </p>
      </section>

      {isWriteModalOpen && (
        <RollingPaperWriteModal
          isOpen={isWriteModalOpen}
          boardVariant={boardIndex}
          placedNotes={placedNotes}
          onClose={() => setIsWriteModalOpen(false)}
          onPlace={(note) => {
            setPlacedNotes((prevNotes) => {
              const boardNotes = getPlacedNotesForBoard(prevNotes, note.boardVariant);

              if (boardNotes.length >= ROLLING_PAPER_MAX_NOTES_PER_BOARD) {
                return prevNotes;
              }

              const resolvedPlacement = findNearestAvailableRollingPaperPlacement(
                { x: note.x, y: note.y },
                note.colorId,
                boardNotes,
                note.boardVariant,
              );

              if (!resolvedPlacement) {
                return prevNotes;
              }

              return [
                ...prevNotes,
                {
                  ...note,
                  x: resolvedPlacement.x,
                  y: resolvedPlacement.y,
                },
              ];
            });
            setIsWriteModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
