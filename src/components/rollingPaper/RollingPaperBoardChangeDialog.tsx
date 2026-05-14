import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { RollingPaperCategory, RollingPaperChannel } from '@/constants/rollingPaper';
import type { PlacedRollingPaperNote } from '@/lib/rollingPaperLayout';
import RollingPaperChannelCard from './RollingPaperChannelCard';

type RollingPaperBoardChangeDialogProps = {
  category: RollingPaperCategory;
  currentChannel: RollingPaperChannel;
  channels: RollingPaperChannel[];
  placedNotes: PlacedRollingPaperNote[];
  onClose: () => void;
  onSelectChannel: (channel: RollingPaperChannel) => void;
};

export default function RollingPaperBoardChangeDialog({
  category,
  currentChannel,
  channels,
  placedNotes,
  onClose,
  onSelectChannel,
}: RollingPaperBoardChangeDialogProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex h-dvh items-end justify-center overflow-hidden bg-black/35"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rolling-paper-board-change-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex h-[calc(100dvh-100px)] w-full max-w-[600px] flex-col overflow-hidden rounded-t-[8px] bg-white shadow-[0_-18px_50px_rgba(0,0,0,0.14)]">
        <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-border px-5">
          <div>
            <h2
              id="rolling-paper-board-change-title"
              className="font-wanted-sans text-[18px] font-bold leading-none tracking-[-0.02em] text-black"
            >
              보드 변경하기
            </h2>
            <p className="mt-2 font-wanted-sans text-caption font-medium leading-none tracking-[-0.02em] text-gray">
              {category.label} · 총 {channels.length}개
            </p>
          </div>
          <button
            type="button"
            className="flex size-6 items-center justify-center text-ink"
            aria-label="보드 변경 닫기"
            onClick={onClose}
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-3 content-start gap-2.5 overflow-y-auto overscroll-contain px-5 py-5 [-webkit-overflow-scrolling:touch]">
          {channels.map((channel, index) => {
            const noteCount =
              placedNotes.filter(
                (note) =>
                  note.boardVariant === (channel.boardVariant ?? index) &&
                  (!note.categoryId || note.categoryId === category.id) &&
                  (!note.channelId || note.channelId === channel.id),
              ).length || channel.noteCount;

            return (
              <RollingPaperChannelCard
                key={channel.id}
                channel={channel}
                noteCount={noteCount}
                isActive={channel.id === currentChannel.id}
                onClick={() => onSelectChannel(channel)}
              />
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
