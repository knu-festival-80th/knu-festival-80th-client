import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { ApiClientError, waitingApi } from '@/apis';

interface UseWaitingActionsArgs {
  boothId: number;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

export function useWaitingActions({ boothId, onError, onSuccess }: UseWaitingActionsArgs) {
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'booth', boothId, 'waitings'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'booths'] });
  }, [queryClient, boothId]);

  const handleError = useCallback(
    (fallback: string) => (error: unknown) => {
      const message = error instanceof ApiClientError ? error.message : fallback;
      onError?.(message);
    },
    [onError],
  );

  const callMutation = useMutation({
    mutationFn: waitingApi.callWaiting,
    onSuccess: () => {
      invalidate();
      onSuccess?.('호출했어요');
    },
    onError: handleError('호출에 실패했습니다.'),
  });

  const enterMutation = useMutation({
    mutationFn: waitingApi.enterWaiting,
    onSuccess: () => {
      invalidate();
      onSuccess?.('입장 처리했어요');
    },
    onError: handleError('입장 처리에 실패했습니다.'),
  });

  const cancelMutation = useMutation({
    mutationFn: waitingApi.cancelWaiting,
    onSuccess: () => {
      invalidate();
      onSuccess?.('취소했어요');
    },
    onError: handleError('취소에 실패했습니다.'),
  });

  const skipMutation = useMutation({
    mutationFn: waitingApi.skipWaiting,
    onSuccess: () => {
      invalidate();
      onSuccess?.('미방문 처리했어요');
    },
    onError: handleError('미방문 처리에 실패했습니다.'),
  });

  const resendMutation = useMutation({
    mutationFn: waitingApi.resendWaitingSms,
    onSuccess: () => {
      onSuccess?.('SMS를 재발송했어요');
    },
    onError: handleError('SMS 재발송에 실패했습니다.'),
  });

  const reorderMutation = useMutation({
    mutationFn: ({ waitingId, newSortOrder }: { waitingId: number; newSortOrder: number }) =>
      waitingApi.reorderWaiting(waitingId, { newSortOrder }),
    onSuccess: () => {
      invalidate();
    },
    onError: (error) => {
      invalidate();
      handleError('순서 변경에 실패했습니다.')(error);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (open: boolean) => waitingApi.toggleBoothWaiting(boothId, { open }),
    onSuccess: invalidate,
    onError: handleError('접수 상태 변경에 실패했습니다.'),
  });

  const anyPending =
    callMutation.isPending ||
    enterMutation.isPending ||
    cancelMutation.isPending ||
    skipMutation.isPending ||
    resendMutation.isPending ||
    reorderMutation.isPending;

  return {
    call: callMutation,
    enter: enterMutation,
    cancel: cancelMutation,
    skip: skipMutation,
    resend: resendMutation,
    reorder: reorderMutation,
    toggle: toggleMutation,
    anyPending,
    invalidate,
  };
}
