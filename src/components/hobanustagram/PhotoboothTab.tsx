import { useEffect, useRef, useState } from 'react';
import { Download, ImagePlus, RotateCcw } from 'lucide-react';

import { capturePhoto } from '@/lib/capturePhoto';
import { CHARACTER_LIST } from '@/constants/hobanustagram';
import { useCamera } from '@/hooks/useCamera';
import type { CameraState, CharacterKey, TabStep } from '@/types/hobanustagram';
import { CameraOverlay } from './CameraOverlay';
import { StepIndicator } from './StepIndicator';

export const PhotoboothTab = () => {
  const [tabStep, setTabStep] = useState<TabStep>(1);
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterKey>('hobanu');
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [showFrameSelector, setShowFrameSelector] = useState(false);

  const { videoRef, isReady, error, facingMode, startCamera, stopCamera, flipCamera } = useCamera();
  const overlayRef = useRef<HTMLImageElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);

  const selectedCharacterData =
    CHARACTER_LIST.find((c) => c.key === selectedCharacter) ?? CHARACTER_LIST[0];

  useEffect(() => {
    if (cameraState === 'shooting') {
      void startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraState]);

  const handleOpenCamera = () => setCameraState('shooting');

  const handleShutter = () => {
    if (!videoRef.current || !overlayRef.current) return;
    const bottomInset = bottomBarRef.current?.offsetHeight ?? 0;
    const overlayRect = overlayRef.current.getBoundingClientRect();
    const dataUrl = capturePhoto(
      videoRef.current,
      overlayRef.current,
      bottomInset,
      overlayRect,
      facingMode === 'user',
    );
    setCapturedDataUrl(dataUrl);
    setCameraState('review');
  };

  const handleRetake = () => setCameraState('shooting');

  const handleUsePhoto = () => {
    stopCamera();
    setCameraState('idle');
    setTabStep(2);
    setShowFrameSelector(false);
  };

  const handleClose = () => {
    stopCamera();
    setCameraState('idle');
    setShowFrameSelector(false);
  };

  const handleRestartFromResult = () => {
    setCapturedDataUrl(null);
    setTabStep(1);
  };

  return (
    <>
      {cameraState !== 'idle' && (
        <CameraOverlay
          cameraState={cameraState}
          videoRef={videoRef}
          overlayRef={overlayRef}
          bottomBarRef={bottomBarRef}
          facingMode={facingMode}
          isReady={isReady}
          error={error}
          selectedCharacter={selectedCharacter}
          selectedCharacterData={selectedCharacterData}
          capturedDataUrl={capturedDataUrl}
          showFrameSelector={showFrameSelector}
          onClose={handleClose}
          onFlipCamera={flipCamera}
          onToggleFrameSelector={() => setShowFrameSelector((prev) => !prev)}
          onShutter={handleShutter}
          onSelectCharacter={setSelectedCharacter}
          onRetake={handleRetake}
          onUsePhoto={handleUsePhoto}
        />
      )}

      <div className="flex min-h-screen flex-col gap-7 bg-white px-5 py-7">
        <StepIndicator currentStep={tabStep} />

        {tabStep === 1 && (
          <div className="flex flex-col gap-7">
            <div className="flex flex-col items-center gap-2.5">
              <p className="font-wanted-sans text-2xl font-bold leading-none tracking-[-0.48px] text-black">
                카메라로 찍어보세요
              </p>
              <p className="font-wanted-sans text-base font-normal leading-none tracking-[-0.32px] text-gray">
                프레임을 미리 보면서 촬영할 수 있어요
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCamera}
              className="flex h-67 w-full flex-col items-center justify-center gap-8 rounded-xl border border-dashed border-sub-red bg-[rgba(255,61,61,0.04)]"
            >
              <div className="flex size-20 items-center justify-center rounded-full bg-linear-to-br from-[#ffa855] to-sub-red">
                <ImagePlus className="size-9 text-white" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.36px] text-black">
                  카메라 열기
                </p>
                <p className="whitespace-pre-line text-center font-wanted-sans text-sm font-normal leading-[1.4] tracking-[-0.28px] text-gray">
                  {'탭하면 카메라가 켜져요\n프레임을 씌운 채로 찍을 수 있어요'}
                </p>
              </div>
            </button>
          </div>
        )}

        {tabStep === 2 && capturedDataUrl && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2.5">
              <p className="font-wanted-sans text-2xl font-bold leading-none tracking-[-0.48px] text-black">
                완성!🎉
              </p>
              <p className="font-wanted-sans text-base font-normal leading-none tracking-[-0.32px] text-gray">
                저장하거나 다시 찍어보세요!
              </p>
            </div>

            <img src={capturedDataUrl} alt="완성된 사진" className="w-full rounded-xl" />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleRestartFromResult}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex size-20 items-center justify-center rounded-full bg-[#EEEEEE]">
                  <RotateCcw className="size-9 text-[#333]" />
                </div>
                <span className="font-wanted-sans text-sm font-medium text-[#808080]">
                  다시 찍기
                </span>
              </button>
              <a
                href={capturedDataUrl}
                download="hobanu-photo.png"
                className="flex flex-col items-center gap-2"
              >
                <div className="flex size-20 items-center justify-center rounded-full bg-[#EEEEEE]">
                  <Download className="size-9 text-[#333]" />
                </div>
                <span className="font-wanted-sans text-sm font-medium text-[#808080]">
                  기기에 저장
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
