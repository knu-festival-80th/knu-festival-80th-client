export interface ScheduleIdleTaskOptions {
  timeout?: number;
  fallbackDelay?: number;
}

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export const scheduleIdleTask = (
  callback: () => void,
  { timeout = 3000, fallbackDelay = 1200 }: ScheduleIdleTaskOptions = {},
) => {
  if (typeof window === 'undefined') return () => {};

  const idleWindow = window as IdleWindow;
  if (idleWindow.requestIdleCallback) {
    const handle = idleWindow.requestIdleCallback(callback, { timeout });
    return () => idleWindow.cancelIdleCallback?.(handle);
  }

  const timeoutId = window.setTimeout(callback, fallbackDelay);
  return () => window.clearTimeout(timeoutId);
};
