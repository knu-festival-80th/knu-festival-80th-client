import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react';

import styled from '@emotion/styled';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEdit3,
  FiMapPin,
  FiMinus,
  FiPlus,
  FiShuffle,
  FiTarget,
  FiX,
} from 'react-icons/fi';

import { guestbookNoteColors } from '@/constants/guestbook';

type NoteColor = keyof typeof guestbookNoteColors;

type Camera = {
  x: number;
  y: number;
  scale: number;
};

type GuestbookNote = {
  id: string;
  boardNo: number;
  nickname: string;
  message: string;
  color: NoteColor;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  mine?: boolean;
};

type DragState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startCameraX: number;
  startCameraY: number;
};

type PlacementDraft = Omit<GuestbookNote, 'mine'>;

type PlacementValidation = {
  isValid: boolean;
  reason?: 'outOfBounds' | 'overlap';
  nearestValidPosition?: Pick<PlacementDraft, 'x' | 'y' | 'rotation'>;
};

const BOARD_WIDTH = 2400;
const BOARD_HEIGHT = 3200;
const BOARD_CAPACITY = 100;
const NOTE_WIDTH = 220;
const NOTE_HEIGHT = 180;
const MIN_SCALE = 0.14;
const MAX_SCALE = 1.2;
const INITIAL_SCALE = 0.16;
const PLACEMENT_SCALE = 0.48;
const BOARD_SAFE_MARGIN = 80;
const COLLISION_INSET = 24;
const NEAREST_SEARCH_STEP = 48;
const NEAREST_SEARCH_RADIUS = 820;

const colorOptions = Object.keys(guestbookNoteColors) as NoteColor[];
const nicknames = [
  '북문지킴이',
  '복현동호랑이',
  '하푸르나',
  '대동제첫날',
  '총학응원',
  '주막탐험가',
  '졸업생',
  '축제기록자',
  '센트럴파크',
  '80주년축하',
];
const messages = [
  '80주년 대동제 오래 기억할게요.',
  '친구들이랑 남기는 첫 롤링페이퍼입니다.',
  '무대 라인업 기다리는 중. 오늘 분위기 최고!',
  '준비한 모든 분들 고생 많으셨습니다.',
  '졸업하고 다시 온 축제라 더 반갑습니다.',
  '오늘 목표는 주막 세 곳 방문하기.',
  '축제 끝까지 안전하게 즐겨요.',
  '캠퍼스가 이렇게 북적이는 날을 기다렸어요.',
  '경북대 80주년 진심으로 축하합니다.',
  '이 순간을 같이 남길 수 있어서 좋습니다.',
];

const getBoardCount = (notes: GuestbookNote[]) => {
  return Math.max(3, ...notes.map((note) => note.boardNo));
};

const getNotesByBoard = (notes: GuestbookNote[], targetBoardNo: number) => {
  return notes.filter((note) => note.boardNo === targetBoardNo);
};

const getWritableBoardNo = (notes: GuestbookNote[], preferredBoardNo: number) => {
  const totalBoards = getBoardCount(notes);

  for (let nextBoardNo = preferredBoardNo; nextBoardNo <= totalBoards; nextBoardNo += 1) {
    if (getNotesByBoard(notes, nextBoardNo).length < BOARD_CAPACITY) {
      return nextBoardNo;
    }
  }

  for (let nextBoardNo = 1; nextBoardNo < preferredBoardNo; nextBoardNo += 1) {
    if (getNotesByBoard(notes, nextBoardNo).length < BOARD_CAPACITY) {
      return nextBoardNo;
    }
  }

  return totalBoards + 1;
};

const getNotePosition = (index: number, boardNo: number) => {
  const column = index % 10;
  const row = Math.floor(index / 10);
  const cellWidth = (BOARD_WIDTH - 220) / 10;
  const cellHeight = (BOARD_HEIGHT - 260) / 10;
  const jitterX = ((index * 37 + boardNo * 13) % 58) - 29;
  const jitterY = ((index * 53 + boardNo * 17) % 74) - 37;

  return {
    x: 110 + column * cellWidth + jitterX,
    y: 130 + row * cellHeight + jitterY,
    rotation: ((index * 11 + boardNo * 7) % 13) - 6,
  };
};

const createBoardNotes = (boardNo: number, count: number): GuestbookNote[] => {
  return Array.from({ length: count }, (_, index) => {
    const position = getNotePosition(index, boardNo);
    const color = colorOptions[(index + boardNo) % colorOptions.length];

    return {
      id: `board-${boardNo}-note-${index + 1}`,
      boardNo,
      nickname: nicknames[(index + boardNo) % nicknames.length],
      message: messages[(index * 3 + boardNo) % messages.length],
      color,
      width: NOTE_WIDTH,
      height: NOTE_HEIGHT,
      zIndex: index + 1,
      ...position,
    };
  });
};

