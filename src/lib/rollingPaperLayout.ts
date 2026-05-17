import type { RollingPaperStickerColorId } from '@/constants/rollingPaper';

export type RollingPaperPlacement = {
  x: number;
  y: number;
};

export type RollingPaperPan = {
  x: number;
  y: number;
};

export type PlacedRollingPaperNote = {
  id: string;
  postitId?: number;
  boardId?: number;
  isPending?: boolean;
  isLocalOnly?: boolean;
  isConflictPlaceholder?: boolean;
  pendingVisibleUntil?: number;
  message: string;
  colorId: RollingPaperStickerColorId;
  x: number;
  y: number;
  boardVariant: number;
  categoryId?: string;
  channelId?: string;
};

export type RollingPaperScaleMode = 'contain' | 'cover';

type RollingPaperRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

type RollingPaperBoardScope = {
  categoryId?: string;
  channelId?: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const BOARD_PADDING_PX = {
  top: 20,
  right: 14,
  bottom: 20,
  left: 14,
} as const;

export const ROLLING_PAPER_COLLISION_SCALE = 0.6;
export const ROLLING_PAPER_CLIENT_COLLISION_SCALE = ROLLING_PAPER_COLLISION_SCALE;
const SEARCH_STEP_PX = 8;
const SEARCH_ANGLE_STEP = 15;
const FRAME_VARIANT_OFFSETS = [
  { x: 0, y: 0 },
  { x: 0, y: 0 },
] as const;

const STICKER_ASPECT_RATIOS: Record<RollingPaperStickerColorId, number> = {
  red: 249 / 271,
  yellow: 270 / 274,
  green: 361 / 253,
  blue: 204 / 326,
  purple: 259 / 259,
  pink: 271 / 271,
};

export const ROLLING_PAPER_CANVAS_DIMENSIONS = {
  width: 852,
  height: 852,
} as const;

export const ROLLING_PAPER_BOARD_VIEWPORT = {
  width: 375,
  height: 509,
} as const;

export const ROLLING_PAPER_PREVIEW_VIEWPORT = {
  width: 287,
  height: 375,
} as const;

export const ROLLING_PAPER_FRAME_DIMENSIONS = {
  width: 320,
  height: 320,
  blockedPadding: 26,
} as const;

export const ROLLING_PAPER_NOTE_WIDTH = 80;
export const ROLLING_PAPER_MAX_NOTES_PER_BOARD = 100;
export const ROLLING_PAPER_ZOOM = {
  min: 0.7,
  max: 12,
  default: 1,
  step: 0.5,
} as const;
export const ROLLING_PAPER_NOTE_FOCUS_ZOOM = 10.5;

const NOTE_FOCUS_VIEWPORT_RATIO = {
  width: 0.86,
  height: 0.74,
} as const;

const toPercent = (value: number, total: number) => Number(((value / total) * 100).toFixed(2));
const toPixels = (value: number, total: number) => (value / 100) * total;

function roundPlacement(placement: RollingPaperPlacement) {
  return {
    x: Number(placement.x.toFixed(2)),
    y: Number(placement.y.toFixed(2)),
  };
}

function roundPan(pan: RollingPaperPan) {
  return {
    x: Number(pan.x.toFixed(2)),
    y: Number(pan.y.toFixed(2)),
  };
}

function doRectsOverlap(firstRect: RollingPaperRect, secondRect: RollingPaperRect) {
  return (
    firstRect.left < secondRect.right &&
    firstRect.right > secondRect.left &&
    firstRect.top < secondRect.bottom &&
    firstRect.bottom > secondRect.top
  );
}

function getRollingPaperRect(
  placement: RollingPaperPlacement,
  colorId: RollingPaperStickerColorId,
  noteWidthPx = ROLLING_PAPER_NOTE_WIDTH,
  scale = 1,
): RollingPaperRect {
  const noteSize = getRollingPaperNoteSize(colorId, noteWidthPx);
  const width = noteSize.width * scale;
  const height = noteSize.height * scale;
  const centerX = toPixels(placement.x, ROLLING_PAPER_CANVAS_DIMENSIONS.width);
  const centerY = toPixels(placement.y, ROLLING_PAPER_CANVAS_DIMENSIONS.height);

  return {
    left: centerX - width / 2,
    top: centerY - height / 2,
    right: centerX + width / 2,
    bottom: centerY + height / 2,
  };
}

function getFrameVariantOffset(boardVariant: number) {
  return (
    FRAME_VARIANT_OFFSETS[boardVariant % FRAME_VARIANT_OFFSETS.length] ?? FRAME_VARIANT_OFFSETS[0]
  );
}

function isInBoardScope(note: PlacedRollingPaperNote, scope?: RollingPaperBoardScope) {
  if (!scope?.categoryId || !scope?.channelId || !note.categoryId || !note.channelId) {
    return true;
  }

  return note.categoryId === scope.categoryId && note.channelId === scope.channelId;
}

export function clampRollingPaperScale(scale: number) {
  const roundedScale = Number(scale.toFixed(2));

  return Math.min(ROLLING_PAPER_ZOOM.max, Math.max(ROLLING_PAPER_ZOOM.min, roundedScale));
}

export function getPlacedNotesForBoard(
  notes: PlacedRollingPaperNote[],
  boardVariant: number,
  scope?: RollingPaperBoardScope,
) {
  return notes.filter((note) => note.boardVariant === boardVariant && isInBoardScope(note, scope));
}

export function getRollingPaperNoteSize(
  colorId: RollingPaperStickerColorId,
  noteWidthPx = ROLLING_PAPER_NOTE_WIDTH,
) {
  const height = noteWidthPx * STICKER_ASPECT_RATIOS[colorId];

  return {
    width: noteWidthPx,
    height: Number(height.toFixed(2)),
  };
}

export function getRollingPaperFrameRect(boardVariant = 0) {
  const offset = getFrameVariantOffset(boardVariant);

  return {
    x:
      (ROLLING_PAPER_CANVAS_DIMENSIONS.width - ROLLING_PAPER_FRAME_DIMENSIONS.width) / 2 + offset.x,
    y:
      (ROLLING_PAPER_CANVAS_DIMENSIONS.height - ROLLING_PAPER_FRAME_DIMENSIONS.height) / 2 +
      offset.y,
    width: ROLLING_PAPER_FRAME_DIMENSIONS.width,
    height: ROLLING_PAPER_FRAME_DIMENSIONS.height,
  };
}

export function getRollingPaperBlockedFrameRect(boardVariant = 0) {
  const frameRect = getRollingPaperFrameRect(boardVariant);

  return {
    left: frameRect.x - ROLLING_PAPER_FRAME_DIMENSIONS.blockedPadding,
    top: frameRect.y - ROLLING_PAPER_FRAME_DIMENSIONS.blockedPadding,
    right: frameRect.x + frameRect.width + ROLLING_PAPER_FRAME_DIMENSIONS.blockedPadding,
    bottom: frameRect.y + frameRect.height + ROLLING_PAPER_FRAME_DIMENSIONS.blockedPadding,
  };
}

export function getRollingPaperFitScale(
  viewportWidth: number,
  viewportHeight: number,
  mode: RollingPaperScaleMode = 'contain',
) {
  const widthScale = viewportWidth / ROLLING_PAPER_CANVAS_DIMENSIONS.width;
  const heightScale = viewportHeight / ROLLING_PAPER_CANVAS_DIMENSIONS.height;

  return mode === 'cover' ? Math.max(widthScale, heightScale) : Math.min(widthScale, heightScale);
}

export function getRollingPaperRenderedScale(
  viewportWidth: number,
  viewportHeight: number,
  scale = 1,
  mode: RollingPaperScaleMode = 'contain',
) {
  return getRollingPaperFitScale(viewportWidth, viewportHeight, mode) * scale;
}

export function getRollingPaperPanBounds(
  viewportWidth: number,
  viewportHeight: number,
  scale = 1,
  mode: RollingPaperScaleMode = 'contain',
) {
  const renderedScale = getRollingPaperRenderedScale(viewportWidth, viewportHeight, scale, mode);

  return {
    maxX: Math.max(0, (ROLLING_PAPER_CANVAS_DIMENSIONS.width * renderedScale - viewportWidth) / 2),
    maxY: Math.max(
      0,
      (ROLLING_PAPER_CANVAS_DIMENSIONS.height * renderedScale - viewportHeight) / 2,
    ),
  };
}

export function clampRollingPaperPan(
  pan: RollingPaperPan,
  viewportWidth: number,
  viewportHeight: number,
  scale = 1,
  mode: RollingPaperScaleMode = 'contain',
) {
  const { maxX, maxY } = getRollingPaperPanBounds(viewportWidth, viewportHeight, scale, mode);

  return roundPan({
    x: clamp(pan.x, -maxX, maxX),
    y: clamp(pan.y, -maxY, maxY),
  });
}

export function getRollingPaperPlacementFocusPan(
  placement: RollingPaperPlacement,
  viewportWidth: number,
  viewportHeight: number,
  scale = ROLLING_PAPER_NOTE_FOCUS_ZOOM,
  mode: RollingPaperScaleMode = 'contain',
) {
  const renderedScale = getRollingPaperRenderedScale(viewportWidth, viewportHeight, scale, mode);
  const canvasX = toPixels(placement.x, ROLLING_PAPER_CANVAS_DIMENSIONS.width);
  const canvasY = toPixels(placement.y, ROLLING_PAPER_CANVAS_DIMENSIONS.height);

  return clampRollingPaperPan(
    {
      x: (ROLLING_PAPER_CANVAS_DIMENSIONS.width / 2 - canvasX) * renderedScale,
      y: (ROLLING_PAPER_CANVAS_DIMENSIONS.height / 2 - canvasY) * renderedScale,
    },
    viewportWidth,
    viewportHeight,
    scale,
    mode,
  );
}

export function getRollingPaperNoteFocusScale(
  colorId: RollingPaperStickerColorId,
  viewportWidth: number,
  viewportHeight: number,
  mode: RollingPaperScaleMode = 'contain',
) {
  const noteSize = getRollingPaperNoteSize(colorId);
  const fitScale = getRollingPaperFitScale(viewportWidth, viewportHeight, mode);
  const widthScale =
    (viewportWidth * NOTE_FOCUS_VIEWPORT_RATIO.width) / (noteSize.width * fitScale);
  const heightScale =
    (viewportHeight * NOTE_FOCUS_VIEWPORT_RATIO.height) / (noteSize.height * fitScale);

  return clampRollingPaperScale(Math.min(ROLLING_PAPER_NOTE_FOCUS_ZOOM, widthScale, heightScale));
}

export function clampRollingPaperPlacement(
  placement: RollingPaperPlacement,
  colorId: RollingPaperStickerColorId,
  noteWidthPx = ROLLING_PAPER_NOTE_WIDTH,
) {
  const noteSize = getRollingPaperNoteSize(colorId, noteWidthPx);
  const minX = toPercent(
    BOARD_PADDING_PX.left + noteSize.width / 2,
    ROLLING_PAPER_CANVAS_DIMENSIONS.width,
  );
  const maxX = toPercent(
    ROLLING_PAPER_CANVAS_DIMENSIONS.width - BOARD_PADDING_PX.right - noteSize.width / 2,
    ROLLING_PAPER_CANVAS_DIMENSIONS.width,
  );
  const minY = toPercent(
    BOARD_PADDING_PX.top + noteSize.height / 2,
    ROLLING_PAPER_CANVAS_DIMENSIONS.height,
  );
  const maxY = toPercent(
    ROLLING_PAPER_CANVAS_DIMENSIONS.height - BOARD_PADDING_PX.bottom - noteSize.height / 2,
    ROLLING_PAPER_CANVAS_DIMENSIONS.height,
  );

  return roundPlacement({
    x: clamp(placement.x, minX, maxX),
    y: clamp(placement.y, minY, maxY),
  });
}

export function isRollingPaperPlacementAvailable(
  placement: RollingPaperPlacement,
  colorId: RollingPaperStickerColorId,
  placedNotes: PlacedRollingPaperNote[],
  boardVariant = 0,
  excludeNoteId?: string,
  collisionScale = ROLLING_PAPER_COLLISION_SCALE,
) {
  const clampedPlacement = clampRollingPaperPlacement(placement, colorId);
  const candidateRect = getRollingPaperRect(
    clampedPlacement,
    colorId,
    ROLLING_PAPER_NOTE_WIDTH,
    collisionScale,
  );

  if (doRectsOverlap(candidateRect, getRollingPaperBlockedFrameRect(boardVariant))) {
    return false;
  }

  return placedNotes.every((note) => {
    if (note.id === excludeNoteId) {
      return true;
    }

    const existingRect = getRollingPaperRect(
      { x: note.x, y: note.y },
      note.colorId,
      ROLLING_PAPER_NOTE_WIDTH,
      collisionScale,
    );

    return !doRectsOverlap(candidateRect, existingRect);
  });
}

export function findNearestAvailableRollingPaperPlacement(
  targetPlacement: RollingPaperPlacement,
  colorId: RollingPaperStickerColorId,
  placedNotes: PlacedRollingPaperNote[],
  boardVariant = 0,
  excludeNoteId?: string,
  collisionScale = ROLLING_PAPER_COLLISION_SCALE,
) {
  const clampedTarget = clampRollingPaperPlacement(targetPlacement, colorId);

  if (
    isRollingPaperPlacementAvailable(
      clampedTarget,
      colorId,
      placedNotes,
      boardVariant,
      excludeNoteId,
      collisionScale,
    )
  ) {
    return clampedTarget;
  }

  const targetX = toPixels(clampedTarget.x, ROLLING_PAPER_CANVAS_DIMENSIONS.width);
  const targetY = toPixels(clampedTarget.y, ROLLING_PAPER_CANVAS_DIMENSIONS.height);
  const maxRadius = Math.ceil(
    Math.hypot(ROLLING_PAPER_CANVAS_DIMENSIONS.width, ROLLING_PAPER_CANVAS_DIMENSIONS.height),
  );

  for (let radius = SEARCH_STEP_PX; radius <= maxRadius; radius += SEARCH_STEP_PX) {
    for (let angle = 0; angle < 360; angle += SEARCH_ANGLE_STEP) {
      const radian = (angle * Math.PI) / 180;
      const candidatePlacement = clampRollingPaperPlacement(
        {
          x: toPercent(targetX + Math.cos(radian) * radius, ROLLING_PAPER_CANVAS_DIMENSIONS.width),
          y: toPercent(targetY + Math.sin(radian) * radius, ROLLING_PAPER_CANVAS_DIMENSIONS.height),
        },
        colorId,
      );

      if (
        isRollingPaperPlacementAvailable(
          candidatePlacement,
          colorId,
          placedNotes,
          boardVariant,
          excludeNoteId,
          collisionScale,
        )
      ) {
        return candidatePlacement;
      }
    }
  }

  return null;
}
