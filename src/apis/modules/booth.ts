import { ENDPOINTS, http, omitUndefined, unwrapApiResponse, unwrapVoidApiResponse } from '@/apis';
import type { ApiResponse } from '@/apis/types';
import { getMockBooth, getMockBooths, getMockMapBooths } from '@/mocks/taverns';

export type BoothSort = 'likes' | 'waiting-asc';

export type BoothType = 'TAVERN' | 'BOOTH';

export interface BoothListItem {
  boothId: number;
  name: string;
  xRatio: number | null;
  yRatio: number | null;
  likeCount: number;
  menuBoardImageUrl: string | null;
  waitingOpen: boolean;
  currentWaitingTeams: number;
  department: string | null;
  location: string | null;
  type: BoothType | null;
  color: string | null;
}

export interface BoothMapItem {
  boothId: number;
  name: string;
  xRatio: number | null;
  yRatio: number | null;
  type: BoothType | null;
  color: string | null;
}

export interface BoothSummary {
  boothId: number;
  name: string;
  xRatio: number | null;
  yRatio: number | null;
  likeCount: number;
  menuBoardImageUrl: string | null;
  waitingOpen: boolean;
  department: string | null;
  location: string | null;
}

export interface BoothCreateRequest {
  name: string;
  xRatio?: number;
  yRatio?: number;
  menuBoardImageUrl?: string;
  adminPassword: string;
  department?: string;
  location?: string;
}

export interface BoothUpdateRequest {
  name?: string;
  xRatio?: number;
  yRatio?: number;
  menuBoardImageUrl?: string;
  department?: string;
  location?: string;
}

export interface BoothPasswordChangeRequest {
  newPassword: string;
}

export async function listBooths(sort: BoothSort = 'likes'): Promise<BoothListItem[]> {
  if (import.meta.env.DEV) {
    return getMockBooths(sort);
  }

  const response = await http.get<ApiResponse<BoothListItem[]>>(ENDPOINTS.booths.list, {
    params: { sort },
  });
  return unwrapApiResponse(response.data);
}

export async function listMapBooths(): Promise<BoothMapItem[]> {
  if (import.meta.env.DEV) {
    return getMockMapBooths();
  }

  const response = await http.get<ApiResponse<BoothMapItem[]>>(ENDPOINTS.booths.map);
  return unwrapApiResponse(response.data);
}

export async function getBooth(boothId: number): Promise<BoothListItem> {
  if (import.meta.env.DEV) {
    const booth = getMockBooth(boothId);
    if (!booth) throw new Error('주막을 찾을 수 없습니다.');
    return booth;
  }

  const response = await http.get<ApiResponse<BoothListItem>>(ENDPOINTS.booths.detail(boothId));
  return unwrapApiResponse(response.data);
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
