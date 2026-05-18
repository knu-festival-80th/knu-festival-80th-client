import { useRef, useState } from 'react';
import type { MouseEvent, PointerEvent } from 'react';

const DRAG_THRESHOLD_PX = 5;

export const useHorizontalDragScroll = <T extends HTMLElement>() => {
  const scrollRef = useRef<T>(null);
  const dragStateRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    scrollLeft: 0,
  });
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const endDrag = (event: PointerEvent<T>) => {
    const state = dragStateRef.current;
    if (!state.active || state.pointerId !== event.pointerId) return;

    state.active = false;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerDown = (event: PointerEvent<T>) => {
    if (event.pointerType === 'touch' || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }

    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: scrollElement.scrollLeft,
    };
    suppressClickRef.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<T>) => {
    const state = dragStateRef.current;
    const scrollElement = scrollRef.current;
    if (!state.active || state.pointerId !== event.pointerId || !scrollElement) return;

    const deltaX = event.clientX - state.startX;
    if (Math.abs(deltaX) > DRAG_THRESHOLD_PX) {
      suppressClickRef.current = true;
    }

    scrollElement.scrollLeft = state.scrollLeft - deltaX;
    event.preventDefault();
  };

  const handleClickCapture = (event: MouseEvent<T>) => {
    if (!suppressClickRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  return {
    scrollRef,
    isDragging,
    dragHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onPointerLeave: endDrag,
      onClickCapture: handleClickCapture,
    },
  };
};
