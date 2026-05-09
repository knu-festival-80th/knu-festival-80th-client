import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  ROLLING_PAPER_MAX_NOTES_PER_BOARD,
  ROLLING_PAPER_ZOOM,
  findNearestAvailableRollingPaperPlacement,
  getPlacedNotesForBoard,
  type PlacedRollingPaperNote,
  type RollingPaperPan,
} from '@/lib/rollingPaperLayout';
import RollingPaperBoardCanvas from './RollingPaperBoardCanvas';
import { rollingPaperBoardFrames } from './rollingPaperBoardAssets';
import RollingPaperTabs from './RollingPaperTabs';
import RollingPaperWriteModal from './RollingPaperWriteModal';
import RollingPaperZoomControls from './RollingPaperZoomControls';

const INITIAL_BOARD_PAN: RollingPaperPan = { x: 0, y: 0 };

export default function RollingPaperBoard() {
  const [boardIndex, setBoardIndex] = useState(0);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [placedNotes, setPlacedNotes] = useState<PlacedRollingPaperNote[]>([]);
  const [boardScale, setBoardScale] = useState<number>(ROLLING_PAPER_ZOOM.default);
  const [boardPan, setBoardPan] = useState<RollingPaperPan>(INITIAL_BOARD_PAN);

  const currentBoardNotes = getPlacedNotesForBoard(placedNotes, boardIndex);
  const isCurrentBoardFull = currentBoardNotes.length >= ROLLING_PAPER_MAX_NOTES_PER_BOARD;

  const resetBoardViewport = () => {
    setBoardScale(ROLLING_PAPER_ZOOM.default);
    setBoardPan(INITIAL_BOARD_PAN);
  };

  const showPreviousBoard = () => {
    resetBoardViewport();
    setBoardIndex((prev) => (prev === 0 ? rollingPaperBoardFrames.length - 1 : prev - 1));
  };

  const showNextBoard = () => {
    resetBoardViewport();
    setBoardIndex((prev) => (prev + 1) % rollingPaperBoardFrames.length);
  };

  const handlePlaceNote = (note: PlacedRollingPaperNote) => {
    setPlacedNotes((prevNotes) => {
      const boardNotes = getPlacedNotesForBoard(prevNotes, note.boardVariant);

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

          <div className="flex items-end gap-7">
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <p className="font-wanted-sans text-body1 font-normal leading-none tracking-[-0.02em] text-gray">
                Board
              </p>
              <p className="font-wanted-sans text-[24px] font-bold leading-none tracking-[-0.02em] text-black">
                <span className="text-sub-red">{boardIndex + 1}</span>/
                {rollingPaperBoardFrames.length}
              </p>
              <p className="font-wanted-sans text-[13px] font-medium leading-none tracking-[-0.02em] text-gray">
                포스트잇 {currentBoardNotes.length}/{ROLLING_PAPER_MAX_NOTES_PER_BOARD}
              </p>
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
            placedNotes={placedNotes}
            onPanChange={setBoardPan}
            onScaleChange={setBoardScale}
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
        />
      </section>

      {isWriteModalOpen && (
        <RollingPaperWriteModal
          isOpen={isWriteModalOpen}
          boardVariant={boardIndex}
          placedNotes={placedNotes}
          onClose={() => setIsWriteModalOpen(false)}
          onPlace={handlePlaceNote}
        />
      )}
    </div>
  );
}
