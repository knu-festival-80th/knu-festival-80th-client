import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, Plus } from 'lucide-react';
import { rollingPaperApi } from '@/apis';
import {
  getRollingPaperBoardPath,
  getRollingPaperCategory,
  getRollingPaperChannel,
  getRollingPaperChannelIndex,
  getRollingPaperChannelsByCategory,
} from '@/constants/rollingPaper';
import { getRollingPaperPerformanceNotesFromSearch } from '@/mocks/rollingPaperPerformance';
import {
  ROLLING_PAPER_MAX_NOTES_PER_BOARD,
  ROLLING_PAPER_CLIENT_COLLISION_SCALE,
  ROLLING_PAPER_ZOOM,
  getPlacedNotesForBoard,
  isRollingPaperPlacementAvailable,
  type PlacedRollingPaperNote,
  type RollingPaperPan,
} from '@/lib/rollingPaperLayout';
import {
  toCanvasColorId,
  toPendingPlacedRollingPaperNote,
  toPlacedRollingPaperNote,
  toRollingPaperCategory,
  toRollingPaperChannel,
} from './rollingPaperApiAdapter';
import RollingPaperBoardCanvas from './RollingPaperBoardCanvas';
import RollingPaperBoardChangeDialog from './RollingPaperBoardChangeDialog';
import RollingPaperCategoryChangeDialog from './RollingPaperCategoryChangeDialog';
import RollingPaperCategoryTabs from './RollingPaperCategoryTabs';
import RollingPaperTabs from './RollingPaperTabs';
import RollingPaperWriteModal from './RollingPaperWriteModal';
import RollingPaperZoomControls from './RollingPaperZoomControls';

const INITIAL_BOARD_PAN: RollingPaperPan = { x: 0, y: 0 };
const PENDING_POSTIT_REFETCH_INTERVAL_MS = 5000;
const PENDING_POSTIT_LOCAL_VISIBLE_MS = 60000;

type RollingPaperBoardProps = {
  categoryId?: string;
  channelId?: string;
};

function getInitialPlacedNotes() {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return [];
  }

  return getRollingPaperPerformanceNotesFromSearch(window.location.search);
}

function isNoteInChannel(note: PlacedRollingPaperNote, categoryId: string, channelId: string) {
  if (!note.categoryId || !note.channelId) {
    return true;
  }

  return note.categoryId === categoryId && note.channelId === channelId;
}

