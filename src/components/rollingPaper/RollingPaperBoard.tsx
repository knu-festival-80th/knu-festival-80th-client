import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
  ROLLING_PAPER_ZOOM,
  findNearestAvailableRollingPaperPlacement,
  getPlacedNotesForBoard,
  type PlacedRollingPaperNote,
  type RollingPaperPan,
} from '@/lib/rollingPaperLayout';
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
  const category = getRollingPaperCategory(categoryId);
  const channel = getRollingPaperChannel(category.id, channelId);
  const categoryChannels = getRollingPaperChannelsByCategory(category.id);
  const boardIndex = getRollingPaperChannelIndex(category.id, channel.id);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isBoardChangeDialogOpen, setIsBoardChangeDialogOpen] = useState(false);
  const [placedNotes, setPlacedNotes] = useState<PlacedRollingPaperNote[]>(getInitialPlacedNotes);
  const [boardScale, setBoardScale] = useState<number>(ROLLING_PAPER_ZOOM.default);
  const [boardPan, setBoardPan] = useState<RollingPaperPan>(INITIAL_BOARD_PAN);
  const [focusedNoteId, setFocusedNoteId] = useState<string | null>(null);

  const boardScope = { categoryId: category.id, channelId: channel.id };
  const scopedPlacedNotes = placedNotes.filter((note) =>
    isNoteInChannel(note, category.id, channel.id),
  );
  const currentBoardNotes = getPlacedNotesForBoard(placedNotes, boardIndex, boardScope);
  const isCurrentBoardFull = currentBoardNotes.length >= ROLLING_PAPER_MAX_NOTES_PER_BOARD;

  const resetBoardViewport = () => {
    setBoardScale(ROLLING_PAPER_ZOOM.default);
    setBoardPan(INITIAL_BOARD_PAN);
    setFocusedNoteId(null);
  };

  const showPreviousBoard = () => {
    resetBoardViewport();
    const previousIndex = boardIndex === 0 ? categoryChannels.length - 1 : boardIndex - 1;
    const previousChannel = categoryChannels[previousIndex];

    navigate(getRollingPaperBoardPath(category.id, previousChannel.id));
  };

  const showNextBoard = () => {
    resetBoardViewport();
    const nextIndex = (boardIndex + 1) % categoryChannels.length;
    const nextChannel = categoryChannels[nextIndex];

    navigate(getRollingPaperBoardPath(category.id, nextChannel.id));
  };

  const handlePlaceNote = (note: PlacedRollingPaperNote) => {
    setPlacedNotes((prevNotes) => {
      const boardNotes = getPlacedNotesForBoard(prevNotes, boardIndex, boardScope);

      if (boardNotes.length >= ROLLING_PAPER_MAX_NOTES_PER_BOARD) {
        return prevNotes;
      }

      const resolvedPlacement = findNearestAvailableRollingPaperPlacement(
        { x: note.x, y: note.y },
        note.colorId,
        boardNotes,
        note.boardVariant,
      );

      if (!resolvedPlacement) {
        return prevNotes;
      }

      return [
        ...prevNotes,
        {
          ...note,
          boardVariant: boardIndex,
          categoryId: category.id,
          channelId: channel.id,
          x: resolvedPlacement.x,
          y: resolvedPlacement.y,
        },
      ];
    });
    setIsWriteModalOpen(false);
  };

  return (
    <div className="bg-white">
      <RollingPaperTabs active="board" />
      <RollingPaperCategoryTabs activeCategory={category} />

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
                <span className="text-sub-red">{boardIndex + 1}</span>/{categoryChannels.length}
              </p>
              <p className="font-wanted-sans text-caption font-medium text-gray">{channel.label}</p>
            </div>
            <button
              type="button"
              className={`rounded-full px-5 py-2.5 font-wanted-sans text-sm font-medium leading-[1.5] text-white shadow-[0_6px_14px_rgba(255,61,61,0.22)] transition ${
                isCurrentBoardFull ? 'cursor-not-allowed bg-sub-red/45 shadow-none' : 'bg-sub-red'
              }`}
              disabled={isCurrentBoardFull}
              onClick={() => setIsWriteModalOpen(true)}
            >
              {isCurrentBoardFull ? '보드가 가득 찼어요' : '메시지 남기기'}
            </button>
          </div>
        </div>

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
          onClose={() => setIsWriteModalOpen(false)}
          onPlace={handlePlaceNote}
        />
      )}

      {isBoardChangeDialogOpen && (
        <RollingPaperBoardChangeDialog
          category={category}
          currentChannel={channel}
          placedNotes={placedNotes}
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
