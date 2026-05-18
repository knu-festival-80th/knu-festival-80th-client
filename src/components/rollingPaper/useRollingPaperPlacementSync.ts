import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { rollingPaperApi } from '@/apis';
import type { CanvasPostitResponse } from '@/apis/modules/rollingPaper';
import { getPlacedNotesForBoard, type PlacedRollingPaperNote } from '@/lib/rollingPaperLayout';
import { toPlacedRollingPaperNote } from './rollingPaperApiAdapter';
import { PLACEMENT_SYNC_DEBOUNCE_MS, PLACEMENT_SYNC_STALE_MS } from './rollingPaperBoardConstants';

type RollingPaperBoardScope = {
  categoryId: string;
  channelId: string;
};

type UseRollingPaperPlacementSyncParams = {
  boardId?: number;
  isEnabled: boolean;
  boardIndex: number;
  boardScope: RollingPaperBoardScope;
  currentBoardNotes: PlacedRollingPaperNote[];
  visiblePendingNotes: PlacedRollingPaperNote[];
};

export function useRollingPaperPlacementSync({
  boardId,
  isEnabled,
  boardIndex,
  boardScope,
  currentBoardNotes,
  visiblePendingNotes,
}: UseRollingPaperPlacementSyncParams) {
  const queryClient = useQueryClient();
  const placementSyncTimeoutRef = useRef<number | null>(null);
  const lastPlacementSyncAtRef = useRef(0);

  const clearPlacementSyncTimeout = useCallback(() => {
    if (placementSyncTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(placementSyncTimeoutRef.current);
    placementSyncTimeoutRef.current = null;
  }, []);

  useEffect(() => clearPlacementSyncTimeout, [clearPlacementSyncTimeout]);

  const syncBoardPostits = useCallback(async () => {
    if (!boardId || !isEnabled) {
      return [];
    }

    const latestPostits = await queryClient.fetchQuery<CanvasPostitResponse[]>({
      queryKey: ['rollingPaper', 'postits', boardId],
      queryFn: () => rollingPaperApi.listPostits(boardId),
      staleTime: 0,
    });

    lastPlacementSyncAtRef.current = Date.now();
    return latestPostits;
  }, [boardId, isEnabled, queryClient]);

  const requestPlacementSync = useCallback(
    (options: { immediate?: boolean } = {}) => {
      if (!boardId || !isEnabled) {
        return;
      }

      clearPlacementSyncTimeout();

      if (options.immediate) {
        void syncBoardPostits();
        return;
      }

      placementSyncTimeoutRef.current = window.setTimeout(() => {
        placementSyncTimeoutRef.current = null;
        void syncBoardPostits();
      }, PLACEMENT_SYNC_DEBOUNCE_MS);
    },
    [boardId, clearPlacementSyncTimeout, isEnabled, syncBoardPostits],
  );

  const getLatestBoardNotesForPlacement = useCallback(async () => {
    if (!boardId || !isEnabled) {
      return currentBoardNotes;
    }

    const shouldRefresh = Date.now() - lastPlacementSyncAtRef.current > PLACEMENT_SYNC_STALE_MS;
    if (!shouldRefresh) {
      return currentBoardNotes;
    }

    try {
      const latestPostits = await syncBoardPostits();
      const latestApiNotes = latestPostits.map(toPlacedRollingPaperNote);
      const latestPlacedNotes = [...latestApiNotes, ...visiblePendingNotes];

      return getPlacedNotesForBoard(latestPlacedNotes, boardIndex, boardScope);
    } catch {
      return currentBoardNotes;
    }
  }, [
    boardId,
    boardIndex,
    boardScope,
    currentBoardNotes,
    isEnabled,
    syncBoardPostits,
    visiblePendingNotes,
  ]);

  return {
    getLatestBoardNotesForPlacement,
    requestPlacementSync,
  };
}
