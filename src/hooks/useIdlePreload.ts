import { useEffect } from 'react';

import { scheduleIdleTask } from '@/lib/scheduleIdleTask';

export interface UseIdlePreloadOptions {
  enabled?: boolean;
  timeout?: number;
  fallbackDelay?: number;
}

export const useIdlePreload = (
  callback: () => void,
  { enabled = true, timeout, fallbackDelay }: UseIdlePreloadOptions = {},
) => {
  useEffect(() => {
    if (!enabled) return;
    return scheduleIdleTask(callback, { timeout, fallbackDelay });
  }, [callback, enabled, timeout, fallbackDelay]);
};
