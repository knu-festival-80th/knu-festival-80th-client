import { ENDPOINTS, http, unwrapApiResponse, unwrapVoidApiResponse } from '@/apis';
import type { ApiResponse } from '@/apis/types';

export interface CanvasQuestion {
  questionId: number;
  content: string;
  description: string;
  orderIndex: number;
}

export interface CanvasBoardSummary {
  boardId: number;
  questionId: number;
  boardVariant: number;
  noteCount: number;
  maxNoteCount: number;
}

export interface CanvasPostit {
  canvasPostitId: number;
  boardId: number;
  boardVariant: number;
  colorId: number;
  message: string;
  placement: { x: number; y: number };
  createdAt: string;
}

export interface CanvasBoardCreateRequest {
  questionId: number;
  maxNoteCount: number;
}

export async function listQuestions(): Promise<CanvasQuestion[]> {
  const response = await http.get<ApiResponse<CanvasQuestion[]>>(ENDPOINTS.canvas.questions);
  return unwrapApiResponse(response.data);
}

export async function listBoardSummaries(questionId: number): Promise<CanvasBoardSummary[]> {
  const response = await http.get<ApiResponse<CanvasBoardSummary[]>>(ENDPOINTS.canvas.boards, {
    params: { questionId },
  });
  return unwrapApiResponse(response.data);
}

export async function listPostits(boardId: number): Promise<CanvasPostit[]> {
  const response = await http.get<ApiResponse<CanvasPostit[]>>(ENDPOINTS.canvas.postits, {
    params: { boardId },
  });
  return unwrapApiResponse(response.data);
}

export async function createBoard(payload: CanvasBoardCreateRequest): Promise<number> {
  const response = await http.post<ApiResponse<number>>(ENDPOINTS.admin.canvasBoards, payload);
  return unwrapApiResponse(response.data);
}

export async function deletePostit(postitId: number): Promise<void> {
  const response = await http.delete<ApiResponse<null>>(ENDPOINTS.admin.canvasPostitById(postitId));
  unwrapVoidApiResponse(response.data);
}
