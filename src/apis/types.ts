export interface ApiErrorBody {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorBody | null;
}

export interface ApiErrorInfo {
  status: number;
  code?: string;
  message: string;
}

export interface CursorPaginationParams {
  lastId?: number;
  size?: number;
}

export type PartialUpdate<T> = Partial<T>;
