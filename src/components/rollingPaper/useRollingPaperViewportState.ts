import { useCallback, useEffect, useRef, useState } from 'react';
import { ROLLING_PAPER_ZOOM, type RollingPaperPan } from '@/lib/rollingPaperLayout';
import { FOCUS_RESET_ANIMATION_MS, INITIAL_BOARD_PAN } from './rollingPaperBoardConstants';

export function useRollingPaperViewportState() {
  const [boardScale, setBoardScale] = useState<number>(ROLLING_PAPER_ZOOM.default);
  const [boardPan, setBoardPan] = useState<RollingPaperPan>(INITIAL_BOARD_PAN);
  const [focusedNoteId, setFocusedNoteId] = useState<string | null>(null);
  const focusResetTimeoutRef = useRef<number | null>(null);

  const clearFocusResetTimeout = useCallback(() => {
    if (focusResetTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(focusResetTimeoutRef.current);
    focusResetTimeoutRef.current = null;
  }, []);

  useEffect(() => clearFocusResetTimeout, [clearFocusResetTimeout]);

  const handleFocusedNoteChange = useCallback(
    (noteId: string | null) => {
      clearFocusResetTimeout();
      setFocusedNoteId(noteId);
    },
    [clearFocusResetTimeout],
  );

  const resetBoardViewport = useCallback(
    (options: { animateFocusedNote?: boolean } = {}) => {
      const animateFocusedNote = options.animateFocusedNote ?? true;

      setBoardScale(ROLLING_PAPER_ZOOM.default);
      setBoardPan(INITIAL_BOARD_PAN);

      clearFocusResetTimeout();
      if (!focusedNoteId || !animateFocusedNote) {
        setFocusedNoteId(null);
        return;
      }

      focusResetTimeoutRef.current = window.setTimeout(() => {
        setFocusedNoteId(null);
        focusResetTimeoutRef.current = null;
      }, FOCUS_RESET_ANIMATION_MS);
    },
    [clearFocusResetTimeout, focusedNoteId],
  );

  return {
    boardPan,
    boardScale,
    focusedNoteId,
    handleFocusedNoteChange,
    resetBoardViewport,
    setBoardPan,
    setBoardScale,
  };
}
