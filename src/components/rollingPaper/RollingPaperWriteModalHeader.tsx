import { ArrowLeft, X } from 'lucide-react';
import type { RollingPaperWriteStep } from './rollingPaperWriteModalTypes';

type RollingPaperWriteModalHeaderProps = {
  step: RollingPaperWriteStep;
  onBack: () => void;
  onClose: () => void;
};

export default function RollingPaperWriteModalHeader({
  step,
  onBack,
  onClose,
}: RollingPaperWriteModalHeaderProps) {
  return (
    <div className="flex h-[30px] shrink-0 items-center justify-between px-5">
      <button
        type="button"
        aria-label={step === 'compose' ? '작성 모달 닫기' : '메시지 작성으로 돌아가기'}
        className="flex size-[30px] items-center justify-center text-black"
        onClick={onBack}
      >
        <ArrowLeft className="size-6" />
      </button>
      <h2 className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.02em] text-black">
        메세지 작성하기
      </h2>
      <button
        type="button"
        aria-label="작성 모달 닫기"
        className="flex size-[30px] items-center justify-center text-black"
        onClick={onClose}
      >
        <X className="size-6" />
      </button>
    </div>
  );
}
