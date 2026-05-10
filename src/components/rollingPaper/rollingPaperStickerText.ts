import type { CSSProperties } from 'react';
import type { RollingPaperStickerColorId } from '@/constants/rollingPaper';

type RollingPaperStickerTextStyle = Pick<
  CSSProperties,
  'fontSize' | 'letterSpacing' | 'lineHeight'
>;

type RollingPaperStickerTextInputStyle = RollingPaperStickerTextStyle &
  Pick<CSSProperties, 'boxSizing'> & {
    paddingTop: string;
    paddingBottom: string;
  };

type RollingPaperStickerTextConfig = {
  centerX: string;
  centerY: string;
  width: string;
  height: string;
  aspectRatio: number;
  heightRatio: number;
  maxLines: number;
  charsPerLine: number;
};

const FIGMA_MODAL_FONT_SIZE_PX = 12;
const STICKER_TEXT_LINE_HEIGHT = 1.6;
const BOARD_TEXT_FONT_SIZE_CQW = 5;

export const ROLLING_PAPER_STICKER_TEXT_CONFIG: Record<
  RollingPaperStickerColorId,
  RollingPaperStickerTextConfig
> = {
  red: {
    centerX: '50%',
    centerY: '53%',
    width: '52%',
    height: '34%',
    aspectRatio: 249 / 271,
    heightRatio: 0.34,
    maxLines: 4,
    charsPerLine: 13,
  },
  yellow: {
    centerX: '50%',
    centerY: '50%',
    width: '52%',
    height: '43%',
    aspectRatio: 270 / 274,
    heightRatio: 0.43,
    maxLines: 4,
    charsPerLine: 13,
  },
  green: {
    centerX: '50%',
    centerY: '34%',
    width: '58%',
    height: '24%',
    aspectRatio: 361 / 253,
    heightRatio: 0.24,
    maxLines: 3,
    charsPerLine: 12,
  },
  blue: {
    centerX: '50%',
    centerY: '53%',
    width: '70%',
    height: '38%',
    aspectRatio: 204 / 326,
    heightRatio: 0.38,
    maxLines: 3,
    charsPerLine: 17,
  },
  purple: {
    centerX: '50%',
    centerY: '50%',
    width: '54%',
    height: '42%',
    aspectRatio: 259 / 259,
    heightRatio: 0.42,
    maxLines: 4,
    charsPerLine: 13,
  },
  pink: {
    centerX: '50%',
    centerY: '50%',
    width: '43%',
    height: '34%',
    aspectRatio: 271 / 271,
    heightRatio: 0.34,
    maxLines: 4,
    charsPerLine: 13,
  },
};

export function getRollingPaperStickerTextConfig(colorId: RollingPaperStickerColorId) {
  return ROLLING_PAPER_STICKER_TEXT_CONFIG[colorId] ?? ROLLING_PAPER_STICKER_TEXT_CONFIG.red;
}

export function getRollingPaperStickerTextBoxStyle(
  colorId: RollingPaperStickerColorId,
): CSSProperties {
  const textConfig = getRollingPaperStickerTextConfig(colorId);

  return {
    left: textConfig.centerX,
    top: textConfig.centerY,
    width: textConfig.width,
    height: textConfig.height,
    transform: 'translate(-50%, -50%)',
  };
}

function getCharacterWeight(character: string) {
  if (/\s/.test(character)) {
    return 0.35;
  }

  if (/[\u3131-\u318e\uac00-\ud7a3]/.test(character)) {
    return 1;
  }

  if (/[a-zA-Z0-9]/.test(character)) {
    return 0.58;
  }

  if (/[.,!?\'"“”‘’()[\]{}:;]/.test(character)) {
    return 0.38;
  }

  return 1.15;
}

function getWeightedTextLength(text: string) {
  return [...text].reduce((length, character) => length + getCharacterWeight(character), 0);
}

function getEstimatedLineCount(message: string, charsPerLine: number) {
  return message.split('\n').reduce((lineCount, line) => {
    return lineCount + Math.max(1, Math.ceil(getWeightedTextLength(line) / charsPerLine));
  }, 0);
}

function getRollingPaperStickerEstimatedLines(
  message: string,
  colorId: RollingPaperStickerColorId,
) {
  const textConfig = getRollingPaperStickerTextConfig(colorId);
  const measuredMessage = message || ' ';

  return Math.min(
    getEstimatedLineCount(measuredMessage, textConfig.charsPerLine),
    textConfig.maxLines,
  );
}

export function getRollingPaperStickerTextStyle(
  message: string,
  colorId: RollingPaperStickerColorId,
): RollingPaperStickerTextStyle {
  void message;
  void colorId;

  return {
    fontSize: `clamp(6px, ${BOARD_TEXT_FONT_SIZE_CQW}cqw, 12px)`,
    letterSpacing: '-0.03em',
    lineHeight: String(STICKER_TEXT_LINE_HEIGHT),
  };
}

export function getRollingPaperStickerTextInputStyle(
  message: string,
  colorId: RollingPaperStickerColorId,
): RollingPaperStickerTextInputStyle {
  const textConfig = getRollingPaperStickerTextConfig(colorId);
  const estimatedLines = getRollingPaperStickerEstimatedLines(message, colorId);
  const textBoxHeightCqw = textConfig.heightRatio * textConfig.aspectRatio * 100;
  const textBlockHeightPx = estimatedLines * FIGMA_MODAL_FONT_SIZE_PX * STICKER_TEXT_LINE_HEIGHT;
  const verticalPadding = `max(0px, calc((${textBoxHeightCqw.toFixed(2)}cqw - ${textBlockHeightPx}px) / 2))`;

  return {
    fontSize: `${FIGMA_MODAL_FONT_SIZE_PX}px`,
    letterSpacing: '-0.02em',
    lineHeight: String(STICKER_TEXT_LINE_HEIGHT),
    boxSizing: 'border-box',
    paddingTop: verticalPadding,
    paddingBottom: verticalPadding,
  };
}

export function doesRollingPaperMessageFitSticker(
  message: string,
  colorId: RollingPaperStickerColorId,
) {
  const textConfig = getRollingPaperStickerTextConfig(colorId);

  return getEstimatedLineCount(message || ' ', textConfig.charsPerLine) <= textConfig.maxLines;
}

export function limitRollingPaperMessageForSticker(
  message: string,
  colorId: RollingPaperStickerColorId,
  maxLength: number,
) {
  let nextMessage = message.slice(0, maxLength);

  while (nextMessage.length > 0 && !doesRollingPaperMessageFitSticker(nextMessage, colorId)) {
    nextMessage = nextMessage.slice(0, -1);
  }

  return nextMessage;
}
