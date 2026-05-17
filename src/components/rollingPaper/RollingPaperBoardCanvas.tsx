import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

type PlacedStickerButtonProps = {
  note: PlacedRollingPaperNote;
  isFocused: boolean;
  onFocus: (note: PlacedRollingPaperNote) => void;
};

const PlacedStickerButton = memo(
  function PlacedStickerButton({ note, isFocused, onFocus }: PlacedStickerButtonProps) {
    const handleClick = useCallback(() => {
      onFocus(note);
    }, [note, onFocus]);

    return (
      <button
        type="button"
        aria-label={`포스트잇 보기: ${note.message}`}
        className={`absolute block touch-manipulation border-0 bg-transparent p-0 text-left transition-[filter,transform,opacity] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub-red/80 ${
          isFocused
            ? 'pointer-events-none z-30 opacity-0'
            : 'z-20 hover:drop-shadow-[0_10px_14px_rgba(0,0,0,0.12)]'
        }`}
        style={{
          width: `${ROLLING_PAPER_NOTE_WIDTH}px`,
          left: `${note.x}%`,
          top: `${note.y}%`,
          transform: 'translate(-50%, -50%)',
          transformOrigin: 'center center',
        }}
        onClick={handleClick}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
      >
        <RollingPaperSticker colorId={note.colorId} message={note.message} className="w-full" />
      </button>
    );
  },
  (prevProps, nextProps) =>
    prevProps.isFocused === nextProps.isFocused &&
    prevProps.onFocus === nextProps.onFocus &&
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.message === nextProps.note.message &&
    prevProps.note.colorId === nextProps.note.colorId &&
    prevProps.note.x === nextProps.note.x &&
    prevProps.note.y === nextProps.note.y,
);

function logRollingPaperMeasure(measureName: string) {
  if (!import.meta.env.DEV || typeof performance === 'undefined') {
    return;
  }

  const measure = performance.getEntriesByName(measureName).at(-1);

  if (!measure) {
    return;
  }

  console.info(`[rolling-paper:performance] ${measureName}: ${measure.duration.toFixed(2)}ms`);
}

function getNoteScreenPosition(
  note: PlacedRollingPaperNote,
  viewport: BoardViewport,
  pan: RollingPaperPan,
  renderedScale: number,
) {
  const canvasX = (note.x / 100) * ROLLING_PAPER_CANVAS_DIMENSIONS.width;
  const canvasY = (note.y / 100) * ROLLING_PAPER_CANVAS_DIMENSIONS.height;

  return {
    x:
      viewport.width / 2 +
      pan.x +
      (canvasX - ROLLING_PAPER_CANVAS_DIMENSIONS.width / 2) * renderedScale,
    y:
      viewport.height / 2 +
      pan.y +
      (canvasY - ROLLING_PAPER_CANVAS_DIMENSIONS.height / 2) * renderedScale,
  };
}

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
  const boardNotes = useMemo(
    () => getPlacedNotesForBoard(placedNotes, variant),
    [placedNotes, variant],
  );
  const renderedScale = getRollingPaperRenderedScale(
    viewport.width,
    viewport.height,
    scale,
    ROLLING_PAPER_BOARD_SCALE_MODE,
  );
  const focusedNote = useMemo(
    () => (focusedNoteId ? (boardNotes.find((note) => note.id === focusedNoteId) ?? null) : null),
    [boardNotes, focusedNoteId],
  );
  const focusedNotePosition = focusedNote
    ? getNoteScreenPosition(focusedNote, viewport, pan, renderedScale)
    : null;
  const focusedNoteWidth = focusedNote ? ROLLING_PAPER_NOTE_WIDTH * renderedScale : 0;
  const frameRect = getRollingPaperFrameRect(variant);
  const frameImage =
    rollingPaperBoardFrames[variant % rollingPaperBoardFrames.length] ?? rollingPaperBoardFrames[0];
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
    if (!import.meta.env.DEV || boardNotes.length === 0 || typeof performance === 'undefined') {
      return;
    }

    const startMark = `rolling-paper-render-start-${variant}-${boardNotes.length}`;
    const endMark = `rolling-paper-render-end-${variant}-${boardNotes.length}`;
    const measureName = `render-${boardNotes.length}-notes`;

    performance.mark(startMark);

    requestAnimationFrame(() => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      logRollingPaperMeasure(measureName);
    });
  }, [boardNotes.length, variant]);

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

  const focusNote = useCallback(
    (note: PlacedRollingPaperNote) => {
      const startMark = `rolling-paper-focus-start-${note.id}`;
      const endMark = `rolling-paper-focus-end-${note.id}`;
      const measureName = `focus-${boardNotes.length}-notes`;

      if (import.meta.env.DEV && typeof performance !== 'undefined') {
        performance.mark(startMark);
      }

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

      if (import.meta.env.DEV && typeof performance !== 'undefined') {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            performance.mark(endMark);
            performance.measure(measureName, startMark, endMark);
            logRollingPaperMeasure(measureName);
          });
        });
      }
    },
    [
      boardNotes.length,
      onFocusedNoteChange,
      onPanChange,
      onScaleChange,
      viewport.height,
      viewport.width,
    ],
  );

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
        className="absolute left-1/2 top-1/2 z-10 transition-transform duration-300 ease-out will-change-transform"
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

          {boardNotes.map((note) => (
            <PlacedStickerButton
              key={note.id}
              note={note}
              isFocused={focusedNoteId === note.id}
              onFocus={focusNote}
            />
          ))}
        </div>
      </div>

      {focusedNote && focusedNotePosition && (
        <button
          type="button"
          aria-label={`포스트잇 다시 확대: ${focusedNote.message}`}
          className="absolute z-20 block touch-manipulation border-0 bg-transparent p-0 text-left transition-[left,top,width] duration-300 ease-out [container-type:inline-size] will-change-[left,top,width] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub-red/80"
          style={{
            left: `${focusedNotePosition.x}px`,
            top: `${focusedNotePosition.y}px`,
            width: `${focusedNoteWidth}px`,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => focusNote(focusedNote)}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
        >
          <RollingPaperSticker
            colorId={focusedNote.colorId}
            message={focusedNote.message}
            className="w-full"
          />
        </button>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-28 bg-gradient-to-b from-white/95 to-white/0" />
    </div>
  );
}
