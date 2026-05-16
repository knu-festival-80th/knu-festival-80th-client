import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ROLLING_PAPER_DEFAULT_MESSAGE,
  type RollingPaperStickerColorId,
} from '@/constants/rollingPaper';
import {
  ROLLING_PAPER_CLIENT_COLLISION_SCALE,
  ROLLING_PAPER_MAX_NOTES_PER_BOARD,
  ROLLING_PAPER_ZOOM,
  clampRollingPaperPlacement,
  getPlacedNotesForBoard,
  isRollingPaperPlacementAvailable,
  type RollingPaperPan,
  type RollingPaperPlacement,
} from '@/lib/rollingPaperLayout';
import RollingPaperWriteComposeStep from './RollingPaperWriteComposeStep';
import RollingPaperWriteModalHeader from './RollingPaperWriteModalHeader';
import RollingPaperWritePlaceStep from './RollingPaperWritePlaceStep';
import { createRollingPaperNoteId } from './rollingPaperWriteModalUtils';
import type {
  RollingPaperWriteModalProps,
  RollingPaperWriteStep,
} from './rollingPaperWriteModalTypes';

export default function RollingPaperWriteModal({
  isOpen,
  boardVariant,
  placedNotes,
  isSubmitting = false,
  placementErrorMessage,
  onClose,
  onPlacementErrorClear,
  onPlace,
}: RollingPaperWriteModalProps) {
  const [step, setStep] = useState<RollingPaperWriteStep>('compose');
  const [message, setMessage] = useState(ROLLING_PAPER_DEFAULT_MESSAGE);
  const [colorId, setColorId] = useState<RollingPaperStickerColorId>('red');
  const [requestedPlacement, setRequestedPlacement] = useState<RollingPaperPlacement>({
    x: 50,
    y: 50,
  });
  const [scale, setScale] = useState<number>(ROLLING_PAPER_ZOOM.default);
  const [pan, setPan] = useState<RollingPaperPan>({ x: 0, y: 0 });

  const trimmedMessage = message.trim();
  const occupiedNotes = getPlacedNotesForBoard(placedNotes, boardVariant);
  const selectedPlacement = clampRollingPaperPlacement(requestedPlacement, colorId);
  const isPlacementAvailable = isRollingPaperPlacementAvailable(
    selectedPlacement,
    colorId,
    occupiedNotes,
    boardVariant,
    undefined,
    ROLLING_PAPER_CLIENT_COLLISION_SCALE,
  );
  const canPlace =
    Boolean(trimmedMessage) &&
    isPlacementAvailable &&
    !isSubmitting &&
    occupiedNotes.length < ROLLING_PAPER_MAX_NOTES_PER_BOARD;

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

  const resetPlacementStep = () => {
    setRequestedPlacement({ x: 50, y: 50 });
    setScale(ROLLING_PAPER_ZOOM.default);
    setPan({ x: 0, y: 0 });
  };

  const handleBack = () => {
    onPlacementErrorClear?.();

    if (step === 'compose') {
      onClose();
      return;
    }

    setStep('compose');
  };

  const handleNext = () => {
    onPlacementErrorClear?.();
    resetPlacementStep();
    setStep('place');
  };

  const handlePlace = async () => {
    if (!canPlace) return;

    await onPlace({
      id: createRollingPaperNoteId(),
      message: trimmedMessage,
      colorId,
      x: selectedPlacement.x,
      y: selectedPlacement.y,
      boardVariant,
    });
  };

  const handlePlacementChange = (placement: RollingPaperPlacement) => {
    onPlacementErrorClear?.();
    setRequestedPlacement(placement);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rolling-paper-write-title"
      className="fixed inset-0 z-[100] flex h-dvh justify-center overflow-y-auto bg-black/30 px-5 pt-[101px] pb-10 [-webkit-overflow-scrolling:touch]"
    >
      <div className="flex h-[612px] w-full max-w-[335px] shrink-0 flex-col overflow-hidden rounded-xl bg-white pt-4 pb-6 shadow-[0_16px_60px_rgba(0,0,0,0.2)]">
        <RollingPaperWriteModalHeader step={step} onBack={handleBack} onClose={onClose} />
        <span id="rolling-paper-write-title" className="sr-only">
          롤링페이퍼 메시지 작성
        </span>

        {step === 'compose' ? (
          <RollingPaperWriteComposeStep
            message={message}
            colorId={colorId}
            onMessageChange={setMessage}
            onColorChange={setColorId}
            onNext={handleNext}
          />
        ) : (
          <RollingPaperWritePlaceStep
            boardVariant={boardVariant}
            colorId={colorId}
            message={trimmedMessage}
            occupiedNotes={occupiedNotes}
            selectedPlacement={selectedPlacement}
            isPlacementAvailable={isPlacementAvailable}
            placementErrorMessage={placementErrorMessage}
            scale={scale}
            pan={pan}
            onPlacementChange={handlePlacementChange}
            onScaleChange={setScale}
            onPanChange={setPan}
            onPlaceDisabled={!canPlace || Boolean(placementErrorMessage)}
            isSubmitting={isSubmitting}
            onPlace={handlePlace}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
