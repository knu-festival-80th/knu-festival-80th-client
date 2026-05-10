export const ROLLING_PAPER_DEFAULT_MESSAGE = '';

export const ROLLING_PAPER_MAX_MESSAGE_LENGTH = 80;

export const ROLLING_PAPER_STICKER_COLORS = [
  { id: 'red', label: '레드', value: '#ff3d3d' },
  { id: 'yellow', label: '옐로우', value: '#ffd15c' },
  { id: 'green', label: '그린', value: '#75dd8d' },
  { id: 'blue', label: '블루', value: '#75bdff' },
  { id: 'purple', label: '퍼플', value: '#b9a7ff' },
  { id: 'pink', label: '핑크', value: '#f2a7d7' },
] as const;

export type RollingPaperStickerColorId = (typeof ROLLING_PAPER_STICKER_COLORS)[number]['id'];
