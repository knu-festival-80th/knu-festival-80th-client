import { ENDPOINTS, http, unwrapApiResponse, unwrapVoidApiResponse } from '@/apis';
import type { ApiResponse } from '@/apis/types';

export type CanvasColorId = 1 | 2 | 3 | 4 | 5 | 6;

export interface CanvasPlacement {
  x: number;
  y: number;
}

export interface CanvasBoardQuestionResponse {
  questionId: number;
  content: string;
  description: string | null;
  orderIndex: number;
}

export interface CanvasBoardSummaryResponse {
  boardId: number;
  questionId: number;
  boardVariant: number;
  noteCount: number;
  maxNoteCount: number;
}

export interface CanvasPostitResponse {
  canvasPostitId: number;
  boardId: number;
  boardVariant: number;
  colorId: CanvasColorId;
  message: string;
  placement: CanvasPlacement;
  createdAt: string;
}

export interface CanvasPostitCreateRequest {
  boardId: number;
  colorId: CanvasColorId;
  message: string;
  placement: CanvasPlacement;
}

export type CanvasPostitCreateResponse = CanvasPostitResponse;

export interface CanvasBoardCreateRequest {
  questionId: number;
  maxNoteCount: number;
}

export async function listQuestions(): Promise<CanvasBoardQuestionResponse[]> {
  const response = await http.get<ApiResponse<CanvasBoardQuestionResponse[]>>(
    ENDPOINTS.canvas.questions,
  );

  return unwrapApiResponse(response.data);
}

export async function listBoards(questionId: number): Promise<CanvasBoardSummaryResponse[]> {
  const response = await http.get<ApiResponse<CanvasBoardSummaryResponse[]>>(
    ENDPOINTS.canvas.boards,
    {
      params: { questionId },
    },
  );

  return unwrapApiResponse(response.data);
}

export async function listPostits(boardId: number): Promise<CanvasPostitResponse[]> {
  const response = await http.get<ApiResponse<CanvasPostitResponse[]>>(ENDPOINTS.canvas.postits, {
    params: { boardId },
  });

  return unwrapApiResponse(response.data);
}

export async function createPostit(
  payload: CanvasPostitCreateRequest,
): Promise<CanvasPostitCreateResponse> {
  const response = await http.post<ApiResponse<CanvasPostitCreateResponse>>(
    ENDPOINTS.canvas.postits,
    payload,
  );

  return unwrapApiResponse(response.data);
}

export async function createBoard(payload: CanvasBoardCreateRequest): Promise<number> {
  const response = await http.post<ApiResponse<number>>(ENDPOINTS.admin.canvas.boards, payload);

  return unwrapApiResponse(response.data);
}

export async function deletePostit(postitId: number): Promise<void> {
  const response = await http.delete<ApiResponse<null>>(
    ENDPOINTS.admin.canvas.postitById(postitId),
  );

  unwrapVoidApiResponse(response.data);
}
