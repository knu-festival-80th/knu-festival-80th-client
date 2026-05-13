import { useEffect, useState } from 'react';
import {
  ROLLING_PAPER_DEFAULT_MESSAGE,
  type RollingPaperStickerColorId,
} from '@/constants/rollingPaper';
import {
  ROLLING_PAPER_MAX_NOTES_PER_BOARD,
  ROLLING_PAPER_CLIENT_COLLISION_SCALE,
  ROLLING_PAPER_ZOOM,
  findNearestAvailableRollingPaperPlacement,
  getPlacedNotesForBoard,
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
  onClose,
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

  const occupiedNotes = getPlacedNotesForBoard(placedNotes, boardVariant);
  const selectedPlacement = findNearestAvailableRollingPaperPlacement(
    requestedPlacement,
    colorId,
    occupiedNotes,
    boardVariant,
    undefined,
    ROLLING_PAPER_CLIENT_COLLISION_SCALE,
  );

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

  const resetPlacementStep = () => {
    setRequestedPlacement({ x: 50, y: 50 });
    setScale(ROLLING_PAPER_ZOOM.default);
    setPan({ x: 0, y: 0 });
  };

  const handleBack = () => {
    if (step === 'compose') {
      onClose();
      return;
    }

    setStep('compose');
  };

  const handleNext = () => {
    resetPlacementStep();
    setStep('place');
  };

  const handlePlace = async () => {
    if (!trimmedMessage || !selectedPlacement || isSubmitting) return;

    await onPlace({
      id: createRollingPaperNoteId(),
      message: trimmedMessage,
      colorId,
      x: selectedPlacement.x,
      y: selectedPlacement.y,
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
            scale={scale}
            pan={pan}
            onPlacementChange={setRequestedPlacement}
            onScaleChange={setScale}
            onPanChange={setPan}
            onPlaceDisabled={
              isSubmitting ||
              !selectedPlacement ||
              occupiedNotes.length >= ROLLING_PAPER_MAX_NOTES_PER_BOARD
            }
            isSubmitting={isSubmitting}
            onPlace={handlePlace}
          />
        )}
      </div>
    </div>
  );
}
