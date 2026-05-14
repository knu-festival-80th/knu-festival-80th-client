export const ROLLING_PAPER_DEFAULT_MESSAGE = '';

export const ROLLING_PAPER_MAX_MESSAGE_LENGTH = 60;
export const ROLLING_PAPER_CHANNEL_CAPACITY = 100;
export const ROLLING_PAPER_CHANNELS_PER_CATEGORY = 20;

export const ROLLING_PAPER_STICKER_COLORS = [
  { id: 'red', label: '레드', value: '#ff3d3d' },
  { id: 'yellow', label: '옐로우', value: '#ffd15c' },
  { id: 'green', label: '그린', value: '#75dd8d' },
  { id: 'blue', label: '블루', value: '#75bdff' },
  { id: 'purple', label: '퍼플', value: '#b9a7ff' },
  { id: 'pink', label: '핑크', value: '#f2a7d7' },
] as const;

export type RollingPaperStickerColorId = (typeof ROLLING_PAPER_STICKER_COLORS)[number]['id'];

export type RollingPaperCategory = {
  id: string;
  label: string;
  description: string;
  questionId?: number;
};

export type RollingPaperChannel = {
  id: string;
  categoryId: string;
  label: string;
  noteCount: number;
  capacity: number;
  boardId?: number;
  questionId?: number;
  boardVariant?: number;
};

export const ROLLING_PAPER_CATEGORIES: RollingPaperCategory[] = [
  {
    id: 'mood',
    label: '오늘의 기분',
    description: '축제에서 느낀 오늘의 감정을 남겨보세요.',
  },
  {
    id: 'food',
    label: '맛있었던 음식',
    description: '가장 기억에 남은 주막 음식과 메뉴를 공유해보세요.',
  },
  {
    id: 'performance',
    label: '재밌었던 공연',
    description: '무대와 공연에 대한 짧은 감상을 남겨보세요.',
  },
  {
    id: 'memory',
    label: '80주년 축하',
    description: '경북대학교 80주년을 축하하는 메시지를 적어주세요.',
  },
  {
    id: 'free',
    label: '자유 메시지',
    description: '축제에서 전하고 싶은 말을 자유롭게 남겨보세요.',
  },
];

export const ROLLING_PAPER_DEFAULT_CATEGORY_ID = ROLLING_PAPER_CATEGORIES[0].id;
export const ROLLING_PAPER_DEFAULT_CHANNEL_ID = 'ch-1';

export const ROLLING_PAPER_CHANNELS: RollingPaperChannel[] = ROLLING_PAPER_CATEGORIES.flatMap(
  (category) =>
    Array.from({ length: ROLLING_PAPER_CHANNELS_PER_CATEGORY }, (_, index) => ({
      id: `ch-${index + 1}`,
      categoryId: category.id,
      label: `CH.${index + 1}`,
      noteCount: category.id === ROLLING_PAPER_DEFAULT_CATEGORY_ID && index === 0 ? 2 : 0,
      capacity: ROLLING_PAPER_CHANNEL_CAPACITY,
    })),
);

export function getRollingPaperCategory(categoryId?: string) {
  return (
    ROLLING_PAPER_CATEGORIES.find((category) => category.id === categoryId) ??
    ROLLING_PAPER_CATEGORIES[0]
  );
}

export function getRollingPaperChannelsByCategory(categoryId?: string) {
  const category = getRollingPaperCategory(categoryId);

  return ROLLING_PAPER_CHANNELS.filter((channel) => channel.categoryId === category.id);
}

export function getRollingPaperChannel(categoryId?: string, channelId?: string) {
  const channels = getRollingPaperChannelsByCategory(categoryId);

  return channels.find((channel) => channel.id === channelId) ?? channels[0];
}

export function getRollingPaperChannelIndex(categoryId?: string, channelId?: string) {
  const channels = getRollingPaperChannelsByCategory(categoryId);
  const selectedChannel = getRollingPaperChannel(categoryId, channelId);
  const index = channels.findIndex((channel) => channel.id === selectedChannel.id);

  return Math.max(0, index);
}

export function getRollingPaperBoardPath(categoryId?: string, channelId?: string) {
  if (categoryId && channelId) {
    return `/rolling-paper/board/${categoryId}/${channelId}`;
  }

  const category = getRollingPaperCategory(categoryId);
  const channel = getRollingPaperChannel(category.id, channelId);

  return `/rolling-paper/board/${category.id}/${channel.id}`;
}
