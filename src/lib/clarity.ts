import Clarity from '@microsoft/clarity';

import { getRuntimeEnv } from '@/config/runtimeEnv';

export function initClarity(): void {
  const clarityId = getRuntimeEnv('VITE_CLARITY_ID').trim();
  if (!clarityId || typeof window === 'undefined') return;

  Clarity.init(clarityId);
}
