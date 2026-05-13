import { X } from 'lucide-react';
import {
  getRollingPaperChannelsByCategory,
  type RollingPaperCategory,
  type RollingPaperChannel,
} from '@/constants/rollingPaper';
import type { PlacedRollingPaperNote } from '@/lib/rollingPaperLayout';
import RollingPaperChannelCard from './RollingPaperChannelCard';

type RollingPaperBoardChangeDialogProps = {
  category: RollingPaperCategory;
  currentChannel: RollingPaperChannel;
  placedNotes: PlacedRollingPaperNote[];
  onClose: () => void;
  onSelectChannel: (channel: RollingPaperChannel) => void;
};

export default function RollingPaperBoardChangeDialog({
  category,
  currentChannel,
  placedNotes,
  onClose,
  onSelectChannel,
}: RollingPaperBoardChangeDialogProps) {
  const channels = getRollingPaperChannelsByCategory(category.id);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 px-4 pb-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rolling-paper-board-change-title"
    >
      <div className="max-h-[78dvh] w-full max-w-[560px] overflow-hidden rounded-[24px] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex flex-col gap-1">
            <h2
              id="rolling-paper-board-change-title"
              className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.02em] text-black"
            >
              보드 변경
            </h2>
            <p className="font-wanted-sans text-caption font-medium text-gray">
              {category.label} 안에서 작성할 채널을 선택해주세요.
            </p>
          </div>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full bg-black/[0.04] text-ink"
            aria-label="보드 변경 닫기"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid max-h-[calc(78dvh-92px)] grid-cols-3 gap-2.5 overflow-y-auto bg-[#f6f7ff] p-4">
          {channels.map((channel, index) => {
            const noteCount =
              placedNotes.filter(
                (note) =>
                  note.boardVariant === index &&
                  note.categoryId === category.id &&
                  note.channelId === channel.id,
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
    </div>
  );
}
