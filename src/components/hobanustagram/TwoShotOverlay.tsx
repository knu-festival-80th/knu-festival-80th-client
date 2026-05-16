import { useTwoShot } from '@/hooks/useTwoShot';
import { TwoShotCompositingStep } from '@/components/hobanustagram/TwoShotCompositingStep';
import { TwoShotPreviewStep } from '@/components/hobanustagram/TwoShotPreviewStep';
import { TwoShotSelectFrameStep } from '@/components/hobanustagram/TwoShotSelectFrameStep';
import { TwoShotSelectPhotosStep } from '@/components/hobanustagram/TwoShotSelectPhotosStep';
import { TwoShotShootingStep } from '@/components/hobanustagram/TwoShotShootingStep';

export interface TwoShotOverlayProps {
  onClose: () => void;
  onComplete: (compositedUrl: string) => void;
}

export const TwoShotOverlay = ({ onClose, onComplete }: TwoShotOverlayProps) => {
  const {
    step,
    setStep,
    selectedFilter,
    setSelectedFilter,
    capturedPhotos,
    selectedIndices,
    slotAspect,
    showFlash,
    timerEnabled,
    setTimerEnabled,
    countdown,
    videoRef,
    isReady,
    error,
    facingMode,
    flipCamera,
    viewportW,
    viewportH,
    handleShutter,
    handleToggleSelection,
    handleComplete,
  } = useTwoShot(onComplete);

  if (step === 'preview') {
    return <TwoShotPreviewStep onClose={onClose} onStart={() => setStep('shooting')} />;
  }

  if (step === 'shooting') {
    return (
      <TwoShotShootingStep
        videoRef={videoRef}
        isReady={isReady}
        error={error}
        facingMode={facingMode}
        flipCamera={flipCamera}
        slotAspect={slotAspect}
        viewportW={viewportW}
        viewportH={viewportH}
        showFlash={showFlash}
        countdown={countdown}
        timerEnabled={timerEnabled}
        shotNumber={Math.min(capturedPhotos.length + 1, 4)}
        onToggleTimer={() => setTimerEnabled((v) => !v)}
        onShutter={handleShutter}
        onClose={onClose}
      />
    );
  }

  if (step === 'select-photos') {
    return (
      <TwoShotSelectPhotosStep
        capturedPhotos={capturedPhotos}
        selectedIndices={selectedIndices}
        selectedFilter={selectedFilter}
        onToggleSelection={handleToggleSelection}
        onNext={() => setStep('select-frame')}
      />
    );
  }

  if (step === 'select-frame') {
    return (
      <TwoShotSelectFrameStep
        capturedPhotos={capturedPhotos}
        selectedIndices={selectedIndices}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        onComplete={() => void handleComplete()}
      />
    );
  }

  if (step === 'compositing') {
    return <TwoShotCompositingStep />;
  }

  return null;
};
