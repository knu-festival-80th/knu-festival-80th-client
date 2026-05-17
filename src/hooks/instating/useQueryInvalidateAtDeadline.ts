import { useEffect, useLayoutEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useQueryInvalidateAtDeadline(
  deadline: Date | null,
  isAlreadyActive: boolean,
  queryKey: unknown[],
) {
  const queryClient = useQueryClient();
  const queryKeyRef = useRef(queryKey);
  useLayoutEffect(() => {
    queryKeyRef.current = queryKey;
  });

  useEffect(() => {
    if (!deadline || isAlreadyActive) return;
    const ms = deadline.getTime() - Date.now();
    if (ms <= 0) {
      queryClient.invalidateQueries({ queryKey: queryKeyRef.current });
      return;
    }
    const id = setTimeout(
      () => queryClient.invalidateQueries({ queryKey: queryKeyRef.current }),
      ms,
    );
    return () => clearTimeout(id);
  }, [deadline, isAlreadyActive, queryClient]);
}
