import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
  findNearestAvailableRollingPaperPlacement,
  getPlacedNotesForBoard,
  type PlacedRollingPaperNote,
  type RollingPaperPan,
} from '@/lib/rollingPaperLayout';
import {
  toCanvasColorId,
  toPlacedRollingPaperNote,
  toRollingPaperCategory,
  toRollingPaperChannel,
} from './rollingPaperApiAdapter';
import RollingPaperBoardCanvas from './RollingPaperBoardCanvas';
import RollingPaperBoardChangeDialog from './RollingPaperBoardChangeDialog';
import RollingPaperCategoryTabs from './RollingPaperCategoryTabs';
import RollingPaperTabs from './RollingPaperTabs';
import RollingPaperWriteModal from './RollingPaperWriteModal';
import RollingPaperZoomControls from './RollingPaperZoomControls';

const INITIAL_BOARD_PAN: RollingPaperPan = { x: 0, y: 0 };

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
  const postitsQuery = useQuery({
    queryKey: ['rollingPaper', 'postits', boardId],
    queryFn: () => rollingPaperApi.listPostits(boardId!),
    enabled: Boolean(boardId),
  });
  const apiPlacedNotes = (postitsQuery.data ?? []).map(toPlacedRollingPaperNote);
  const placedNotes = mockNotes.length > 0 ? mockNotes : apiPlacedNotes;
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isBoardChangeDialogOpen, setIsBoardChangeDialogOpen] = useState(false);
  const [boardScale, setBoardScale] = useState<number>(ROLLING_PAPER_ZOOM.default);
  const [boardPan, setBoardPan] = useState<RollingPaperPan>(INITIAL_BOARD_PAN);
  const [focusedNoteId, setFocusedNoteId] = useState<string | null>(null);
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

  const boardScope = { categoryId: category.id, channelId: channel.id };
  const scopedPlacedNotes = placedNotes.filter((note) =>
    isNoteInChannel(note, category.id, channel.id),
  );
  const currentBoardNotes = getPlacedNotesForBoard(placedNotes, boardIndex, boardScope);
  const boardCapacity = channel.capacity ?? ROLLING_PAPER_MAX_NOTES_PER_BOARD;
  const totalBoardCount = Math.max(1, categoryChannels.length);
  const isCurrentBoardFull = currentBoardNotes.length >= boardCapacity;

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

    const resolvedPlacement = findNearestAvailableRollingPaperPlacement(
      { x: note.x, y: note.y },
      note.colorId,
      currentBoardNotes,
      boardIndex,
      undefined,
      ROLLING_PAPER_CLIENT_COLLISION_SCALE,
    );

    if (!resolvedPlacement) {
      return;
    }

    await createPostitMutation.mutateAsync({
      ...note,
      boardId,
      boardVariant: boardIndex,
      categoryId: category.id,
      channelId: channel.id,
      x: resolvedPlacement.x,
      y: resolvedPlacement.y,
    });
    setIsWriteModalOpen(false);
  };

  return (
    <div className="bg-white">
      <RollingPaperTabs active="board" />
      <RollingPaperCategoryTabs
        activeCategory={category}
        categories={apiCategories.length > 0 ? apiCategories : [category]}
      />

      <section className="min-h-[713px] bg-black/[0.02] pt-7 pb-16">
        <div className="flex flex-col gap-6 px-5">
          <div className="flex flex-col gap-2.5">
            <h1 className="font-wanted-sans text-[24px] font-bold leading-none tracking-[-0.02em] text-black">
              롤링페이퍼
            </h1>
            <p className="font-wanted-sans text-body1 font-normal leading-none tracking-[-0.02em] text-gray">
              경북대학교 80주년을 축하해주세요!
            </p>
          </div>

          <button
            type="button"
            className="w-fit rounded-full border border-sub-red px-5 py-2.5 font-wanted-sans text-sm font-medium leading-[1.5] text-sub-red transition hover:bg-sub-red/5"
            onClick={() => setIsBoardChangeDialogOpen(true)}
          >
            보드 변경하기
          </button>

          <div className="flex items-end gap-7">
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <p className="font-wanted-sans text-body1 font-normal leading-none tracking-[-0.02em] text-gray">
                Board
              </p>
              <p className="font-wanted-sans text-[24px] font-bold leading-none tracking-[-0.02em] text-black">
                <span className="text-sub-red">{channelIndex + 1}</span>/{totalBoardCount}
              </p>
              <p className="font-wanted-sans text-caption font-medium text-gray">{channel.label}</p>
            </div>
            <button
              type="button"
              className={`rounded-full px-5 py-2.5 font-wanted-sans text-sm font-medium leading-[1.5] text-white shadow-[0_6px_14px_rgba(255,61,61,0.22)] transition ${
                isCurrentBoardFull || !boardId
                  ? 'cursor-not-allowed bg-sub-red/45 shadow-none'
                  : 'bg-sub-red'
              }`}
              disabled={isCurrentBoardFull || !boardId}
              onClick={() => setIsWriteModalOpen(true)}
            >
              {isCurrentBoardFull ? '보드가 가득 찼어요' : '메시지 남기기'}
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
            navigate(getRollingPaperBoardPath(category.id, nextChannel.id));
          }}
        />
      )}
    </div>
  );
}
