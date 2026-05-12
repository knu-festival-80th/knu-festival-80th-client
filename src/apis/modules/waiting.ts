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
  const response = await http.get<ApiResponse<WaitingItem[]>>(ENDPOINTS.admin.waitings(boothId), {
    params: status ? { status } : undefined,
  });
  return unwrapApiResponse(response.data);
}

export async function callWaiting(waitingId: number): Promise<void> {
  const response = await http.patch<ApiResponse<null>>(ENDPOINTS.admin.waitingCall(waitingId));
  unwrapVoidApiResponse(response.data);
}

export async function enterWaiting(waitingId: number): Promise<void> {
  const response = await http.patch<ApiResponse<null>>(ENDPOINTS.admin.waitingEnter(waitingId));
  unwrapVoidApiResponse(response.data);
}

export async function cancelWaiting(waitingId: number): Promise<void> {
  const response = await http.patch<ApiResponse<null>>(ENDPOINTS.admin.waitingCancel(waitingId));
  unwrapVoidApiResponse(response.data);
}

export async function skipWaiting(waitingId: number): Promise<void> {
  const response = await http.patch<ApiResponse<null>>(ENDPOINTS.admin.waitingSkip(waitingId));
  unwrapVoidApiResponse(response.data);
}

export async function reorderWaiting(
  waitingId: number,
  payload: WaitingReorderRequest,
): Promise<void> {
  const response = await http.patch<ApiResponse<null>>(
    ENDPOINTS.admin.waitingReorder(waitingId),
    payload,
  );
  unwrapVoidApiResponse(response.data);
}

export async function resendWaitingSms(waitingId: number): Promise<void> {
  const response = await http.post<ApiResponse<null>>(ENDPOINTS.admin.waitingResendSms(waitingId));
  unwrapVoidApiResponse(response.data);
}

export async function insertWaiting(
  boothId: number,
  payload: WaitingInsertRequest,
): Promise<WaitingRegisterResponse> {
  const response = await http.post<ApiResponse<WaitingRegisterResponse>>(
    ENDPOINTS.admin.waitingInsert(boothId),
    payload,
  );
  return unwrapApiResponse(response.data);
}

export async function toggleBoothWaiting(
  boothId: number,
  payload: WaitingToggleRequest,
): Promise<void> {
  const response = await http.patch<ApiResponse<null>>(
    ENDPOINTS.admin.waitingToggle(boothId),
    payload,
  );
  unwrapVoidApiResponse(response.data);
}

/* ── 사용자 API ── */

export interface WaitingCreateRequest {
  name: string;
  partySize: number;
  phoneNumber: string;
}

export interface MyWaitingItem {
  waitingId: number;
  boothId: number;
  boothName: string;
  waitingNumber: number;
  status: string;
  aheadCount: number;
  estimatedWaitMinutes: number;
}

export async function registerWaiting(
  boothId: number,
  payload: WaitingCreateRequest,
): Promise<WaitingRegisterResponse> {
  const response = await http.post<ApiResponse<WaitingRegisterResponse>>(
    ENDPOINTS.booths.registerWaiting(boothId),
    payload,
  );
  return unwrapApiResponse(response.data);
}

export async function lookupMyWaitings(
  name: string,
  phoneNumber: string,
): Promise<MyWaitingItem[]> {
  const response = await http.post<ApiResponse<MyWaitingItem[]>>(ENDPOINTS.waitings.my, {
    name,
    phoneNumber,
  });
  return unwrapApiResponse(response.data);
}

export async function cancelMyWaiting(waitingId: number, phoneLast4: string): Promise<void> {
  const response = await http.delete<ApiResponse<null>>(ENDPOINTS.waitings.detail(waitingId), {
    params: { phoneLast4 },
  });
  unwrapVoidApiResponse(response.data);
}

export interface WaitingStatusResponse {
  boothId: number;
  waitingOpen: boolean;
  currentWaitingTeams: number;
  estimatedWaitMinutes: number;
}

export async function getBoothWaitingStatus(boothId: number): Promise<WaitingStatusResponse> {
  const response = await http.get<ApiResponse<WaitingStatusResponse>>(
    ENDPOINTS.booths.waitingStatus(boothId),
  );
  return unwrapApiResponse(response.data);
}
