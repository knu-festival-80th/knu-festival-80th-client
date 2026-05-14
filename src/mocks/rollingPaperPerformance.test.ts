import { describe, expect, it } from 'vitest';
import {
  ROLLING_PAPER_PERFORMANCE_TEST_COUNTS,
  getRollingPaperPerformanceNotes,
  getRollingPaperPerformanceNotesFromSearch,
} from './rollingPaperPerformance';

describe('rollingPaperPerformance mocks', () => {
  it('creates deterministic note fixtures for supported performance counts', () => {
    ROLLING_PAPER_PERFORMANCE_TEST_COUNTS.forEach((count) => {
      const notes = getRollingPaperPerformanceNotes(count);

      expect(notes).toHaveLength(count);
      expect(notes.every((note) => note.boardVariant === 0)).toBe(true);
      expect(notes.every((note) => note.message.length > 0)).toBe(true);
    });
  });

  it('reads the performance fixture count from query string', () => {
    expect(getRollingPaperPerformanceNotesFromSearch('?rollingPaperMock=50')).toHaveLength(50);
    expect(getRollingPaperPerformanceNotesFromSearch('?rollingPaperMock=200')).toHaveLength(200);
    expect(getRollingPaperPerformanceNotesFromSearch('?rollingPaperMock=25')).toEqual([]);
  });
});
