import { useEffect, useRef, useState } from 'react';
import {
  ROLLING_PAPER_BOARD_VIEWPORT,
  ROLLING_PAPER_CANVAS_DIMENSIONS,
  ROLLING_PAPER_NOTE_WIDTH,
  clampRollingPaperPan,
  getPlacedNotesForBoard,
  getRollingPaperFrameRect,
  getRollingPaperNoteFocusScale,
  getRollingPaperPlacementFocusPan,
  getRollingPaperRenderedScale,
  type PlacedRollingPaperNote,
  type RollingPaperPan,
} from '@/lib/rollingPaperLayout';
import { ROLLING_PAPER_BOARD_SCALE_MODE, rollingPaperBoardFrames } from './rollingPaperBoardAssets';
import RollingPaperSticker from './RollingPaperSticker';
import { useRollingPaperBoardGestures } from './useRollingPaperBoardGestures';

type BoardViewport = {
  width: number;
  height: number;
};

type RollingPaperBoardCanvasProps = {
  variant: number;
  scale: number;
  pan: RollingPaperPan;
  placedNotes: PlacedRollingPaperNote[];
  focusedNoteId: string | null;
  onPanChange: (pan: RollingPaperPan) => void;
  onScaleChange: (scale: number) => void;
  onFocusedNoteChange: (noteId: string | null) => void;
};

export default function RollingPaperBoardCanvas({
  variant,
  scale,
  pan,
  placedNotes,
  focusedNoteId,
  onPanChange,
  onScaleChange,
  onFocusedNoteChange,
}: RollingPaperBoardCanvasProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<BoardViewport>(ROLLING_PAPER_BOARD_VIEWPORT);
  const boardNotes = getPlacedNotesForBoard(placedNotes, variant);
  const renderedScale = getRollingPaperRenderedScale(
    viewport.width,
    viewport.height,
    scale,
    ROLLING_PAPER_BOARD_SCALE_MODE,
  );
  const frameRect = getRollingPaperFrameRect(variant);
  const frameImage = rollingPaperBoardFrames[variant] ?? rollingPaperBoardFrames[0];
  const { handlePointerDown, handlePointerMove, handlePointerRelease } =
    useRollingPaperBoardGestures({
      boardRef,
      scale,
      pan,
      viewport,
      onPanChange,
      onScaleChange,
    });

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
      ROLLING_PAPER_BOARD_SCALE_MODE,
    );

    if (nextPan.x !== pan.x || nextPan.y !== pan.y) {
      onPanChange(nextPan);
    }
  }, [onPanChange, pan, scale, viewport.height, viewport.width]);

  const focusNote = (note: PlacedRollingPaperNote) => {
    const focusScale = getRollingPaperNoteFocusScale(
      note.colorId,
      viewport.width,
      viewport.height,
      ROLLING_PAPER_BOARD_SCALE_MODE,
    );
    const nextPan = getRollingPaperPlacementFocusPan(
      { x: note.x, y: note.y },
      viewport.width,
      viewport.height,
      focusScale,
      ROLLING_PAPER_BOARD_SCALE_MODE,
    );

    onScaleChange(focusScale);
    onPanChange(nextPan);
    onFocusedNoteChange(note.id);
  };

  return (
    <div
      ref={boardRef}
      className="relative mx-auto h-[509px] w-full touch-none overflow-hidden bg-[#f1f1f1]"
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
            src={frameImage}
            alt=""
            className="absolute object-contain"
            style={{
              left: `${frameRect.x}px`,
              top: `${frameRect.y}px`,
              width: `${frameRect.width}px`,
              height: `${frameRect.height}px`,
            }}
          />

          {boardNotes.map((note) => {
            const isFocused = focusedNoteId === note.id;

            return (
              <button
                key={note.id}
                type="button"
                aria-label={`포스트잇 보기: ${note.message}`}
                className={`absolute block touch-manipulation border-0 bg-transparent p-0 text-left transition-[filter,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub-red/80 ${
                  isFocused ? 'z-30' : 'z-20 hover:drop-shadow-[0_10px_14px_rgba(0,0,0,0.12)]'
                }`}
                style={{
                  width: `${ROLLING_PAPER_NOTE_WIDTH}px`,
                  left: `${note.x}%`,
                  top: `${note.y}%`,
                  transform: 'translate(-50%, -50%)',
                  transformOrigin: 'center center',
                }}
                onClick={() => focusNote(note)}
                onPointerDown={(event) => event.stopPropagation()}
                onPointerUp={(event) => event.stopPropagation()}
              >
                <RollingPaperSticker
                  colorId={note.colorId}
                  message={note.message}
                  className="w-full"
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-28 bg-gradient-to-b from-white/95 to-white/0" />
    </div>
  );
}
