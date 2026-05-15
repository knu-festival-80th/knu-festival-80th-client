import { useEffect, useRef, useState } from 'react';
import { Download, Film, ImagePlus, RotateCcw, Share2 } from 'lucide-react';

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
  const [showSaveSheet, setShowSaveSheet] = useState(false);

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

  const handleSaveButtonClick = () => {
    const testFile = new File([], 'test');
    if (navigator.canShare?.({ files: [testFile] })) {
      setShowSaveSheet(true);
    } else {
      void downloadPhoto();
    }
  };

  const downloadPhoto = async () => {
    if (!capturedDataUrl) return;
    setShowSaveSheet(false);
    const res = await fetch(capturedDataUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hobanu-photo.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sharePhoto = async () => {
    if (!capturedDataUrl) return;
    setShowSaveSheet(false);
    const res = await fetch(capturedDataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'hobanu-photo.png', { type: 'image/png' });
    try {
      await navigator.share({ files: [file] });
    } catch {
      // 사용자 취소 시 무시
    }
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

      {showSaveSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowSaveSheet(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-[600px] rounded-t-2xl bg-white px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] animate-[slideUp_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#DDD]" />

            <button
              type="button"
              onClick={() => void downloadPhoto()}
              className="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left active:bg-[#F5F5F5]"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-[#EEEEEE]">
                <Download className="size-6 text-[#333]" />
              </div>
              <div>
                <p className="font-wanted-sans text-base font-semibold text-[#1D1D1D]">
                  기기에 저장
                </p>
                <p className="font-wanted-sans text-xs text-[#808080]">
                  iPhone Chrome에서는 공유하기를 이용해 주세요
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => void sharePhoto()}
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
      )}

      <div className="flex min-h-screen flex-col gap-7 bg-white px-5 py-7">
        <StepIndicator currentStep={tabStep} />

        {tabStep === 1 && (
          <div className="flex flex-col gap-7">
            <div className="flex flex-col items-center gap-2.5">
              <p className="font-wanted-sans text-2xl font-bold leading-none tracking-[-0.48px] text-black">
                포토부스
              </p>
              <p className="font-wanted-sans text-base font-normal leading-none tracking-[-0.32px] text-gray">
                원하는 항목을 선택 후 카메라 권한을 허용해주세요.
              </p>
            </div>

            <button
              type="button"
              className="flex h-67 w-full flex-col items-center justify-center gap-8 rounded-xl border border-dashed border-sub-red bg-[rgba(255,61,61,0.04)]"
            >
              <div className="flex size-20 items-center justify-center rounded-full bg-linear-to-br from-[#ffa855] to-sub-red">
                <Film className="size-9 text-white" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.36px] text-black">
                  인생두컷 찍기
                </p>
                <p className="whitespace-pre-line text-center font-wanted-sans text-sm font-normal leading-[1.4] tracking-[-0.28px] text-gray">
                  {'2가지 필터 중 하나를 선택하고\n4컷을 찍은 뒤 마음에 드는 2장을 골라보세요.'}
                </p>
              </div>
            </button>

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
                  호반우와 사진찍기
                </p>
                <p className="whitespace-pre-line text-center font-wanted-sans text-sm font-normal leading-[1.4] tracking-[-0.28px] text-gray">
                  {'호반우 프레임과 함께 촬영할 수 있어요.'}
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
              <button
                type="button"
                onClick={handleSaveButtonClick}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex size-20 items-center justify-center rounded-full bg-[#EEEEEE]">
                  <Download className="size-9 text-[#333]" />
                </div>
                <span className="font-wanted-sans text-sm font-medium text-[#808080]">
                  다운로드
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