const createInitialNotes = (): GuestbookNote[] => [
  ...createBoardNotes(1, BOARD_CAPACITY),
  ...createBoardNotes(2, 72),
  ...createBoardNotes(3, 24),
];

const getViewportSize = (element: HTMLDivElement | null) => ({
  width: element?.clientWidth || 350,
  height: element?.clientHeight || 540,
});

const clampValue = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const clampPlacementPosition = (position: Pick<PlacementDraft, 'x' | 'y'>) => ({
  x: Math.round(
    clampValue(position.x, BOARD_SAFE_MARGIN, BOARD_WIDTH - NOTE_WIDTH - BOARD_SAFE_MARGIN),
  ),
  y: Math.round(
    clampValue(position.y, BOARD_SAFE_MARGIN, BOARD_HEIGHT - NOTE_HEIGHT - BOARD_SAFE_MARGIN),
  ),
});

const getBodyRect = (note: Pick<PlacementDraft, 'x' | 'y' | 'width' | 'height'>) => ({
  left: note.x + COLLISION_INSET,
  top: note.y + COLLISION_INSET,
  right: note.x + note.width - COLLISION_INSET,
  bottom: note.y + note.height - COLLISION_INSET,
});

const isRectOverlapping = (
  first: ReturnType<typeof getBodyRect>,
  second: ReturnType<typeof getBodyRect>,
) => {
  return (
    first.left < second.right &&
    first.right > second.left &&
    first.top < second.bottom &&
    first.bottom > second.top
  );
};

const isPlacementOutOfBounds = (
  candidate: Pick<PlacementDraft, 'x' | 'y' | 'width' | 'height'>,
) => {
  return (
    candidate.x < BOARD_SAFE_MARGIN ||
    candidate.y < BOARD_SAFE_MARGIN ||
    candidate.x + candidate.width > BOARD_WIDTH - BOARD_SAFE_MARGIN ||
    candidate.y + candidate.height > BOARD_HEIGHT - BOARD_SAFE_MARGIN
  );
};

const hasPlacementCollision = (
  candidate: Pick<PlacementDraft, 'id' | 'x' | 'y' | 'width' | 'height'>,
  notes: GuestbookNote[],
) => {
  const candidateRect = getBodyRect(candidate);

  return notes.some((note) => {
    if (note.id === candidate.id) {
      return false;
    }

    return isRectOverlapping(candidateRect, getBodyRect(note));
  });
};

const validatePlacementCandidate = (
  candidate: PlacementDraft,
  boardNotes: GuestbookNote[],
  includeNearestPosition = true,
): PlacementValidation => {
  if (isPlacementOutOfBounds(candidate)) {
    return {
      isValid: false,
      reason: 'outOfBounds',
      nearestValidPosition: includeNearestPosition
        ? findNearestValidPosition(candidate, boardNotes)
        : undefined,
    };
  }

  if (hasPlacementCollision(candidate, boardNotes)) {
    return {
      isValid: false,
      reason: 'overlap',
      nearestValidPosition: includeNearestPosition
        ? findNearestValidPosition(candidate, boardNotes)
        : undefined,
    };
  }

  return { isValid: true };
};

function findNearestValidPosition(
  candidate: PlacementDraft,
  boardNotes: GuestbookNote[],
): Pick<PlacementDraft, 'x' | 'y' | 'rotation'> | undefined {
  const testPosition = (x: number, y: number) => {
    const clamped = clampPlacementPosition({ x, y });
    const nextCandidate = { ...candidate, ...clamped };
    const validation = validatePlacementCandidate(nextCandidate, boardNotes, false);

    return validation.isValid ? { ...clamped, rotation: candidate.rotation } : undefined;
  };

  const currentPosition = testPosition(candidate.x, candidate.y);

  if (currentPosition) {
    return currentPosition;
  }

  for (
    let radius = NEAREST_SEARCH_STEP;
    radius <= NEAREST_SEARCH_RADIUS;
    radius += NEAREST_SEARCH_STEP
  ) {
    const steps = Math.max(8, Math.ceil((Math.PI * 2 * radius) / NEAREST_SEARCH_STEP));

    for (let step = 0; step < steps; step += 1) {
      const angle = (Math.PI * 2 * step) / steps;
      const position = testPosition(
        candidate.x + Math.cos(angle) * radius,
        candidate.y + Math.sin(angle) * radius,
      );

      if (position) {
        return position;
      }
    }
  }

  for (
    let y = BOARD_SAFE_MARGIN;
    y <= BOARD_HEIGHT - NOTE_HEIGHT - BOARD_SAFE_MARGIN;
    y += NOTE_HEIGHT + 32
  ) {
    for (
      let x = BOARD_SAFE_MARGIN;
      x <= BOARD_WIDTH - NOTE_WIDTH - BOARD_SAFE_MARGIN;
      x += NOTE_WIDTH + 32
    ) {
      const position = testPosition(x, y);

      if (position) {
        return position;
      }
    }
  }

  return undefined;
}

