import { ROLLING_PAPER_STICKER_COLORS } from '@/constants/rollingPaper';
import {
  clampRollingPaperPlacement,
  findNearestAvailableRollingPaperPlacement,
  type PlacedRollingPaperNote,
  type RollingPaperPlacement,
} from '@/lib/rollingPaperLayout';

export const ROLLING_PAPER_PERFORMANCE_TEST_COUNTS = [10, 30, 50, 80, 100, 200] as const;

type RollingPaperPerformanceTestCount = (typeof ROLLING_PAPER_PERFORMANCE_TEST_COUNTS)[number];

const PERFORMANCE_TEST_MESSAGE_SAMPLES = [
  '경북대학교 80주년을 진심으로 축하해!',
  '오랜 시간 쌓아온 전통처럼 앞으로도 빛나길!',
  '수많은 도전과 가능성을 응원합니다.',
  '오늘의 추억이 오래 남는 축제가 되길!',
  'KNU 80th, 더 큰 순간을 함께 만들자.',
] as const;

function isPerformanceTestCount(count: number): count is RollingPaperPerformanceTestCount {
  return ROLLING_PAPER_PERFORMANCE_TEST_COUNTS.includes(count as RollingPaperPerformanceTestCount);
}

function getTargetPlacement(index: number): RollingPaperPlacement {
  const columnCount = 20;
  const row = Math.floor(index / columnCount) % columnCount;
  const column = index % columnCount;

  return {
    x: 5 + column * 4.75 + (row % 2) * 2.2,
    y: 5 + row * 4.75,
  };
}

function getFallbackTargetPlacement(index: number): RollingPaperPlacement {
  const columnCount = 26;
  const row = Math.floor(index / columnCount);
  const column = index % columnCount;

  return {
    x: 3.5 + column * 3.7 + (row % 2) * 1.6,
    y: 3.5 + row * 3.7,
  };
}

function createRollingPaperPerformanceNotes(count: RollingPaperPerformanceTestCount) {
  const notes: PlacedRollingPaperNote[] = [];

  for (let index = 0; index < count; index += 1) {
    const color = ROLLING_PAPER_STICKER_COLORS[index % ROLLING_PAPER_STICKER_COLORS.length];
    const placement =
      findNearestAvailableRollingPaperPlacement(getTargetPlacement(index), color.id, notes, 0) ??
      findNearestAvailableRollingPaperPlacement(
        getFallbackTargetPlacement(index),
        color.id,
        notes,
        0,
      ) ??
      findNearestAvailableRollingPaperPlacement({ x: 50, y: 50 }, color.id, notes, 0);

    if (!placement && count !== 200) {
      throw new Error(`Failed to create rolling paper performance fixture: ${count}`);
    }

    const stressPlacement =
      placement ?? clampRollingPaperPlacement(getFallbackTargetPlacement(index), color.id);

    notes.push({
      id: `rolling-paper-performance-${count}-${index + 1}`,
      boardVariant: 0,
      colorId: color.id,
      message: PERFORMANCE_TEST_MESSAGE_SAMPLES[index % PERFORMANCE_TEST_MESSAGE_SAMPLES.length],
      x: stressPlacement.x,
      y: stressPlacement.y,
    });
  }

  return notes;
}

const rollingPaperPerformanceNotesCache = new Map<
  RollingPaperPerformanceTestCount,
  PlacedRollingPaperNote[]
>();

export function getRollingPaperPerformanceNotes(count: number) {
  if (!isPerformanceTestCount(count)) {
    return [];
  }

  const cachedNotes = rollingPaperPerformanceNotesCache.get(count);

  if (cachedNotes) {
    return cachedNotes;
  }

  const notes = createRollingPaperPerformanceNotes(count);

  rollingPaperPerformanceNotesCache.set(count, notes);

  return notes;
}

export function getRollingPaperPerformanceNotesFromSearch(search: string) {
  const searchParams = new URLSearchParams(search);
  const count = Number(searchParams.get('rollingPaperMock'));

  return getRollingPaperPerformanceNotes(count);
}
