import { useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Circle, Minus, Plus } from 'lucide-react';
import rollingBoardFrameMain from '@/assets/rollingPaper/rolling-board-frame-main.png';
import rollingBoardFrameTypography from '@/assets/rollingPaper/rolling-board-frame-typography.png';
import RollingPaperSticker from './RollingPaperSticker';
import RollingPaperTabs from './RollingPaperTabs';
import RollingPaperWriteModal, { type PlacedRollingPaperNote } from './RollingPaperWriteModal';

const boardFrames = [rollingBoardFrameMain, rollingBoardFrameTypography] as const;

function BoardCanvas({
  variant,
  placedNotes,
}: {
  variant: number;
  placedNotes: PlacedRollingPaperNote[];
}) {
  return (
    <div className="relative mx-auto h-[509px] w-[375px] max-w-full overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-white/95 to-white/0" />

      <img
        src={boardFrames[variant]}
        alt=""
        className="absolute top-[42px] left-1/2 z-20 size-[230px] -translate-x-1/2 object-contain"
      />

      {placedNotes
        .filter((note) => note.boardVariant === variant)
        .map((note) => (
          <RollingPaperSticker
            key={note.id}
            colorId={note.colorId}
            message={note.message}
            className="absolute z-30 w-[84px]"
            style={{
              left: `${note.x}%`,
              top: `${note.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
    </div>
  );
}

type ControlButtonProps = {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
};

function ControlButton({ icon, label, onClick }: ControlButtonProps) {
  return (
    <button
      type="button"
      className="flex flex-1 items-center justify-center gap-1 rounded-full border border-black/10 bg-black/[0.03] px-4 py-2.5 font-wanted-sans text-sm font-medium leading-[1.5] text-ink backdrop-blur-[2px]"
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function RollingPaperBoard() {
  const [boardIndex, setBoardIndex] = useState(0);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [placedNotes, setPlacedNotes] = useState<PlacedRollingPaperNote[]>([]);

  const showPreviousBoard = () => {
    setBoardIndex((prev) => (prev === 0 ? boardFrames.length - 1 : prev - 1));
  };

  const showNextBoard = () => {
    setBoardIndex((prev) => (prev + 1) % boardFrames.length);
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
                <span className="text-sub-red">{boardIndex + 1}</span>/{boardFrames.length}
              </p>
            </div>
            <button
              type="button"
              className="rounded-full bg-sub-red px-5 py-2.5 font-wanted-sans text-sm font-medium leading-[1.5] text-white shadow-[0_6px_14px_rgba(255,61,61,0.22)]"
              onClick={() => setIsWriteModalOpen(true)}
            >
              메시지 남기기
            </button>
          </div>
        </div>

        <div className="relative mt-6">
          <BoardCanvas variant={boardIndex} placedNotes={placedNotes} />

          <div className="pointer-events-none absolute inset-x-0 top-[30px] z-30 flex justify-between px-4">
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

        <div className="mt-[-40px] flex justify-center gap-3 px-5">
          <ControlButton icon={<Minus className="size-5" />} label="축소" />
          <ControlButton icon={<Circle className="size-5" />} label="원점" />
          <ControlButton icon={<Plus className="size-5" />} label="확대" />
        </div>
      </section>

      {isWriteModalOpen && (
        <RollingPaperWriteModal
          isOpen={isWriteModalOpen}
          boardVariant={boardIndex}
          onClose={() => setIsWriteModalOpen(false)}
          onPlace={(note) => {
            setPlacedNotes((prevNotes) => [...prevNotes, note]);
            setIsWriteModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
