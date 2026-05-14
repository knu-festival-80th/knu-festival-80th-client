import { Download, Share2 } from 'lucide-react';

interface SaveSheetProps {
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export const SaveSheet = ({ open, onClose, onDownload, onShare }: SaveSheetProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-[600px] rounded-t-2xl bg-white px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] animate-[slideUp_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#DDD]" />

        <button
          type="button"
          onClick={onDownload}
          className="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left active:bg-[#F5F5F5]"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-[#EEEEEE]">
            <Download className="size-6 text-[#333]" />
          </div>
          <div>
            <p className="font-wanted-sans text-base font-semibold text-[#1D1D1D]">기기에 저장</p>
            <p className="font-wanted-sans text-xs text-[#808080]">
              iPhone Chrome에서는 공유하기를 이용해 주세요
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={onShare}
          className="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left active:bg-[#F5F5F5]"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-[#EEEEEE]">
            <Share2 className="size-6 text-[#333]" />
          </div>
          <div>
            <p className="font-wanted-sans text-base font-semibold text-[#1D1D1D]">공유하기</p>
            <p className="font-wanted-sans text-xs text-[#808080]">
              Instagram 스토리 등에 바로 올릴 수 있어요
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
