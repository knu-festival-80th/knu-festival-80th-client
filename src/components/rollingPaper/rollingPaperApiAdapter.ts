import type {
  CanvasBoardQuestionResponse,
  CanvasBoardSummaryResponse,
  CanvasColorId,
  CanvasPostitResponse,
} from '@/apis/modules/rollingPaper';
import {
  ROLLING_PAPER_STICKER_COLORS,
  type RollingPaperCategory,
  type RollingPaperChannel,
  type RollingPaperStickerColorId,
} from '@/constants/rollingPaper';
import type { PlacedRollingPaperNote } from '@/lib/rollingPaperLayout';

const stickerColorIds = ROLLING_PAPER_STICKER_COLORS.map((color) => color.id);

export function toCanvasColorId(colorId: RollingPaperStickerColorId): CanvasColorId {
  return (stickerColorIds.indexOf(colorId) + 1) as CanvasColorId;
}

export function toStickerColorId(colorId: number): RollingPaperStickerColorId {
  return stickerColorIds[colorId - 1] ?? ROLLING_PAPER_STICKER_COLORS[0].id;
}

export function toRollingPaperCategory(
  question: CanvasBoardQuestionResponse,
): RollingPaperCategory {
  return {
    id: String(question.questionId),
    questionId: question.questionId,
    label: question.content,
    description: question.description ?? '',
  };
}

export function toRollingPaperChannel(
  board: CanvasBoardSummaryResponse,
  index: number,
): RollingPaperChannel {
  return {
    id: String(board.boardId),
    boardId: board.boardId,
    questionId: board.questionId,
    categoryId: String(board.questionId),
    label: `CH.${index + 1}`,
    noteCount: board.noteCount,
    capacity: board.maxNoteCount,
    boardVariant: board.boardVariant,
  };
}

export function toPlacedRollingPaperNote(postit: CanvasPostitResponse): PlacedRollingPaperNote {
  return {
    id: String(postit.canvasPostitId),
    postitId: postit.canvasPostitId,
    boardId: postit.boardId,
    message: postit.message,
    colorId: toStickerColorId(postit.colorId),
    x: postit.placement.x,
    y: postit.placement.y,
    boardVariant: postit.boardVariant,
    categoryId: undefined,
    channelId: String(postit.boardId),
  };
}