export default function RollingPaperBoard({ categoryId, channelId }: RollingPaperBoardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const questionId = Number(categoryId);
  const isApiRoute = Number.isFinite(questionId);
  const mockNotes = getInitialPlacedNotes();
  const questionsQuery = useQuery({
    queryKey: ['rollingPaper', 'questions'],
    queryFn: rollingPaperApi.listQuestions,
  });
  const boardsQuery = useQuery({
    queryKey: ['rollingPaper', 'boards', questionId],
    queryFn: () => rollingPaperApi.listBoards(questionId),
    enabled: isApiRoute,
  });
  const apiCategories = (questionsQuery.data ?? [])
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(toRollingPaperCategory);
  const fallbackCategory = getRollingPaperCategory(categoryId);
  const placeholderCategory = {
    id: categoryId ?? fallbackCategory.id,
    label: '롤링페이퍼',
    description: '',
  };
  const category =
    apiCategories.find((item) => item.id === categoryId) ??
    apiCategories[0] ??
    (isApiRoute ? placeholderCategory : fallbackCategory);
  const apiChannels = (boardsQuery.data ?? []).map(toRollingPaperChannel);
  const fallbackChannels = isApiRoute ? [] : getRollingPaperChannelsByCategory(category.id);
  const categoryChannels = apiChannels.length > 0 ? apiChannels : fallbackChannels;
  const fallbackChannel = isApiRoute
    ? {
        id: channelId ?? '',
        categoryId: category.id,
        label: '보드',
        noteCount: 0,
        capacity: ROLLING_PAPER_MAX_NOTES_PER_BOARD,
        boardVariant: 0,
      }
    : getRollingPaperChannel(category.id, channelId);
  const channel =
    categoryChannels.find((item) => item.id === channelId) ??
    categoryChannels[0] ??
    fallbackChannel;
  const channelIndex = Math.max(
    0,
    categoryChannels.findIndex((item) => item.id === channel.id),
  );
  const boardIndex = channel.boardVariant ?? getRollingPaperChannelIndex(category.id, channel.id);
  const boardId = channel.boardId;
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isBoardChangeDialogOpen, setIsBoardChangeDialogOpen] = useState(false);
  const [isCategoryChangeDialogOpen, setIsCategoryChangeDialogOpen] = useState(false);
  const [pendingPlacedNotes, setPendingPlacedNotes] = useState<PlacedRollingPaperNote[]>([]);
  const [boardScale, setBoardScale] = useState<number>(ROLLING_PAPER_ZOOM.default);
  const [boardPan, setBoardPan] = useState<RollingPaperPan>(INITIAL_BOARD_PAN);
  const [focusedNoteId, setFocusedNoteId] = useState<string | null>(null);
  const postitsQuery = useQuery({
    queryKey: ['rollingPaper', 'postits', boardId],
    queryFn: () => rollingPaperApi.listPostits(boardId!),
    enabled: Boolean(boardId),
    refetchInterval: (query) => {
      if (!boardId) return false;

      const latestPostits = query.state.data ?? [];
      const latestPostitIds = new Set(latestPostits.map((postit) => postit.canvasPostitId));
      const hasPendingPostit = pendingPlacedNotes.some(
        (note) =>
          note.boardId === boardId &&
          (!note.postitId || !latestPostitIds.has(note.postitId)) &&
          (!note.pendingVisibleUntil || note.pendingVisibleUntil > Date.now()),
      );
      const hasLoadedData = Array.isArray(query.state.data);

      return hasPendingPostit && hasLoadedData ? PENDING_POSTIT_REFETCH_INTERVAL_MS : false;
    },
  });
  const apiPlacedNotes = (postitsQuery.data ?? []).map(toPlacedRollingPaperNote);
  const createPostitMutation = useMutation({
    mutationFn: (note: PlacedRollingPaperNote) =>
      rollingPaperApi.createPostit({
        boardId: boardId!,
        colorId: toCanvasColorId(note.colorId),
        message: note.message,
        placement: { x: note.x, y: note.y },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rollingPaper', 'boards', questionId] });
      void queryClient.invalidateQueries({ queryKey: ['rollingPaper', 'postits', boardId] });
    },
  });
  const approvedPostitIds = new Set(apiPlacedNotes.map((note) => note.postitId));
  const visiblePendingNotes = pendingPlacedNotes.filter(
    (note) => note.boardId === boardId && !approvedPostitIds.has(note.postitId),
  );
  const placedNotes =
    mockNotes.length > 0 ? mockNotes : [...apiPlacedNotes, ...visiblePendingNotes];

  const boardScope = { categoryId: category.id, channelId: channel.id };
  const scopedPlacedNotes = placedNotes.filter((note) =>
    isNoteInChannel(note, category.id, channel.id),
  );
  const currentBoardNotes = getPlacedNotesForBoard(placedNotes, boardIndex, boardScope);
  const boardCapacity = channel.capacity ?? ROLLING_PAPER_MAX_NOTES_PER_BOARD;
  const currentBoardNoteCount = Math.min(currentBoardNotes.length, boardCapacity);
  const isCurrentBoardFull = currentBoardNotes.length >= boardCapacity;
  const boardCategories = apiCategories.length > 0 ? apiCategories : [category];
  const boardNumberLabel = `BOR ${String(channelIndex + 1).padStart(2, '0')}`;

  const resetBoardViewport = () => {
    setBoardScale(ROLLING_PAPER_ZOOM.default);
    setBoardPan(INITIAL_BOARD_PAN);
    setFocusedNoteId(null);
  };

  const showPreviousBoard = () => {
    if (categoryChannels.length === 0) return;

    resetBoardViewport();
    const previousIndex = channelIndex === 0 ? categoryChannels.length - 1 : channelIndex - 1;
    const previousChannel = categoryChannels[previousIndex];

    navigate(getRollingPaperBoardPath(category.id, previousChannel.id));
  };

  const showNextBoard = () => {
    if (categoryChannels.length === 0) return;

    resetBoardViewport();
    const nextIndex = (channelIndex + 1) % categoryChannels.length;
    const nextChannel = categoryChannels[nextIndex];

    navigate(getRollingPaperBoardPath(category.id, nextChannel.id));
  };

  const handlePlaceNote = async (note: PlacedRollingPaperNote) => {
    if (!boardId || currentBoardNotes.length >= boardCapacity) {
      return;
    }

    const isRequestedPlacementAvailable = isRollingPaperPlacementAvailable(
      { x: note.x, y: note.y },
      note.colorId,
      currentBoardNotes,
      boardIndex,
      undefined,
      ROLLING_PAPER_CLIENT_COLLISION_SCALE,
    );

    if (!isRequestedPlacementAvailable) {
      return;
    }

    const createdPostit = await createPostitMutation.mutateAsync({
      ...note,
      boardId,
      boardVariant: boardIndex,
      categoryId: category.id,
      channelId: channel.id,
    });

    if (createdPostit.moderationStatus === 'PENDING') {
      const pendingNote = {
        ...toPendingPlacedRollingPaperNote(createdPostit),
        categoryId: category.id,
        channelId: channel.id,
        pendingVisibleUntil: Date.now() + PENDING_POSTIT_LOCAL_VISIBLE_MS,
      };

      setPendingPlacedNotes((prevNotes) => [...prevNotes, pendingNote]);
      window.setTimeout(() => {
        setPendingPlacedNotes((prevNotes) =>
          prevNotes.filter((note) => note.postitId !== pendingNote.postitId),
        );
      }, PENDING_POSTIT_LOCAL_VISIBLE_MS);
    }

    setIsWriteModalOpen(false);
  };

  return (
    <div className="bg-white">
      <RollingPaperTabs active="board" />
      <RollingPaperCategoryTabs
        activeCategory={category}
        categories={boardCategories}
        onGridClick={() => setIsCategoryChangeDialogOpen(true)}
      />

      <section className="min-h-[713px] bg-white pb-16">
        <div className="border-b border-border px-5 pt-5 pb-7">
          <button
            type="button"
            className="flex h-[30px] items-center gap-1 rounded border border-sub-red bg-white px-2.5 font-wanted-sans text-caption font-medium leading-none tracking-[-0.02em] text-black"
            onClick={() => setIsBoardChangeDialogOpen(true)}
          >
            <span className="font-semibold text-sub-red">{boardNumberLabel}</span>
            <span>보드 변경하기</span>
            <ChevronDown className="size-3.5 text-sub-red" />
          </button>

          <div className="mt-[18px] flex items-end justify-between gap-5">
            <div className="min-w-0">
              {isCurrentBoardFull && (
                <p className="mb-1.5 font-wanted-sans text-[15px] font-bold leading-none tracking-[-0.02em] text-sub-red">
                  🎉 이 보드는 추억으로 가득 찼어요!
                </p>
              )}
              <div className="font-wanted-sans text-[24px] font-bold leading-none tracking-[-0.02em] text-black">
                <span className="text-sub-red">{currentBoardNoteCount}</span>/{boardCapacity}
              </div>
              <p className="mt-2.5 font-wanted-sans text-caption font-medium leading-none tracking-[-0.02em] text-gray">
                메시지
              </p>
            </div>
            <button
              type="button"
              className={`flex h-10 shrink-0 items-center gap-1 rounded-full px-5 font-wanted-sans text-sm font-bold leading-none tracking-[-0.02em] text-white shadow-[0_6px_14px_rgba(255,61,61,0.22)] transition ${
                isCurrentBoardFull || !boardId ? 'hidden' : 'bg-sub-red'
              }`}
              disabled={isCurrentBoardFull || !boardId}
              onClick={() => setIsWriteModalOpen(true)}
            >
              <Plus className="size-4" />
              <span>메시지 남기기</span>
            </button>
          </div>
        </div>

        {(questionsQuery.isLoading || boardsQuery.isLoading || postitsQuery.isLoading) && (
          <p className="mt-4 px-5 font-wanted-sans text-caption text-gray">
            롤링페이퍼 데이터를 불러오는 중이에요.
          </p>
        )}

        {(questionsQuery.isError || boardsQuery.isError || postitsQuery.isError) && (
          <p className="mt-4 px-5 font-wanted-sans text-caption text-sub-red">
            롤링페이퍼 데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </p>
        )}

        <div className="relative mt-6">
          <RollingPaperBoardCanvas
            variant={boardIndex}
            scale={boardScale}
            pan={boardPan}
            placedNotes={scopedPlacedNotes}
            focusedNoteId={focusedNoteId}
            onPanChange={setBoardPan}
            onScaleChange={setBoardScale}
            onFocusedNoteChange={setFocusedNoteId}
          />

          <div className="pointer-events-none absolute inset-x-0 top-[30px] z-40 flex justify-between px-4">
            <button
              type="button"
              aria-label="이전 롤링페이퍼 보드"
              className="pointer-events-auto flex size-12 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-ink backdrop-blur-[2px]"
              onClick={showPreviousBoard}
            >
              <ArrowLeft className="size-6" />
            </button>
            <button
              type="button"
              aria-label="다음 롤링페이퍼 보드"
              className="pointer-events-auto flex size-12 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-ink backdrop-blur-[2px]"
              onClick={showNextBoard}
            >
              <ArrowRight className="size-6" />
            </button>
          </div>
        </div>

        <RollingPaperZoomControls
          scale={boardScale}
          pan={boardPan}
          onScaleChange={setBoardScale}
          onPanChange={setBoardPan}
          onResetView={resetBoardViewport}
        />
      </section>

      {isWriteModalOpen && (
        <RollingPaperWriteModal
          isOpen={isWriteModalOpen}
          boardVariant={boardIndex}
          placedNotes={scopedPlacedNotes}
          isSubmitting={createPostitMutation.isPending}
          onClose={() => setIsWriteModalOpen(false)}
          onPlace={handlePlaceNote}
        />
      )}

      {isBoardChangeDialogOpen && (
        <RollingPaperBoardChangeDialog
          category={category}
          currentChannel={channel}
          channels={categoryChannels}
          placedNotes={scopedPlacedNotes}
          onClose={() => setIsBoardChangeDialogOpen(false)}
          onSelectChannel={(nextChannel) => {
            setIsBoardChangeDialogOpen(false);
            resetBoardViewport();
            navigate(getRollingPaperBoardPath(category.id, nextChannel.id));
          }}
        />
      )}

      {isCategoryChangeDialogOpen && (
        <RollingPaperCategoryChangeDialog
          currentCategory={category}
          categories={boardCategories}
          onClose={() => setIsCategoryChangeDialogOpen(false)}
          onSelectCategory={(nextCategory) => {
            setIsCategoryChangeDialogOpen(false);
            resetBoardViewport();
            navigate(`/rolling-paper/categories/${nextCategory.id}/channels`);
          }}
        />
      )}
    </div>
  );
}
