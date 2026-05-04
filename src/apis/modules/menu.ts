import { ENDPOINTS, http, omitUndefined, unwrapApiResponse, unwrapVoidApiResponse } from '@/apis';
import type { ApiResponse } from '@/apis/types';

export interface MenuItem {
  menuId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  description: string | null;
  soldOut: boolean;
}

export interface MenuCreateRequest {
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
}

export interface MenuUpdateRequest {
  name?: string;
  price?: number;
  imageUrl?: string;
  description?: string;
}

export async function listMenus(boothId: number): Promise<MenuItem[]> {
  const response = await http.get<ApiResponse<MenuItem[]>>(ENDPOINTS.admin.menus(boothId));
  return unwrapApiResponse(response.data);
}

export async function createMenu(boothId: number, payload: MenuCreateRequest): Promise<MenuItem> {
  const response = await http.post<ApiResponse<MenuItem>>(
    ENDPOINTS.admin.menus(boothId),
    omitUndefined(payload as unknown as Record<string, unknown>),
  );
  return unwrapApiResponse(response.data);
}

export async function updateMenu(
  boothId: number,
  menuId: number,
  payload: MenuUpdateRequest,
): Promise<MenuItem> {
  const response = await http.put<ApiResponse<MenuItem>>(
    ENDPOINTS.admin.menuById(boothId, menuId),
    omitUndefined(payload as Record<string, unknown>),
  );
  return unwrapApiResponse(response.data);
}

export async function toggleMenuSoldOut(boothId: number, menuId: number): Promise<MenuItem> {
  const response = await http.patch<ApiResponse<MenuItem>>(
    ENDPOINTS.admin.menuSoldOut(boothId, menuId),
  );
  return unwrapApiResponse(response.data);
}

export async function deleteMenu(boothId: number, menuId: number): Promise<void> {
  const response = await http.delete<ApiResponse<null>>(ENDPOINTS.admin.menuById(boothId, menuId));
  unwrapVoidApiResponse(response.data);
}
