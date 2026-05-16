import { ENDPOINTS, http, omitUndefined, unwrapApiResponse } from '@/apis';
import type { ApiResponse } from '@/apis/types';

// ---- 공통 타입 ----

export type MatchingOperationStatus = 'OPEN' | 'PAUSED';
export type MatchingParticipantStatus = 'PENDING' | 'MATCHED' | 'UNMATCHED';
export type MatchingGender = 'MALE' | 'FEMALE';

// ---- 사용자 ----

export interface MatchingCreateRequest {
  instagramId: string;
  gender: MatchingGender;
  phoneNumber: string;
}

export interface MatchingAuthRequest {
  instagramId: string;
  phoneNumber: string;
}

export interface MatchingRegisterResponse {
  instagramId: string;
  festivalDay: string;
  status: MatchingParticipantStatus;
  registrationDeadline: string;
  resultOpenAt: string;
}

export interface MatchingResultResponse {
  instagramId: string;
  status: MatchingParticipantStatus;
  resultOpen: boolean;
  pickedInstagramId: string | null;
  instagramProfileUrl: string | null;
  messageKo: string | null;
  messageEn: string | null;
}

export interface MatchingUserStatusResponse {
  status: MatchingOperationStatus;
  messageKo: string | null;
  messageEn: string | null;
  registrationOpen: boolean;
  resultOpen: boolean;
  registrationDeadline: string | null;
  resultOpenAt: string | null;
  registrationOpenAt: string | null;
  pendingCount: number;
  matchedCount: number;
  unmatchedCount: number;
  malePendingCount: number;
  femalePendingCount: number;
}

export async function registerMatching(
  payload: MatchingCreateRequest,
): Promise<MatchingRegisterResponse> {
  const response = await http.post<ApiResponse<MatchingRegisterResponse>>(
    ENDPOINTS.matchings.register,
    payload,
  );
  return unwrapApiResponse(response.data);
}

export async function getMatchingResult(
  payload: MatchingAuthRequest,
): Promise<MatchingResultResponse> {
  const response = await http.post<ApiResponse<MatchingResultResponse>>(
    ENDPOINTS.matchings.result,
    payload,
  );
  return unwrapApiResponse(response.data);
}

export async function getMatchingStatus(): Promise<MatchingUserStatusResponse> {
  const response = await http.get<ApiResponse<MatchingUserStatusResponse>>(
    ENDPOINTS.matchings.status,
  );
  return unwrapApiResponse(response.data);
}

// ---- 관리자 ----

export interface MatchingStatusResponse {
  status: MatchingOperationStatus;
  registrationOpen: boolean;
  resultOpen: boolean;
  registrationDeadline: string;
  resultOpenAt: string;
  festivalDays: string[];
  pendingCount: number;
  matchedCount: number;
  unmatchedCount: number;
  malePendingCount: number;
  femalePendingCount: number;
}

export interface MatchingStatusUpdateRequest {
  status: MatchingOperationStatus;
}

export interface MatchingJobResponse {
  matchedPairCount: number;
  unmatchedCount: number;
}

export interface MatchingApplicantsCountResponse {
  festivalDay: string | null;
  malePendingCount: number;
  femalePendingCount: number;
  totalPendingCount: number;
}

export interface MatchingParticipantAdmin {
  participantId: number;
  instagramId: string;
  gender: MatchingGender;
  status: MatchingParticipantStatus;
  matchedInstagramId: string | null;
  festivalDay: string;
  maskedPhone: string;
  createdAt: string;
}

export interface MatchingParticipantsAdminResponse {
  festivalDay: string | null;
  totalCount: number;
  participants: MatchingParticipantAdmin[];
}

export interface ListParticipantsParams {
  festivalDay?: string;
  status?: MatchingParticipantStatus;
  gender?: MatchingGender;
  search?: string;
}

export async function getStatus(): Promise<MatchingStatusResponse> {
  const response = await http.get<ApiResponse<MatchingStatusResponse>>(ENDPOINTS.matchings.status);
  return unwrapApiResponse(response.data);
}

export async function updateStatus(
  payload: MatchingStatusUpdateRequest,
): Promise<MatchingStatusResponse> {
  const response = await http.patch<ApiResponse<MatchingStatusResponse>>(
    ENDPOINTS.admin.matchingStatus,
    payload,
  );
  return unwrapApiResponse(response.data);
}

export async function runJob(): Promise<MatchingJobResponse> {
  const response = await http.post<ApiResponse<MatchingJobResponse>>(ENDPOINTS.admin.matchingJobs);
  return unwrapApiResponse(response.data);
}

export async function runJobForDay(festivalDay: string): Promise<MatchingJobResponse> {
  const response = await http.post<ApiResponse<MatchingJobResponse>>(
    ENDPOINTS.admin.matchingJobForDay(festivalDay),
  );
  return unwrapApiResponse(response.data);
}

export async function listParticipants(
  params: ListParticipantsParams = {},
): Promise<MatchingParticipantsAdminResponse> {
  const response = await http.get<ApiResponse<MatchingParticipantsAdminResponse>>(
    ENDPOINTS.admin.matchingParticipants,
    { params: omitUndefined(params as Record<string, unknown>) },
  );
  return unwrapApiResponse(response.data);
}

export async function deleteParticipant(participantId: number): Promise<MatchingStatusResponse> {
  const response = await http.delete<ApiResponse<MatchingStatusResponse>>(
    ENDPOINTS.admin.matchingParticipantById(participantId),
  );
  return unwrapApiResponse(response.data);
}

export async function resetParticipant(participantId: number): Promise<MatchingStatusResponse> {
  const response = await http.post<ApiResponse<MatchingStatusResponse>>(
    ENDPOINTS.admin.matchingParticipantReset(participantId),
  );
  return unwrapApiResponse(response.data);
}

export interface MatchingMatchUpdateRequest {
  matchedInstagramId: string;
}

export async function updateMatch(
  participantId: number,
  payload: MatchingMatchUpdateRequest,
): Promise<MatchingStatusResponse> {
  const response = await http.patch<ApiResponse<MatchingStatusResponse>>(
    ENDPOINTS.admin.matchingParticipantMatch(participantId),
    payload,
  );
  return unwrapApiResponse(response.data);
}

export async function getApplicantsCount(): Promise<MatchingApplicantsCountResponse> {
  const response = await http.get<ApiResponse<MatchingApplicantsCountResponse>>(
    ENDPOINTS.matchings.applicantsCount,
  );
  return unwrapApiResponse(response.data);
}
