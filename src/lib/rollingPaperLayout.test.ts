import { describe, expect, it } from 'vitest';
import {
  ROLLING_PAPER_BOARD_VIEWPORT,
  ROLLING_PAPER_CANVAS_DIMENSIONS,
  ROLLING_PAPER_MAX_NOTES_PER_BOARD,
  ROLLING_PAPER_NOTE_FOCUS_ZOOM,
  clampRollingPaperPan,
  clampRollingPaperPlacement,
  clampRollingPaperScale,
  findNearestAvailableRollingPaperPlacement,
  getPlacedNotesForBoard,
  getRollingPaperNoteFocusScale,
  getRollingPaperNoteSize,
  getRollingPaperPlacementFocusPan,
  getRollingPaperRenderedScale,
  getRollingPaperBlockedFrameRect,
  getRollingPaperFrameRect,
  isRollingPaperPlacementAvailable,
  type PlacedRollingPaperNote,
} from './rollingPaperLayout';

function createPlacedNote(
  id: string,
  boardVariant: number,
  x: number,
  y: number,
  colorId: PlacedRollingPaperNote['colorId'] = 'red',
): PlacedRollingPaperNote {
  return {
    id,
    message: '축하합니다',
    colorId,
    x,
    y,
    boardVariant,
  };
}

