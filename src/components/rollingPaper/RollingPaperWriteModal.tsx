import { useEffect, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { ArrowLeft, Circle, Minus, Plus, X } from 'lucide-react';
import rollingBoardFrameMain from '@/assets/rollingPaper/rolling-board-frame-main.png';
import rollingBoardFrameTypography from '@/assets/rollingPaper/rolling-board-frame-typography.png';
import {
  ROLLING_PAPER_DEFAULT_MESSAGE,
  ROLLING_PAPER_MAX_MESSAGE_LENGTH,
  ROLLING_PAPER_STICKER_COLORS,
  type RollingPaperStickerColorId,
} from '@/constants/rollingPaper';
import RollingPaperSticker from './RollingPaperSticker';

type WriteStep = 'compose' | 'place';

type Placement = {
  x: number;
  y: number;
};

export type PlacedRollingPaperNote = {
  id: string;
  message: string;
  colorId: RollingPaperStickerColorId;
  x: number;
  y: number;
  boardVariant: number;
};

type RollingPaperWriteModalProps = {
  isOpen: boolean;
  boardVariant: number;
  onClose: () => void;
  onPlace: (note: PlacedRollingPaperNote) => void;
};

const boardFrames = [rollingBoardFrameMain, rollingBoardFrameTypography] as const;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const stickerPreviewClassNames: Record<RollingPaperStickerColorId, string> = {
  red: 'w-8',
  yellow: 'w-8',
  green: 'w-6',
  blue: 'w-10',
  purple: 'w-8',
  pink: 'w-8',
};

function createNoteId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function ModalHeader({
  step,
  onBack,
  onClose,
}: {
  step: WriteStep;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex h-[30px] items-center justify-between px-5">
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

function StickerColorPicker({
  selectedColorId,
  onSelect,
}: {
  selectedColorId: RollingPaperStickerColorId;
  onSelect: (colorId: RollingPaperStickerColorId) => void;
}) {
  return (
    <div className="flex flex-col gap-3 px-6">
      <p className="font-wanted-sans text-[16px] font-semibold leading-none tracking-[-0.02em] text-black">
        포스트잇
      </p>
      <div className="flex items-center justify-between gap-2">
        {ROLLING_PAPER_STICKER_COLORS.map((color) => {
          const isSelected = selectedColorId === color.id;

          return (
            <button
              key={color.id}
              type="button"
              aria-label={`${color.label} 포스트잇 선택`}
              aria-pressed={isSelected}
              className={`flex size-10 items-center justify-center rounded-xl border bg-white transition ${
                isSelected
                  ? 'border-sub-red shadow-[0_0_0_2px_rgba(255,61,61,0.14)]'
                  : 'border-black/10'
              }`}
              onClick={() => onSelect(color.id)}
            >
              <RollingPaperSticker
                colorId={color.id}
                message=""
                hideText
                className={stickerPreviewClassNames[color.id]}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ComposeStep({
  message,
  colorId,
  onMessageChange,
  onColorChange,
  onNext,
}: {
  message: string;
  colorId: RollingPaperStickerColorId;
  onMessageChange: (message: string) => void;
  onColorChange: (colorId: RollingPaperStickerColorId) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="relative mt-4 h-[360px] w-[266px] overflow-hidden">
        <RollingPaperSticker
          colorId={colorId}
          message={message}
          className="absolute left-1/2 top-1/2 w-[230px] -translate-x-1/2 -translate-y-1/2"
        >
          <textarea
            aria-label="롤링페이퍼 메시지"
            value={message}
            maxLength={ROLLING_PAPER_MAX_MESSAGE_LENGTH}
            className="h-full w-full resize-none bg-transparent p-0 text-center font-wanted-sans text-[inherit] font-medium leading-[inherit] tracking-[-0.03em] text-black outline-none placeholder:text-black/35"
            placeholder="축하 메시지를 남겨주세요"
            onChange={(event) =>
              onMessageChange(event.target.value.slice(0, ROLLING_PAPER_MAX_MESSAGE_LENGTH))
            }
          />
        </RollingPaperSticker>
        <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 font-wanted-sans text-[12px] font-medium leading-none text-white">
          {message.length} / {ROLLING_PAPER_MAX_MESSAGE_LENGTH}
        </div>
      </div>

      <div className="mt-3 w-full">
        <StickerColorPicker selectedColorId={colorId} onSelect={onColorChange} />
      </div>

      <button
        type="button"
        className="mt-auto h-[50px] w-[287px] rounded-lg bg-[#ff3d3d] font-wanted-sans text-[16px] font-medium leading-none text-white disabled:bg-gray/40"
        disabled={!message.trim()}
        onClick={onNext}
      >
        다음으로
      </button>
    </div>
  );
}

function PlacementPreview({
  boardVariant,
  colorId,
  message,
  placement,
  scale,
  onPlacementChange,
}: {
  boardVariant: number;
  colorId: RollingPaperStickerColorId;
  message: string;
  placement: Placement;
  scale: number;
  onPlacementChange: (placement: Placement) => void;
}) {
  const previewRef = useRef<HTMLButtonElement>(null);

  const updatePlacement = (event: PointerEvent<HTMLButtonElement>) => {
    const preview = previewRef.current;

    if (!preview) return;

    const rect = preview.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    onPlacementChange({
      x: clamp(x, 20, 80),
      y: clamp(y, 18, 82),
    });
  };

  return (
    <button
      ref={previewRef}
      type="button"
      aria-label="롤링페이퍼를 붙일 위치 선택"
      className="relative h-[375px] w-[287px] overflow-hidden bg-[#d1d1d1] text-left"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        updatePlacement(event);
      }}
      onPointerMove={(event) => {
        if (event.buttons === 1) {
          updatePlacement(event);
        }
      }}
    >
      <div
        className="absolute inset-0 transition-transform duration-200"
        style={{ transform: `scale(${scale})`, transformOrigin: `${placement.x}% ${placement.y}%` }}
      >
        <img
          src={boardFrames[boardVariant]}
          alt=""
          className="absolute top-[44px] left-[92px] w-[325px] max-w-none object-contain opacity-95"
        />
      </div>
      <div className="absolute inset-0 bg-white/15" />

      <RollingPaperSticker
        colorId={colorId}
        message={message}
        className="absolute z-20 w-[108px]"
        style={{
          left: `${placement.x}%`,
          top: `${placement.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      <div className="absolute right-3 bottom-3 z-30 h-[72px] w-[52px] rounded-[10px] border border-black/10 bg-white/80 p-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)] backdrop-blur">
        <div className="relative h-full w-full overflow-hidden rounded-[7px] bg-[#f4f4f4]">
          <img
            src={boardFrames[boardVariant]}
            alt=""
            className="absolute top-3 left-1/2 w-[40px] -translate-x-1/2 object-contain opacity-80"
          />
          <span
            className="absolute size-2 rounded-full bg-sub-red"
            style={{
              left: `${placement.x}%`,
              top: `${placement.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      </div>
    </button>
  );
}

function PlacementControlButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex h-10 flex-1 items-center justify-center gap-1 rounded-full border border-[#e5e5e5] bg-white font-wanted-sans text-[14px] font-medium leading-none text-black"
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function PlaceStep({
  boardVariant,
  colorId,
  message,
  placement,
  scale,
  onPlacementChange,
  onScaleChange,
  onPlace,
}: {
  boardVariant: number;
  colorId: RollingPaperStickerColorId;
  message: string;
  placement: Placement;
  scale: number;
  onPlacementChange: (placement: Placement) => void;
  onScaleChange: (scale: number) => void;
  onPlace: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mt-4">
        <PlacementPreview
          boardVariant={boardVariant}
          colorId={colorId}
          message={message}
          placement={placement}
          scale={scale}
          onPlacementChange={onPlacementChange}
        />
      </div>

      <div className="mt-5 flex w-[287px] gap-3">
        <PlacementControlButton
          icon={<Minus className="size-5" />}
          label="축소"
          onClick={() => onScaleChange(clamp(Number((scale - 0.1).toFixed(2)), 0.85, 1.25))}
        />
        <PlacementControlButton
          icon={<Circle className="size-5" />}
          label="원점"
          onClick={() => onScaleChange(1)}
        />
        <PlacementControlButton
          icon={<Plus className="size-5" />}
          label="확대"
          onClick={() => onScaleChange(clamp(Number((scale + 0.1).toFixed(2)), 0.85, 1.25))}
        />
      </div>

      <button
        type="button"
        className="mt-auto h-[50px] w-[287px] rounded-lg bg-[#ff3d3d] font-wanted-sans text-[16px] font-medium leading-none text-white"
        onClick={onPlace}
      >
        롤링페이퍼 붙이기
      </button>
    </div>
  );
}

export default function RollingPaperWriteModal({
  isOpen,
  boardVariant,
  onClose,
  onPlace,
}: RollingPaperWriteModalProps) {
  const [step, setStep] = useState<WriteStep>('compose');
  const [message, setMessage] = useState(ROLLING_PAPER_DEFAULT_MESSAGE);
  const [colorId, setColorId] = useState<RollingPaperStickerColorId>('red');
  const [placement, setPlacement] = useState<Placement>({ x: 50, y: 50 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const trimmedMessage = message.trim();

  const handlePlace = () => {
    if (!trimmedMessage) return;

    onPlace({
      id: createNoteId(),
      message: trimmedMessage,
      colorId,
      x: placement.x,
      y: placement.y,
      boardVariant,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rolling-paper-write-title"
      className="fixed inset-0 z-[100] flex justify-center overflow-y-auto bg-black/30 px-5 pt-[101px] pb-10"
    >
      <div className="flex h-[612px] w-full max-w-[335px] flex-col overflow-hidden rounded-xl bg-white pt-4 pb-6 shadow-[0_16px_60px_rgba(0,0,0,0.2)]">
        <ModalHeader
          step={step}
          onBack={() => {
            if (step === 'compose') {
              onClose();
              return;
            }

            setStep('compose');
          }}
          onClose={onClose}
        />
        <span id="rolling-paper-write-title" className="sr-only">
          롤링페이퍼 메시지 작성
        </span>

        {step === 'compose' ? (
          <ComposeStep
            message={message}
            colorId={colorId}
            onMessageChange={setMessage}
            onColorChange={setColorId}
            onNext={() => setStep('place')}
          />
        ) : (
          <PlaceStep
            boardVariant={boardVariant}
            colorId={colorId}
            message={trimmedMessage}
            placement={placement}
            scale={scale}
            onPlacementChange={setPlacement}
            onScaleChange={setScale}
            onPlace={handlePlace}
          />
        )}
      </div>
    </div>
  );
}
