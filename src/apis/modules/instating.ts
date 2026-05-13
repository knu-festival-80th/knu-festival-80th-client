import { ENDPOINTS, http, unwrapApiResponse } from '@/apis';
import type { ApiResponse } from '@/apis/types';

export type MatchingGender = 'MALE' | 'FEMALE';
export type MatchingStatus = 'PENDING' | 'MATCHED' | 'UNMATCHED';

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
  status: MatchingStatus;
  registrationDeadline: string;
  resultOpenAt: string;
}

export interface MatchingResultResponse {
  instagramId: string;
  status: MatchingStatus;
  resultOpen: boolean;
  pickedInstagramId: string | null;
  instagramProfileUrl: string | null;
  messageKo: string | null;
  messageEn: string | null;
}

export interface InstatingStatusResponse {
  status: 'OPEN' | 'PAUSED';
  messageKo: string | null;
  messageEn: string | null;
  registrationOpen: boolean;
  resultOpen: boolean;
  registrationDeadline: string | null;
  resultOpenAt: string | null;
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

export async function getInstatingStatus(): Promise<InstatingStatusResponse> {
  const response = await http.get<ApiResponse<InstatingStatusResponse>>(
    ENDPOINTS.matchings.status,
  );
  return unwrapApiResponse(response.data);
}