describe('rollingPaperLayout', () => {
  it('keeps placements inside the logical canvas bounds', () => {
    const topLeftPlacement = clampRollingPaperPlacement({ x: -10, y: -10 }, 'green');
    const bottomRightPlacement = clampRollingPaperPlacement({ x: 110, y: 110 }, 'blue');

    expect(topLeftPlacement.x).toBeGreaterThan(0);
    expect(topLeftPlacement.y).toBeGreaterThan(0);
    expect(bottomRightPlacement.x).toBeLessThan(100);
    expect(bottomRightPlacement.y).toBeLessThan(100);
    expect(topLeftPlacement).toEqual(clampRollingPaperPlacement(topLeftPlacement, 'green'));
    expect(bottomRightPlacement).toEqual(clampRollingPaperPlacement(bottomRightPlacement, 'blue'));
  });

  it('blocks placements that overlap the centered frame zone', () => {
    expect(isRollingPaperPlacementAvailable({ x: 50, y: 50 }, 'red', [], 0)).toBe(false);
    expect(isRollingPaperPlacementAvailable({ x: 12, y: 16 }, 'red', [], 0)).toBe(true);
  });

  it('centers the 320px mascot frame on the Figma-sized square canvas', () => {
    const mascotFrame = getRollingPaperFrameRect(0);
    const typographyFrame = getRollingPaperFrameRect(1);

    expect(mascotFrame).toEqual({
      x: 266,
      y: 266,
      width: 320,
      height: 320,
    });
    expect(mascotFrame).toEqual(typographyFrame);
  });

  it('finds a nearby free position when the requested point lands inside the frame block', () => {
    const resolvedPlacement = findNearestAvailableRollingPaperPlacement(
      { x: 50, y: 50 },
      'red',
      [],
      0,
    );

    expect(resolvedPlacement).not.toBeNull();
    expect(resolvedPlacement).not.toEqual({ x: 50, y: 50 });
    expect(isRollingPaperPlacementAvailable(resolvedPlacement!, 'red', [], 0)).toBe(true);
  });

  it('can repeatedly resolve nearby placements with the blocked frame area', () => {
    const notes: PlacedRollingPaperNote[] = [];
    const repeatedPlacementCount = 50;

    for (let index = 0; index < repeatedPlacementCount; index += 1) {
      const placement = findNearestAvailableRollingPaperPlacement(
        { x: 50, y: 50 },
        'green',
        notes,
        0,
      );

      expect(placement).not.toBeNull();

      notes.push(createPlacedNote(`note-${index}`, 0, placement!.x, placement!.y, 'green'));
    }

    expect(getPlacedNotesForBoard(notes, 0)).toHaveLength(repeatedPlacementCount);
    expect(ROLLING_PAPER_MAX_NOTES_PER_BOARD).toBe(100);
  });

  it('clamps zoom to the mobile-supported range', () => {
    expect(clampRollingPaperScale(0.2)).toBe(0.7);
    expect(clampRollingPaperScale(1.18)).toBe(1.18);
    expect(clampRollingPaperScale(2.8)).toBe(2.8);
    expect(clampRollingPaperScale(12.8)).toBe(12);
  });

  it('clamps pan to the rendered board bounds after zoom changes', () => {
    expect(
      clampRollingPaperPan(
        { x: 500, y: -500 },
        ROLLING_PAPER_BOARD_VIEWPORT.width,
        ROLLING_PAPER_BOARD_VIEWPORT.height,
        2.2,
      ),
    ).toEqual({ x: 225, y: -158 });

    expect(
      clampRollingPaperPan(
        { x: 40, y: 40 },
        ROLLING_PAPER_BOARD_VIEWPORT.width,
        ROLLING_PAPER_BOARD_VIEWPORT.height,
        1,
      ),
    ).toEqual({ x: 0, y: 0 });
  });

  it('allows horizontal pan at default zoom when the board uses cover scale', () => {
    expect(
      clampRollingPaperPan(
        { x: 500, y: -500 },
        ROLLING_PAPER_BOARD_VIEWPORT.width,
        ROLLING_PAPER_BOARD_VIEWPORT.height,
        1,
        'cover',
      ),
    ).toEqual({ x: 67, y: 0 });

    expect(
      clampRollingPaperPan(
        { x: 500, y: -500 },
        ROLLING_PAPER_BOARD_VIEWPORT.width,
        ROLLING_PAPER_BOARD_VIEWPORT.height,
        2.2,
        'cover',
      ),
    ).toEqual({ x: 372.4, y: -305.4 });
  });

  it('supports the wider 600px layout viewport without fixed mobile-width pan math', () => {
    expect(
      clampRollingPaperPan(
        { x: 500, y: -500 },
        600,
        ROLLING_PAPER_BOARD_VIEWPORT.height,
        1,
        'cover',
      ),
    ).toEqual({ x: 0, y: -45.5 });

    expect(
      clampRollingPaperPan(
        { x: 500, y: -500 },
        600,
        ROLLING_PAPER_BOARD_VIEWPORT.height,
        0.7,
        'cover',
      ),
    ).toEqual({ x: 0, y: 0 });
  });

  it('calculates pan that centers the selected note at focus zoom', () => {
    const placement = { x: 55, y: 45 };
    const viewportWidth = 600;
    const viewportHeight = ROLLING_PAPER_BOARD_VIEWPORT.height;
    const renderedScale = getRollingPaperRenderedScale(
      viewportWidth,
      viewportHeight,
      ROLLING_PAPER_NOTE_FOCUS_ZOOM,
      'cover',
    );
    const focusPan = getRollingPaperPlacementFocusPan(
      placement,
      viewportWidth,
      viewportHeight,
      ROLLING_PAPER_NOTE_FOCUS_ZOOM,
      'cover',
    );
    const screenOffsetX =
      ((placement.x / 100) * ROLLING_PAPER_CANVAS_DIMENSIONS.width -
        ROLLING_PAPER_CANVAS_DIMENSIONS.width / 2) *
        renderedScale +
      focusPan.x;
    const screenOffsetY =
      ((placement.y / 100) * ROLLING_PAPER_CANVAS_DIMENSIONS.height -
        ROLLING_PAPER_CANVAS_DIMENSIONS.height / 2) *
        renderedScale +
      focusPan.y;

    expect(screenOffsetX).toBeCloseTo(0);
    expect(screenOffsetY).toBeCloseTo(0);
  });

  it('reduces focus zoom for the taller paper3 sticker so it has viewport margin', () => {
    const greenFocusScale = getRollingPaperNoteFocusScale(
      'green',
      ROLLING_PAPER_BOARD_VIEWPORT.width,
      ROLLING_PAPER_BOARD_VIEWPORT.height,
      'cover',
    );
    const redFocusScale = getRollingPaperNoteFocusScale(
      'red',
      ROLLING_PAPER_BOARD_VIEWPORT.width,
      ROLLING_PAPER_BOARD_VIEWPORT.height,
      'cover',
    );
    const greenRenderedScale = getRollingPaperRenderedScale(
      ROLLING_PAPER_BOARD_VIEWPORT.width,
      ROLLING_PAPER_BOARD_VIEWPORT.height,
      greenFocusScale,
      'cover',
    );
    const redRenderedScale = getRollingPaperRenderedScale(
      ROLLING_PAPER_BOARD_VIEWPORT.width,
      ROLLING_PAPER_BOARD_VIEWPORT.height,
      redFocusScale,
      'cover',
    );
    const greenNoteSize = getRollingPaperNoteSize('green');
    const redNoteSize = getRollingPaperNoteSize('red');

    expect(greenFocusScale).toBeLessThan(ROLLING_PAPER_NOTE_FOCUS_ZOOM);
    expect(greenFocusScale).toBeLessThan(redFocusScale);
    expect(redFocusScale).toBeLessThanOrEqual(ROLLING_PAPER_NOTE_FOCUS_ZOOM);
    expect(greenNoteSize.height * greenRenderedScale).toBeLessThanOrEqual(
      ROLLING_PAPER_BOARD_VIEWPORT.height * 0.74 + 1,
    );
    expect(redNoteSize.width * redRenderedScale).toBeLessThanOrEqual(
      ROLLING_PAPER_BOARD_VIEWPORT.width * 0.86 + 1,
    );
  });

  it('keeps the blocked frame rectangle aligned with the shifted mascot frame', () => {
    const frameRect = getRollingPaperFrameRect(0);
    const blockedFrameRect = getRollingPaperBlockedFrameRect(0);

    expect(blockedFrameRect.left).toBeLessThan(frameRect.x);
    expect(blockedFrameRect.top).toBeLessThan(frameRect.y);
    expect(blockedFrameRect.right).toBeGreaterThan(frameRect.x + frameRect.width);
    expect(blockedFrameRect.bottom).toBeGreaterThan(frameRect.y + frameRect.height);
  });
});
