import { ENDPOINTS, http, omitUndefined, unwrapApiResponse, unwrapVoidApiResponse } from '@/apis';
import type { ApiResponse } from '@/apis/types';

export type BoothSort = 'likes' | 'waiting-asc';

export interface BoothListItem {
  boothId: number;
  name: string;
  description: string;
  xRatio: number | null;
  yRatio: number | null;
  likeCount: number;
  imageUrl: string | null;
  menuBoardImageUrl: string | null;
  waitingOpen: boolean;
  currentWaitingTeams: number;
}

export interface BoothSummary {
  boothId: number;
  name: string;
  description: string;
  xRatio: number | null;
  yRatio: number | null;
  likeCount: number;
  imageUrl: string | null;
  menuBoardImageUrl: string | null;
  waitingOpen: boolean;
}

export interface BoothCreateRequest {
  name: string;
  description?: string;
  xRatio?: number;
  yRatio?: number;
  imageUrl?: string;
  menuBoardImageUrl?: string;
  adminPassword: string;
}

export interface BoothUpdateRequest {
  name?: string;
  description?: string;
  xRatio?: number;
  yRatio?: number;
  imageUrl?: string;
  menuBoardImageUrl?: string;
}

export interface BoothPasswordChangeRequest {
  newPassword: string;
}

export async function listAdminBooths(sort: BoothSort = 'likes'): Promise<BoothListItem[]> {
  const response = await http.get<ApiResponse<BoothListItem[]>>(ENDPOINTS.admin.booths, {
    params: { sort },
  });
  return unwrapApiResponse(response.data);
}

export async function createBooth(payload: BoothCreateRequest): Promise<BoothSummary> {
  const response = await http.post<ApiResponse<BoothSummary>>(
    ENDPOINTS.admin.booths,
    omitUndefined(payload as unknown as Record<string, unknown>),
  );
  return unwrapApiResponse(response.data);
}

export async function updateBooth(
  boothId: number,
  payload: BoothUpdateRequest,
): Promise<BoothSummary> {
  const response = await http.put<ApiResponse<BoothSummary>>(
    ENDPOINTS.admin.boothById(boothId),
    omitUndefined(payload as Record<string, unknown>),
  );
  return unwrapApiResponse(response.data);
}

export async function deleteBooth(boothId: number): Promise<void> {
  const response = await http.delete<ApiResponse<null>>(ENDPOINTS.admin.boothById(boothId));
  unwrapVoidApiResponse(response.data);
}

export async function changeBoothPassword(
  boothId: number,
  payload: BoothPasswordChangeRequest,
): Promise<void> {
  const response = await http.patch<ApiResponse<null>>(
    ENDPOINTS.admin.boothPassword(boothId),
    payload,
  );
  unwrapVoidApiResponse(response.data);
}
