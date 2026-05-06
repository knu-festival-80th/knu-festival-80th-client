import { ENDPOINTS, http, unwrapApiResponse, unwrapVoidApiResponse } from '@/apis';
import type { ApiResponse } from '@/apis/types';

export type AdminRole = 'SUPER_ADMIN' | 'BOOTH_ADMIN';

export interface LoginRequest {
  boothId: number | null;
  password: string;
}

export interface LoginResponse {
  role: AdminRole;
  boothId: number | null;
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await http.post<ApiResponse<LoginResponse>>(ENDPOINTS.auth.login, payload);
  return unwrapApiResponse(response.data);
}

export async function logout(): Promise<void> {
  const response = await http.post<ApiResponse<null>>(ENDPOINTS.auth.logout);
  unwrapVoidApiResponse(response.data);
}
