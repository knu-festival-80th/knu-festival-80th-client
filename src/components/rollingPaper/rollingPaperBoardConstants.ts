import type { RollingPaperPan } from '@/lib/rollingPaperLayout';

export const INITIAL_BOARD_PAN: RollingPaperPan = { x: 0, y: 0 };
export const PENDING_POSTIT_REFETCH_INTERVAL_MS = 5000;
export const PENDING_POSTIT_LOCAL_VISIBLE_MS = 60000;
export const CONFLICT_PLACEHOLDER_LOCAL_VISIBLE_MS = 60000;
export const PLACEMENT_SYNC_DEBOUNCE_MS = 400;
export const PLACEMENT_SYNC_STALE_MS = 3000;
export const FOCUS_RESET_ANIMATION_MS = 320;
export const POSTIT_POSITION_CONFLICT_CODE = 'CP008';
export const POSTIT_POSITION_CONFLICT_MESSAGE =
  '이미 다른 사용자가 같은 위치에 메시지를 붙였어요. 다른 위치에 다시 시도해주세요.';
export const POSTIT_POSITION_CONFLICT_PLACEHOLDER_MESSAGE = '이미 사용 중인 위치예요.';
export const POSTIT_PLACEMENT_UNAVAILABLE_MESSAGE =
  '이미 붙은 포스트잇과 겹쳐요. 빈 위치로 옮겨주세요.';