export default function GuestbookExperience() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const placementPointerIdRef = useRef<number | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 350, height: 540 });
  const [boardNo, setBoardNo] = useState(1);
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: INITIAL_SCALE });
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [color, setColor] = useState<NoteColor>('yellow');
  const [notes, setNotes] = useState<GuestbookNote[]>(createInitialNotes);
  const [placementDraft, setPlacementDraft] = useState<PlacementDraft | null>(null);

  const totalBoards = getBoardCount(notes);
  const visibleTotalBoards = Math.max(totalBoards, placementDraft?.boardNo ?? totalBoards);
  const boardNotes = useMemo(
    () => notes.filter((note) => note.boardNo === boardNo),
    [boardNo, notes],
  );
  const placementBoardNotes = useMemo(
    () => (placementDraft ? getNotesByBoard(notes, placementDraft.boardNo) : []),
    [notes, placementDraft],
  );
  const placementValidation = useMemo(
    () => (placementDraft ? validatePlacementCandidate(placementDraft, placementBoardNotes) : null),
    [placementBoardNotes, placementDraft],
  );

  const clampCamera = useCallback((nextCamera: Camera): Camera => {
    const viewport = getViewportSize(viewportRef.current);
    const scaledWidth = BOARD_WIDTH * nextCamera.scale;
    const scaledHeight = BOARD_HEIGHT * nextCamera.scale;
    const minX =
      scaledWidth <= viewport.width
        ? (viewport.width - scaledWidth) / 2
        : viewport.width - scaledWidth;
    const maxX = scaledWidth <= viewport.width ? minX : 0;
    const minY =
      scaledHeight <= viewport.height
        ? (viewport.height - scaledHeight) / 2
        : viewport.height - scaledHeight;
    const maxY = scaledHeight <= viewport.height ? minY : 0;

    return {
      x: clampValue(nextCamera.x, minX, maxX),
      y: clampValue(nextCamera.y, minY, maxY),
      scale: clampValue(nextCamera.scale, MIN_SCALE, MAX_SCALE),
    };
  }, []);

  const resetCamera = useCallback(() => {
    const viewport = getViewportSize(viewportRef.current);
    const scale = INITIAL_SCALE;

    setCamera(
      clampCamera({
        x: (viewport.width - BOARD_WIDTH * scale) / 2,
        y: (viewport.height - BOARD_HEIGHT * scale) / 2,
        scale,
      }),
    );
  }, [clampCamera]);

  const focusBoardItem = useCallback(
    (item: Pick<GuestbookNote, 'x' | 'y' | 'width' | 'height'>, scale = 0.82) => {
      const viewport = getViewportSize(viewportRef.current);

      setCamera(
        clampCamera({
          x: viewport.width / 2 - (item.x + item.width / 2) * scale,
          y: viewport.height / 2 - (item.y + item.height / 2) * scale,
          scale,
        }),
      );
    },
    [clampCamera],
  );

  const focusNote = useCallback(
    (note: GuestbookNote, scale = 0.82) => {
      focusBoardItem(note, scale);
      setHighlightedNoteId(note.id);
      window.setTimeout(
        () => setHighlightedNoteId((current) => (current === note.id ? null : current)),
        2200,
      );
    },
    [focusBoardItem],
  );

  const zoomAt = useCallback(
    (clientX: number, clientY: number, nextScale: number) => {
      const rect = viewportRef.current?.getBoundingClientRect();
      const pointX = rect ? clientX - rect.left : getViewportSize(viewportRef.current).width / 2;
      const pointY = rect ? clientY - rect.top : getViewportSize(viewportRef.current).height / 2;
      const scale = clampValue(nextScale, MIN_SCALE, MAX_SCALE);
      const boardX = (pointX - camera.x) / camera.scale;
      const boardY = (pointY - camera.y) / camera.scale;

      setCamera(
        clampCamera({
          x: pointX - boardX * scale,
          y: pointY - boardY * scale,
          scale,
        }),
      );
    },
    [camera, clampCamera],
  );

  const zoomFromCenter = (delta: number) => {
    const viewport = getViewportSize(viewportRef.current);

    zoomAt(viewport.width / 2, viewport.height / 2, camera.scale + delta);
  };

  const handleBoardChange = (nextBoardNo: number) => {
    setBoardNo(clampValue(nextBoardNo, 1, visibleTotalBoards));
    setHighlightedNoteId(null);
    setPlacementDraft(null);
    window.requestAnimationFrame(resetCamera);
  };

  const handleRandomBoard = () => {
    const nextBoardNo = Math.floor(Math.random() * visibleTotalBoards) + 1;

    handleBoardChange(nextBoardNo);
  };

  const getBoardPointFromPointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const rect = viewportRef.current?.getBoundingClientRect();
      const pointX = rect ? event.clientX - rect.left : viewportSize.width / 2;
      const pointY = rect ? event.clientY - rect.top : viewportSize.height / 2;

      return {
        x: (pointX - camera.x) / camera.scale,
        y: (pointY - camera.y) / camera.scale,
      };
    },
    [camera, viewportSize],
  );

  const movePlacementDraftToPointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const boardPoint = getBoardPointFromPointer(event);
      const position = clampPlacementPosition({
        x: boardPoint.x - NOTE_WIDTH / 2,
        y: boardPoint.y - NOTE_HEIGHT / 2,
      });

      setPlacementDraft((current) => (current ? { ...current, ...position } : current));
    },
    [getBoardPointFromPointer],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (placementDraft) {
      placementPointerIdRef.current = event.pointerId;
      movePlacementDraftToPointer(event);
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startCameraX: camera.x,
      startCameraY: camera.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (placementPointerIdRef.current === event.pointerId) {
      movePlacementDraftToPointer(event);
      return;
    }

    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    setCamera(
      clampCamera({
        ...camera,
        x: dragState.startCameraX + event.clientX - dragState.startClientX,
        y: dragState.startCameraY + event.clientY - dragState.startClientY,
      }),
    );
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (placementPointerIdRef.current === event.pointerId) {
      placementPointerIdRef.current = null;
      return;
    }

    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
    }
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    zoomAt(event.clientX, event.clientY, camera.scale + (event.deltaY > 0 ? -0.08 : 0.08));
  };

  const handleStartPlacement = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const targetBoardNo = getWritableBoardNo(notes, boardNo);
    const targetBoardNotes = getNotesByBoard(notes, targetBoardNo);
    const slotIndex = Math.min(targetBoardNotes.length, BOARD_CAPACITY - 1);
    const basePosition = getNotePosition(slotIndex, targetBoardNo);
    const draft: PlacementDraft = {
      id: `draft-note-${Date.now()}`,
      boardNo: targetBoardNo,
      nickname: nickname.trim() || '익명',
      message: trimmedMessage,
      color,
      width: NOTE_WIDTH,
      height: NOTE_HEIGHT,
      zIndex: slotIndex + 200,
      ...basePosition,
    };
    const nearestPosition = findNearestValidPosition(draft, targetBoardNotes) ?? basePosition;

    setHighlightedNoteId(null);
    setBoardNo(targetBoardNo);
    setPlacementDraft({ ...draft, ...nearestPosition });
    window.requestAnimationFrame(() =>
      focusBoardItem({ ...draft, ...nearestPosition }, PLACEMENT_SCALE),
    );
  };

  const handleMoveToSuggestedPlacement = () => {
    if (!placementDraft || !placementValidation?.nearestValidPosition) {
      return;
    }

    const nextDraft = { ...placementDraft, ...placementValidation.nearestValidPosition };

    setPlacementDraft(nextDraft);
    window.requestAnimationFrame(() => focusBoardItem(nextDraft, PLACEMENT_SCALE));
  };

  const handleCancelPlacement = () => {
    setPlacementDraft(null);
    placementPointerIdRef.current = null;
  };

  const handleConfirmPlacement = () => {
    if (!placementDraft) {
      return;
    }

    const validation = validatePlacementCandidate(placementDraft, placementBoardNotes);

    if (!validation.isValid) {
      if (validation.nearestValidPosition) {
        const nextDraft = { ...placementDraft, ...validation.nearestValidPosition };

        setPlacementDraft(nextDraft);
        window.requestAnimationFrame(() => focusBoardItem(nextDraft, PLACEMENT_SCALE));
      }

      return;
    }

    const newNote: GuestbookNote = {
      ...placementDraft,
      id: `my-note-${Date.now()}`,
      zIndex: placementBoardNotes.length + 200,
      mine: true,
    };

    setNotes((current) => [...current, newNote]);
    setBoardNo(newNote.boardNo);
    setPlacementDraft(null);
    setMessage('');
    window.requestAnimationFrame(() => focusNote(newNote));
  };

  const visibleNotes = useMemo(() => {
    const buffer = 260;
    const left = -camera.x / camera.scale - buffer;
    const top = -camera.y / camera.scale - buffer;
    const right = left + viewportSize.width / camera.scale + buffer * 2;
    const bottom = top + viewportSize.height / camera.scale + buffer * 2;

    return boardNotes.filter((note) => {
      return (
        note.x + note.width >= left &&
        note.x <= right &&
        note.y + note.height >= top &&
        note.y <= bottom
      );
    });
  }, [boardNotes, camera, viewportSize]);

  const lod = camera.scale < 0.28 ? 'dot' : camera.scale < 0.58 ? 'summary' : 'full';
  const viewportRect = getViewportRect(camera, viewportSize);
  const isPlacementValid = placementValidation?.isValid ?? false;
  const placementStatusText = placementDraft
    ? isPlacementValid
      ? '배치 가능'
      : placementValidation?.reason === 'outOfBounds'
        ? '보드 안쪽에 붙여주세요'
        : '다른 포스트잇과 겹쳐요'
    : null;

  useEffect(() => {
    resetCamera();
  }, [resetCamera]);

  useEffect(() => {
    const element = viewportRef.current;

    if (!element) {
      return;
    }

    const syncViewportSize = () => {
      setViewportSize({ width: element.clientWidth, height: element.clientHeight });
    };
    const resizeObserver = new ResizeObserver(syncViewportSize);

    syncViewportSize();
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <Page>
      <Header>
        <BackLink href="/">
          <FiArrowLeft size={20} />홈
        </BackLink>
        <TextLogo>2026 KNU FESTIVAL</TextLogo>
      </Header>

      <Hero>
        <HeroEyebrow>Memory Board</HeroEyebrow>
        <HeroTitle>80주년 롤링페이퍼</HeroTitle>
        <HeroDescription>
          원하는 빈자리에 포스트잇을 직접 붙이고, 겹치지 않게 보호되는 대형 롤링페이퍼
          프로토타입입니다.
        </HeroDescription>
      </Hero>

      <BoardToolbar>
        <BoardLabel aria-live="polite">
          <span>Board</span>
          <strong>
            {boardNo} / {visibleTotalBoards}
          </strong>
        </BoardLabel>
        <ToolbarActions>
          <IconButton
            type="button"
            aria-label="이전 보드"
            disabled={boardNo === 1}
            onClick={() => handleBoardChange(boardNo - 1)}
          >
            <FiChevronLeft size={20} />
          </IconButton>
          <IconButton type="button" aria-label="랜덤 보드" onClick={handleRandomBoard}>
            <FiShuffle size={18} />
          </IconButton>
          <IconButton
            type="button"
            aria-label="다음 보드"
            disabled={boardNo === visibleTotalBoards}
            onClick={() => handleBoardChange(boardNo + 1)}
          >
            <FiChevronRight size={20} />
          </IconButton>
        </ToolbarActions>
      </BoardToolbar>

      <BoardStats>
        <span>포스트잇 {boardNotes.length} / 100</span>
        <span>렌더링 {visibleNotes.length}개</span>
        <span>{Math.round(camera.scale * 100)}%</span>
        {placementStatusText && <span>{placementStatusText}</span>}
      </BoardStats>

      <Viewport
        ref={viewportRef}
        aria-label={`${boardNo}번 롤링페이퍼 줌 보드`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        {placementDraft && (
          <PlacementBanner $valid={isPlacementValid}>
            <FiMapPin size={16} />
            {placementStatusText}
          </PlacementBanner>
        )}
        <BoardSurface
          style={{
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
            transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})`,
          }}
        >
          <BoardGrid aria-hidden="true" />
          {visibleNotes.map((note) => (
            <ZoomNote
              key={note.id}
              $color={guestbookNoteColors[note.color]}
              $lod={lod}
              $highlighted={highlightedNoteId === note.id}
              style={{
                left: note.x,
                top: note.y,
                width: note.width,
                height: note.height,
                zIndex: note.zIndex,
                transform: `rotate(${note.rotation}deg)`,
              }}
            >
              {lod === 'dot' ? (
                <DotLabel>{note.nickname.slice(0, 2)}</DotLabel>
              ) : (
                <>
                  <NoteAuthor>{note.nickname}</NoteAuthor>
                  <NoteMessage>{note.message}</NoteMessage>
                  {lod === 'full' && note.mine && <MineBadge>방금 작성</MineBadge>}
                </>
              )}
            </ZoomNote>
          ))}
          {placementDraft && (
            <PlacementGhost
              $color={guestbookNoteColors[placementDraft.color]}
              $valid={isPlacementValid}
              style={{
                left: placementDraft.x,
                top: placementDraft.y,
                width: placementDraft.width,
                height: placementDraft.height,
                zIndex: 999,
                transform: `rotate(${placementDraft.rotation}deg)`,
              }}
            >
              <NoteAuthor>{placementDraft.nickname}</NoteAuthor>
              <NoteMessage>{placementDraft.message}</NoteMessage>
              <GhostBadge>{isPlacementValid ? '붙일 위치' : '위치 조정 필요'}</GhostBadge>
            </PlacementGhost>
          )}
        </BoardSurface>
        <Minimap aria-hidden="true">
          {boardNotes.map((note) => (
            <MiniPoint
              key={note.id}
              $color={guestbookNoteColors[note.color]}
              style={{
                left: `${(note.x / BOARD_WIDTH) * 100}%`,
                top: `${(note.y / BOARD_HEIGHT) * 100}%`,
              }}
            />
          ))}
          {placementDraft && (
            <MiniDraftPoint
              $valid={isPlacementValid}
              style={{
                left: `${(placementDraft.x / BOARD_WIDTH) * 100}%`,
                top: `${(placementDraft.y / BOARD_HEIGHT) * 100}%`,
              }}
            />
          )}
          <MiniViewport
            style={{
              left: `${viewportRect.left}%`,
              top: `${viewportRect.top}%`,
              width: `${viewportRect.width}%`,
              height: `${viewportRect.height}%`,
            }}
          />
        </Minimap>
      </Viewport>

      {placementDraft && (
        <PlacementActions aria-live="polite">
          <PlacementCopy>
            <strong>
              {isPlacementValid ? '이 위치에 붙일 수 있어요.' : '기존 포스트잇 본문과 겹쳐요.'}
            </strong>
            <span>
              {Math.round(placementDraft.x)}, {Math.round(placementDraft.y)}
            </span>
          </PlacementCopy>
          <PlacementButtonRow>
            <SmallActionButton type="button" onClick={handleCancelPlacement}>
              <FiX size={16} />
              취소
            </SmallActionButton>
            <SmallActionButton
              type="button"
              disabled={!placementValidation?.nearestValidPosition}
              onClick={handleMoveToSuggestedPlacement}
            >
              <FiTarget size={16} />
              가까운 빈 위치
            </SmallActionButton>
            <ConfirmPlacementButton
              type="button"
              disabled={!isPlacementValid}
              onClick={handleConfirmPlacement}
            >
              <FiCheckCircle size={17} />이 위치에 붙이기
            </ConfirmPlacementButton>
          </PlacementButtonRow>
        </PlacementActions>
      )}

      <BoardControls aria-label="보드 확대 축소 컨트롤">
        <ControlButton type="button" onClick={() => zoomFromCenter(-0.12)}>
          <FiMinus size={18} />
          축소
        </ControlButton>
        <ControlButton type="button" onClick={resetCamera}>
          <FiTarget size={18} />
          원점
        </ControlButton>
        <ControlButton type="button" onClick={() => zoomFromCenter(0.12)}>
          <FiPlus size={18} />
          확대
        </ControlButton>
      </BoardControls>

      <Composer aria-label="롤링페이퍼 작성">
        <ComposerTitle>
          <FiEdit3 size={20} />
          메시지 남기기
        </ComposerTitle>
        <TextInput
          value={nickname}
          maxLength={12}
          placeholder="닉네임"
          aria-label="닉네임"
          onChange={(event) => setNickname(event.target.value)}
        />
        <Textarea
          value={message}
          maxLength={120}
          placeholder="축제의 순간을 120자 안에 남겨보세요."
          aria-label="메시지"
          onChange={(event) => setMessage(event.target.value)}
        />
        <ColorRow aria-label="포스트잇 색상 선택">
          {colorOptions.map((option) => (
            <ColorButton
              key={option}
              type="button"
              aria-label={`${option} 색상`}
              aria-pressed={color === option}
              $color={guestbookNoteColors[option]}
              $selected={color === option}
              onClick={() => setColor(option)}
            />
          ))}
        </ColorRow>
        <SubmitButton
          type="button"
          aria-label="롤링페이퍼에 붙이기"
          disabled={!message.trim()}
          onClick={handleStartPlacement}
        >
          {placementDraft ? '위치 다시 고르기' : '붙일 위치 고르기'}
          <FiArrowLeft size={18} />
        </SubmitButton>
      </Composer>
    </Page>
  );
}

const getViewportRect = (camera: Camera, viewport: { width: number; height: number }) => {
  const left = clampValue((-camera.x / camera.scale / BOARD_WIDTH) * 100, 0, 100);
  const top = clampValue((-camera.y / camera.scale / BOARD_HEIGHT) * 100, 0, 100);
  const width = clampValue((viewport.width / camera.scale / BOARD_WIDTH) * 100, 3, 100 - left);
  const height = clampValue((viewport.height / camera.scale / BOARD_HEIGHT) * 100, 3, 100 - top);

  return { left, top, width, height };
};

const Page = styled.div`
  width: min(100%, 430px);
  min-height: 100dvh;
  margin: 0 auto;
  background: #ffffff;
  color: #1a1a1a;
`;

const Header = styled.header`
  display: flex;
  height: 88px;
  align-items: center;
  justify-content: space-between;
  padding: 28px 20px 12px;
`;

const BackLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 700;
`;

const TextLogo = styled.span`
  color: #1a1a1a;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.8px;
`;

const Hero = styled.section`
  display: grid;
  gap: 8px;
  padding: 34px 20px 42px;
  background:
    radial-gradient(circle at 18% 24%, rgba(255, 61, 61, 0.18), transparent 180px),
    radial-gradient(circle at 90% 12%, rgba(0, 168, 107, 0.12), transparent 160px),
    linear-gradient(135deg, #fff7df 0%, #f8efe0 52%, #ffffff 100%);
`;

const HeroEyebrow = styled.p`
  margin: 0;
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.32px;
`;

const HeroTitle = styled.h1`
  margin: 0;
  color: #1a1a1a;
  font-size: 40px;
  font-weight: 900;
  letter-spacing: -1.6px;
  line-height: 1;
`;

const HeroDescription = styled.p`
  margin: 8px 0 0;
  color: #4d4d4d;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
`;

const BoardToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 20px 12px;
`;

const BoardLabel = styled.div`
  display: grid;
  gap: 2px;

  span {
    color: #808080;
    font-size: 13px;
    font-weight: 700;
  }

  strong {
    color: #1a1a1a;
    font-size: 24px;
    font-weight: 900;
    line-height: 1;
  }
`;

const ToolbarActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid #1a1a1a;
  border-radius: 50%;
  background: transparent;
  color: #1a1a1a;

  &:disabled {
    border-color: #d9d9d9;
    color: #b3b3b3;
    cursor: not-allowed;
  }
`;

const BoardStats = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 20px 14px;

  span {
    flex: 0 0 auto;
    border: 1px solid #e5e5e5;
    border-radius: 999px;
    padding: 6px 10px;
    color: #4d4d4d;
    font-size: 12px;
    font-weight: 800;
  }
`;

const Viewport = styled.div`
  position: relative;
  height: 540px;
  margin: 0 20px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  background: #f7f2e9;
  touch-action: none;
  user-select: none;
`;

const BoardSurface = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  border-radius: 22px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.36) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.36) 1px, transparent 1px),
    radial-gradient(circle at 18% 14%, rgba(255, 61, 61, 0.1), transparent 520px),
    radial-gradient(circle at 84% 78%, rgba(72, 175, 79, 0.13), transparent 600px), #f5e7cf;
  background-size:
    120px 120px,
    120px 120px,
    auto,
    auto,
    auto;
  box-shadow: inset 0 0 0 16px rgba(255, 255, 255, 0.24);
  transform-origin: 0 0;
  will-change: transform;
`;

const BoardGrid = styled.div`
  position: absolute;
  inset: 80px;
  border: 4px solid rgba(26, 26, 26, 0.08);
  border-radius: 18px;
`;

const ZoomNote = styled.article<{
  $color: string;
  $lod: 'dot' | 'summary' | 'full';
  $highlighted: boolean;
}>`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: ${({ $lod }) => ($lod === 'full' ? 'space-between' : 'center')};
  border: ${({ $highlighted }) =>
    $highlighted ? '8px solid #ff3d3d' : '2px solid rgba(0, 0, 0, 0.08)'};
  border-radius: ${({ $lod }) => ($lod === 'dot' ? '999px' : '10px')};
  padding: ${({ $lod }) => ($lod === 'full' ? '20px' : $lod === 'summary' ? '16px' : '0')};
  background: ${({ $color }) => $color};
  box-shadow: ${({ $highlighted }) =>
    $highlighted ? '0 0 0 18px rgba(255, 61, 61, 0.18)' : '0 18px 34px rgba(0, 0, 0, 0.12)'};
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
`;

const PlacementGhost = styled.article<{ $color: string; $valid: boolean }>`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 8px solid ${({ $valid }) => ($valid ? '#00a86b' : '#ff3d3d')};
  border-radius: 10px;
  padding: 20px;
  background: ${({ $color }) => $color};
  box-shadow:
    0 0 0 18px ${({ $valid }) => ($valid ? 'rgba(0, 168, 107, 0.18)' : 'rgba(255, 61, 61, 0.18)')},
    0 24px 42px rgba(0, 0, 0, 0.18);
  opacity: 0.92;
  pointer-events: none;
`;

const GhostBadge = styled.span`
  width: fit-content;
  border-radius: 100px;
  padding: 8px 12px;
  background: rgba(26, 26, 26, 0.86);
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
`;

const DotLabel = styled.span`
  display: inline-flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: rgba(26, 26, 26, 0.76);
  font-size: 42px;
  font-weight: 900;
`;

const NoteAuthor = styled.strong`
  color: #1a1a1a;
  font-size: 22px;
  font-weight: 900;
  line-height: 1.2;
`;

const NoteMessage = styled.p`
  display: -webkit-box;
  overflow: hidden;
  margin: 16px 0 0;
  color: #1a1a1a;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
`;

const MineBadge = styled.span`
  width: fit-content;
  border-radius: 100px;
  padding: 8px 12px;
  background: #ff3d3d;
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
`;

const Minimap = styled.div`
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 86px;
  height: 116px;
  border: 1px solid rgba(26, 26, 26, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
`;

const MiniPoint = styled.span<{ $color: string }>`
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  transform: translate(-50%, -50%);
`;

const MiniViewport = styled.span`
  position: absolute;
  border: 1px solid #ff3d3d;
  border-radius: 4px;
  background: rgba(255, 61, 61, 0.12);
`;

const MiniDraftPoint = styled.span<{ $valid: boolean }>`
  position: absolute;
  width: 10px;
  height: 10px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: ${({ $valid }) => ($valid ? '#00a86b' : '#ff3d3d')};
  box-shadow: 0 0 0 2px
    ${({ $valid }) => ($valid ? 'rgba(0, 168, 107, 0.34)' : 'rgba(255, 61, 61, 0.34)')};
  transform: translate(-50%, -50%);
`;

const PlacementBanner = styled.div<{ $valid: boolean }>`
  position: absolute;
  z-index: 5;
  top: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid
    ${({ $valid }) => ($valid ? 'rgba(0, 168, 107, 0.36)' : 'rgba(255, 61, 61, 0.36)')};
  border-radius: 999px;
  padding: 8px 11px;
  background: rgba(255, 255, 255, 0.88);
  color: ${({ $valid }) => ($valid ? '#007f50' : '#d22d2d')};
  font-size: 12px;
  font-weight: 900;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
`;

const BoardControls = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 12px 20px 0;
`;

const PlacementActions = styled.section`
  display: grid;
  gap: 12px;
  margin: 12px 20px 0;
  border: 1px solid rgba(26, 26, 26, 0.12);
  padding: 14px;
  background: #ffffff;
`;

const PlacementCopy = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  strong {
    color: #1a1a1a;
    font-size: 14px;
    font-weight: 900;
    line-height: 1.35;
  }

  span {
    flex: 0 0 auto;
    color: #808080;
    font-size: 12px;
    font-weight: 800;
  }
`;

const PlacementButtonRow = styled.div`
  display: grid;
  grid-template-columns: 0.74fr 1.16fr 1.3fr;
  gap: 8px;
`;

const SmallActionButton = styled.button`
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid #d9d9d9;
  border-radius: 999px;
  background: #ffffff;
  color: #1a1a1a;
  font-size: 12px;
  font-weight: 900;

  &:disabled {
    color: #b3b3b3;
    cursor: not-allowed;
  }
`;

const ConfirmPlacementButton = styled.button`
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid #00a86b;
  border-radius: 999px;
  background: #00a86b;
  color: #ffffff;
  font-size: 12px;
  font-weight: 900;

  &:disabled {
    border-color: #d9d9d9;
    background: #d9d9d9;
    cursor: not-allowed;
  }
`;

const ControlButton = styled.button`
  display: inline-flex;
  height: 42px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid #1a1a1a;
  border-radius: 100px;
  background: #ffffff;
  color: #1a1a1a;
  font-size: 13px;
  font-weight: 900;
`;

const Composer = styled.section`
  display: grid;
  gap: 12px;
  margin: 48px 20px 0;
  padding: 20px;
  background: rgba(255, 61, 61, 0.04);
`;

const ComposerTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #1a1a1a;
  font-size: 18px;
  font-weight: 900;
`;

const TextInput = styled.input`
  height: 44px;
  border: 1px solid #e5e5e5;
  border-radius: 0;
  padding: 0 12px;
  background: #ffffff;
  color: #1a1a1a;
  font-size: 15px;
`;

const Textarea = styled.textarea`
  min-height: 112px;
  resize: vertical;
  border: 1px solid #e5e5e5;
  border-radius: 0;
  padding: 12px;
  background: #ffffff;
  color: #1a1a1a;
  font-size: 15px;
  line-height: 1.5;
`;

const ColorRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ColorButton = styled.button<{ $color: string; $selected: boolean }>`
  width: 34px;
  height: 34px;
  border: ${({ $selected }) => ($selected ? '2px solid #1a1a1a' : '1px solid rgba(0, 0, 0, 0.12)')};
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const SubmitButton = styled.button`
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #1a1a1a;
  border-radius: 100px;
  background: #1a1a1a;
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;

  svg {
    transform: rotate(180deg);
  }

  &:disabled {
    border-color: #d9d9d9;
    background: #d9d9d9;
    cursor: not-allowed;
  }
`;
