import { ChevronDown, Plus } from 'lucide-react';

type RollingPaperBoardSummaryProps = {
  boardNumberLabel: string;
  currentBoardNoteCount: number;
  boardCapacity: number;
  isCurrentBoardFull: boolean;
  canWrite: boolean;
  onBoardChangeClick: () => void;
  onWriteClick: () => void;
};

export default function RollingPaperBoardSummary({
  boardNumberLabel,
  currentBoardNoteCount,
  boardCapacity,
  isCurrentBoardFull,
  canWrite,
  onBoardChangeClick,
  onWriteClick,
}: RollingPaperBoardSummaryProps) {
  return (
    <>
      <button
        type="button"
        className="flex h-[30px] items-center gap-1 rounded border border-border bg-white px-2.5 font-wanted-sans text-caption font-medium leading-none tracking-[-0.02em] text-black"
        onClick={onBoardChangeClick}
      >
        <span className="font-semibold text-sub-red">{boardNumberLabel}</span>
        <span>보드 변경하기</span>
        <ChevronDown className="size-3.5" />
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
            canWrite ? 'bg-sub-red' : 'hidden'
          }`}
          disabled={!canWrite}
          onClick={onWriteClick}
        >
          <Plus className="size-4" />
          <span>메시지 남기기</span>
        </button>
      </div>
    </>
  );
}
