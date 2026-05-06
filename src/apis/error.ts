import axios from 'axios';

import type { ApiResponse } from './types';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function pickErrorInfo(payload: unknown): { code?: string; message?: string } {
  if (!isObject(payload)) {
    return {};
  }

  const error = isObject(payload.error) ? payload.error : undefined;
  const code = typeof error?.code === 'string' ? error.code : undefined;
  const message = typeof error?.message === 'string' ? error.message : undefined;

  return { code, message };
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly raw?: unknown;

  constructor(
    message: string,
    options: {
      status: number;
      code?: string;
      raw?: unknown;
    },
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = options.status;
    this.code = options.code;
    this.raw = options.raw;
  }
}

export function toApiClientError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const info = pickErrorInfo(error.response?.data);
    const status = error.response?.status ?? 0;
    const message = info.message ?? error.message ?? '요청 처리 중 오류가 발생했습니다.';

    return new ApiClientError(message, {
      status,
      code: info.code,
      raw: error,
    });
  }

  if (error instanceof Error) {
    return new ApiClientError(error.message, {
      status: 0,
      raw: error,
    });
  }

  return new ApiClientError('알 수 없는 오류가 발생했습니다.', {
    status: 0,
    raw: error,
  });
}

export function unwrapApiResponse<T>(payload: ApiResponse<T>): T {
  if (!payload.success || payload.data === null) {
    throw new ApiClientError(payload.error?.message ?? '요청 처리에 실패했습니다.', {
      status: 200,
      code: payload.error?.code,
      raw: payload,
    });
  }

  return payload.data;
}

export function unwrapVoidApiResponse(payload: ApiResponse<unknown>): void {
  if (!payload.success) {
    throw new ApiClientError(payload.error?.message ?? '요청 처리에 실패했습니다.', {
      status: 200,
      code: payload.error?.code,
      raw: payload,
    });
  }
}
