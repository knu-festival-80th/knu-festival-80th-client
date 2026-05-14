import { ENDPOINTS, http, unwrapApiResponse } from '@/apis';
import type { ApiResponse } from '@/apis/types';
import { getRuntimeEnv } from '@/config/runtimeEnv';

export interface ImageUploadResponse {
  /** 즉시 표시 가능한 완전한 URL. */
  url: string;
  /** DB에 저장할 상대 경로. 부스/메뉴의 imageUrl 필드에 다시 PUT/POST 한다. */
  path: string;
}

export async function uploadImage(file: File): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await http.post<ApiResponse<ImageUploadResponse>>(
    ENDPOINTS.admin.uploadImage,
    formData,
  );
  return unwrapApiResponse(response.data);
}

const API_BASE = getRuntimeEnv('VITE_API_BASE_URL') || 'http://localhost:8080';

/**
 * 서버가 응답으로 내려준 이미지 값(완전한 URL이거나 외부 URL)에서 DB-저장용 path 만 추출한다.
 * - 빈 값 → ''
 * - 이미 path(`/`로 시작) → 그대로
 * - VITE_API_BASE_URL prefix 가 있으면 prefix 제거 후 path 만 반환
 * - 그 외 외부 URL은 그대로 (서버가 패스스루로 보존)
 */
export function imageUrlToPath(input: string | null | undefined): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/')) return trimmed;
  const base = API_BASE.replace(/\/$/, '');
  if (trimmed.startsWith(base)) {
    const stripped = trimmed.slice(base.length);
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
  }
  return trimmed;
}

/**
 * path 또는 URL을 화면에 표시할 src로 변환한다.
 * - 빈 값 → undefined
 * - 절대 URL → 그대로
 * - path(`/`로 시작) → API_BASE prefix 추가
 */
export function imagePathToSrc(input: string | null | undefined): string | undefined {
  if (!input) return undefined;
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const base = API_BASE.replace(/\/$/, '');
  return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`;
}
