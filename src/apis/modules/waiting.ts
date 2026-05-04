import { ENDPOINTS, http, unwrapApiResponse, unwrapVoidApiResponse } from '@/apis';
import type { ApiResponse } from '@/apis/types';

export type WaitingStatus = 'WAITING' | 'CALLED' | 'ENTERED' | 'SKIPPED' | 'CANCELLED';

export interface WaitingItem {
  waitingId: number;
  boothId: number;
  waitingNumber: number;
  sortOrder: number;
  name: string;
  partySize: number;
  maskedPhoneNumber: string;
  status: WaitingStatus;
  smsSent: boolean;
  calledAt: string | null;
  enteredAt: string | null;
  createdAt: string;
}

export interface WaitingInsertRequest {
  name: string;
  partySize: number;
  phoneNumber: string;
  insertAfterSortOrder: number;
}

export interface WaitingReorderRequest {
  newSortOrder: number;
}

export interface WaitingToggleRequest {
  open: boolean;
}

export interface WaitingRegisterResponse {
  waitingId: number;
  waitingNumber: number;
  boothName: string;
  currentWaitingTeams: number;
  estimatedWaitMinutes: number;
}

export async function listWaitings(
  boothId: number,
  status?: WaitingStatus,
): Promise<WaitingItem[]> {
  const response = await http.get<ApiResponse<WaitingItem[]>>(ENDPOINTS.booth.waitings(boothId), {
    params: status ? { status } : undefined,
  });
  return unwrapApiResponse(response.data);
}

export async function callWaiting(waitingId: number): Promise<void> {
  const response = await http.patch<ApiResponse<null>>(ENDPOINTS.booth.waitingCall(waitingId));
  unwrapVoidApiResponse(response.data);
}

export async function enterWaiting(waitingId: number): Promise<void> {
  const response = await http.patch<ApiResponse<null>>(ENDPOINTS.booth.waitingEnter(waitingId));
  unwrapVoidApiResponse(response.data);
}

export async function cancelWaiting(waitingId: number): Promise<void> {
  const response = await http.patch<ApiResponse<null>>(ENDPOINTS.booth.waitingCancel(waitingId));
  unwrapVoidApiResponse(response.data);
}

export async function skipWaiting(waitingId: number): Promise<void> {
  const response = await http.patch<ApiResponse<null>>(ENDPOINTS.booth.waitingSkip(waitingId));
  unwrapVoidApiResponse(response.data);
}

export async function reorderWaiting(
  waitingId: number,
  payload: WaitingReorderRequest,
): Promise<void> {
  const response = await http.patch<ApiResponse<null>>(
    ENDPOINTS.booth.waitingReorder(waitingId),
    payload,
  );
  unwrapVoidApiResponse(response.data);
}

export async function resendWaitingSms(waitingId: number): Promise<void> {
  const response = await http.post<ApiResponse<null>>(ENDPOINTS.booth.waitingResendSms(waitingId));
  unwrapVoidApiResponse(response.data);
}

export async function insertWaiting(
  boothId: number,
  payload: WaitingInsertRequest,
): Promise<WaitingRegisterResponse> {
  const response = await http.post<ApiResponse<WaitingRegisterResponse>>(
    ENDPOINTS.booth.waitingInsert(boothId),
    payload,
  );
  return unwrapApiResponse(response.data);
}

export async function toggleBoothWaiting(
  boothId: number,
  payload: WaitingToggleRequest,
): Promise<void> {
  const response = await http.patch<ApiResponse<null>>(
    ENDPOINTS.booth.waitingToggle(boothId),
    payload,
  );
  unwrapVoidApiResponse(response.data);
}
