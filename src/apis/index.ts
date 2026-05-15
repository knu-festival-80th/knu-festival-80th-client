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
export * as matchingApi from '@/apis/modules/matching';
export * as rollingPaperApi from '@/apis/modules/rollingPaper';
export * as uploadApi from '@/apis/modules/upload';
export * as waitingApi from '@/apis/modules/waiting';
export { imagePathToSrc, imageUrlToPath } from '@/apis/modules/upload';
export type { ImageUploadResponse } from '@/apis/modules/upload';
export type { AdminRole, LoginRequest, LoginResponse } from '@/apis/modules/auth';
export type {
  BoothCreateRequest,
  BoothListItem,
  BoothMapItem,
  BoothPasswordChangeRequest,
  BoothSummary,
  BoothUpdateRequest,
  BoothSort,
} from '@/apis/modules/booth';
export type {
  CanvasBoardQuestionResponse,
  CanvasBoardSummaryResponse,
  CanvasColorId,
  CanvasPlacement,
  CanvasPostitCreateRequest,
  CanvasPostitCreateResponse,
  CanvasPostitModerationStatus,
  CanvasPostitResponse,
} from '@/apis/modules/rollingPaper';
export type {
  WaitingInsertRequest,
  WaitingItem,
  WaitingReorderRequest,
  WaitingStatus,
  WaitingToggleRequest,
} from '@/apis/modules/waiting';
export type {
  ListParticipantsParams,
  MatchingApplicantsCountResponse,
  MatchingGender,
  MatchingJobResponse,
  MatchingOperationStatus,
  MatchingParticipantAdmin,
  MatchingParticipantStatus,
  MatchingParticipantsAdminResponse,
  MatchingStatusResponse,
  MatchingStatusUpdateRequest,
} from '@/apis/modules/matching';
