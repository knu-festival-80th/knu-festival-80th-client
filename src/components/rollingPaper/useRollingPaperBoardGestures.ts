import { useRef } from 'react';
import type { PointerEvent, RefObject } from 'react';
import {
  clampRollingPaperPan,
  clampRollingPaperScale,
  getRollingPaperRenderedScale,
  type RollingPaperPan,
} from '@/lib/rollingPaperLayout';
import { ROLLING_PAPER_BOARD_SCALE_MODE } from './rollingPaperBoardAssets';

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

type UseRollingPaperBoardGesturesOptions = {
  boardRef: RefObject<HTMLDivElement | null>;
  scale: number;
  pan: RollingPaperPan;
  viewport: BoardViewport;
  onPanChange: (pan: RollingPaperPan) => void;
  onScaleChange: (scale: number) => void;
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

export function useRollingPaperBoardGestures({
  boardRef,
  scale,
  pan,
  viewport,
  onPanChange,
  onScaleChange,
}: UseRollingPaperBoardGesturesOptions) {
  const activePointersRef = useRef(new Map<number, PointerSnapshot>());
  const pinchGestureRef = useRef<PinchGestureSnapshot | null>(null);
  const dragGestureRef = useRef<DragGestureSnapshot | null>(null);

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
      ROLLING_PAPER_BOARD_SCALE_MODE,
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
      ROLLING_PAPER_BOARD_SCALE_MODE,
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
      ROLLING_PAPER_BOARD_SCALE_MODE,
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
          ROLLING_PAPER_BOARD_SCALE_MODE,
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

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerRelease,
  };
}
