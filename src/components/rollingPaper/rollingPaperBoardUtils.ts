import { getRollingPaperPerformanceNotesFromSearch } from '@/mocks/rollingPaperPerformance';
import type { PlacedRollingPaperNote } from '@/lib/rollingPaperLayout';

export function getInitialRollingPaperPlacedNotes() {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return [];
  }

  return getRollingPaperPerformanceNotesFromSearch(window.location.search);
}

export function isRollingPaperNoteInChannel(
  note: PlacedRollingPaperNote,
  categoryId: string,
  channelId: string,
) {
  if (!note.categoryId || !note.channelId) {
    return true;
  }

  return note.categoryId === categoryId && note.channelId === channelId;
}

export function isExpiredLocalRollingPaperNote(note: PlacedRollingPaperNote, now = Date.now()) {
  return Boolean(note.pendingVisibleUntil && note.pendingVisibleUntil <= now);
}

export function isSameRollingPaperConflictPlaceholder(
  note: PlacedRollingPaperNote,
  nextNote: PlacedRollingPaperNote,
) {
  return (
    note.isConflictPlaceholder &&
    note.boardId === nextNote.boardId &&
    note.boardVariant === nextNote.boardVariant &&
    Math.abs(note.x - nextNote.x) < 0.01 &&
    Math.abs(note.y - nextNote.y) < 0.01
  );
}
