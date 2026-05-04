export { clearAccessToken, getAccessToken, setAccessToken } from '@/apis/auth';
export { ENDPOINTS } from '@/apis/endpoints';
export {
  ApiClientError,
  toApiClientError,
  unwrapApiResponse,
  unwrapVoidApiResponse,
} from '@/apis/error';
export { http, setUnauthorizedHandler } from '@/apis/http';
export { buildJsonFormData, omitUndefined } from '@/apis/utils';

export type {
  ApiErrorBody,
  ApiErrorInfo,
  ApiResponse,
  CursorPaginationParams,
  PartialUpdate,
} from '@/apis/types';

export * as authApi from '@/apis/modules/auth';
export * as boothApi from '@/apis/modules/booth';
export * as menuApi from '@/apis/modules/menu';
export * as waitingApi from '@/apis/modules/waiting';
export type { AdminRole, LoginRequest, LoginResponse } from '@/apis/modules/auth';
export type {
  BoothCreateRequest,
  BoothListItem,
  BoothPasswordChangeRequest,
  BoothSummary,
  BoothUpdateRequest,
  BoothSort,
} from '@/apis/modules/booth';
export type { MenuCreateRequest, MenuItem, MenuUpdateRequest } from '@/apis/modules/menu';
export type {
  WaitingInsertRequest,
  WaitingItem,
  WaitingReorderRequest,
  WaitingStatus,
  WaitingToggleRequest,
} from '@/apis/modules/waiting';
