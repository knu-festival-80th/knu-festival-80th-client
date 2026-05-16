import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { SwitchCamera, X } from 'lucide-react';

import { useCamera } from '@/hooks/useCamera';
import { compositeTwoShot } from '@/lib/compositeTwoShot';
import { captureVideoFrame } from '@/lib/captureVideoFrame';
import type { TwoShotStep } from '@/types/hobanustagram';
import frame1Url from '@/assets/hobanustagram/twoframephoto_frame1.png?url';
import frame2Url from '@/assets/hobanustagram/twoframephoto_frame2.png?url';
import preview1Url from '@/assets/hobanustagram/twoframephoto_preview1.svg?url';
import preview2Url from '@/assets/hobanustagram/twoframephoto_preview2.svg?url';
import isMakingUrl from '@/assets/hobanustagram/hobanu_ismaking.svg?url';

export interface TwoShotOverlayProps {
  onClose: () => void;
  onComplete: (compositedUrl: string) => void;
}

const FRAME_URLS: Record<1 | 2, string> = { 1: frame1Url, 2: frame2Url };
const PREVIEW_URLS: Record<1 | 2, string> = { 1: preview1Url, 2: preview2Url };

const PHOTO_SLOTS: Record<1 | 2, [CSSProperties, CSSProperties]> = {
  1: [
    { left: '9.1%', top: '8.4%', width: '81.6%', height: '35.6%' },
    { left: '9.5%', top: '46.1%', width: '81.8%', height: '35.2%' },
  ],
  2: [
    { left: '9.1%', top: '8.4%', width: '81.6%', height: '35.6%' },
    { left: '9.5%', top: '46.1%', width: '81.8%', height: '35.2%' },
  ],
};

export const TwoShotOverlay = ({ onClose, onComplete }: TwoShotOverlayProps) => {
  const [step, setStep] = useState<TwoShotStep>('preview');
  const [selectedFilter, setSelectedFilter] = useState<1 | 2>(1);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [slotAspect, setSlotAspect] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  const { videoRef, isReady, error, facingMode, startCamera, stopCamera, flipCamera } = useCamera();

  useEffect(() => {
    if (step === 'shooting') {
      void startCamera();
      const img = new Image();
      img.onload = () => {
        setSlotAspect((0.816 * img.naturalWidth) / (0.356 * img.naturalHeight));
      };
      img.src = frame1Url;
      return () => stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleShutter = () => {
    if (!videoRef.current || !isReady || slotAspect === null) return;
    const dataUrl = captureVideoFrame(videoRef.current, facingMode === 'user', slotAspect);
    if (!dataUrl) return;
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);
    const newPhotos = [...capturedPhotos, dataUrl];
    setCapturedPhotos(newPhotos);
    if (newPhotos.length >= 4) {
      setSelectedIndices([0, 1]);
      setStep('select-photos');
    }
  };

  const handleToggleSelection = (index: number) => {
    setSelectedIndices((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      if (prev.length >= 2) return [prev[1], index];
      return [...prev, index];
    });
  };

  const handleComplete = async () => {
    if (selectedIndices.length !== 2) return;
    setStep('compositing');
    const [composited] = await Promise.all([
      compositeTwoShot(
        [capturedPhotos[selectedIndices[0]], capturedPhotos[selectedIndices[1]]],
        selectedFilter,
      ),
      new Promise<void>((resolve) => setTimeout(resolve, 4000)),
    ]);
    onComplete(composited);
  };

  if (step === 'preview') {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-white">
        <div className="shrink-0 flex justify-end px-5 pt-5 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center"
          >
            <X className="size-6 text-black" />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col justify-center px-5 overflow-hidden">
          <div className="shrink-0 mb-4">
            <p className="font-wanted-sans text-xl font-bold tracking-[-0.4px] text-black">
              인생두컷 프레임 미리보기
            </p>
            <p className="mt-2 font-wanted-sans text-sm text-gray">
              아래 프레임은 예시예요.
              <br />
              4장을 찍은 뒤 2장을 고르고, 마지막에 원하는 프레임을 선택해요.
            </p>
          </div>

          <div className="shrink-0 flex gap-3">
            {([1, 2] as const).map((filterId) => (
              <div key={filterId} className="relative flex-1 min-w-0 overflow-hidden rounded-2xl">
                <div className="absolute top-2 left-2 z-10 rounded bg-black/60 px-1.5 py-0.5">
                  <span className="font-wanted-sans text-xs text-white">미리보기</span>
                </div>
                <img
                  src={FRAME_URLS[filterId]}
                  alt={`프레임 ${filterId}`}
                  className="block w-full h-auto"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 px-5 pt-3 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <p className="mb-3 font-wanted-sans text-sm text-gray text-center">촬영 후 선택 가능</p>
          <button
            type="button"
            onClick={() => setStep('shooting')}
            className="flex h-[50px] w-full items-center justify-center rounded-lg bg-sub-red"
          >
            <span className="font-wanted-sans text-base font-medium text-white">촬영 시작</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'shooting') {
    const shotNumber = Math.min(capturedPhotos.length + 1, 4);
    const bottomBarH = 96;
    const videoAreaH = window.innerHeight - bottomBarH;
    const zoneH = slotAspect ? Math.min(window.innerWidth / slotAspect, videoAreaH) : 0;
    const topH = (videoAreaH - zoneH) / 2;

    return (
      <div className="fixed inset-0 z-[100] bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          style={facingMode === 'user' ? { transform: 'scaleX(-1)' } : undefined}
          playsInline
          muted
        />

        {slotAspect && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 top-0 bg-black/50" style={{ height: topH }} />
            <div
              className="absolute inset-x-0 border-2 border-white/70"
              style={{ top: topH, height: zoneH }}
            />
            <div
              className="absolute inset-x-0 bg-black/50"
              style={{ top: topH + zoneH, height: videoAreaH - topH - zoneH }}
            />
          </div>
        )}

        <div
          className={`pointer-events-none absolute inset-0 bg-white transition-opacity ${showFlash ? 'opacity-80 duration-0' : 'opacity-0 duration-300'}`}
        />

        {error && (
          <div className="absolute inset-0 flex items-center justify-center px-8">
            <p className="text-center font-wanted-sans text-base text-white">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full bg-black/30"
        >
          <X className="size-6 text-white" />
        </button>

        <div className="absolute bottom-0 flex h-24 w-full items-center justify-between bg-white px-6 pb-[env(safe-area-inset-bottom)]">
          <div className="flex w-16 flex-col items-center justify-center">
            <span className="font-wanted-sans text-2xl font-bold leading-none">
              <span className="text-sub-red">{shotNumber}</span>
              <span className="text-black">/4</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleShutter}
            disabled={!isReady}
            className="size-16 rounded-full border-4 border-sub-red bg-white disabled:opacity-40"
          />

          <button
            type="button"
            onClick={flipCamera}
            className="flex w-16 flex-col items-center gap-1"
          >
            <SwitchCamera className="size-9 text-gray" />
            <span className="font-wanted-sans text-sm tracking-[-0.28px] text-gray">
              카메라 전환
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'select-photos') {
    const slots = PHOTO_SLOTS[selectedFilter];

    return (
      <div className="fixed inset-0 z-[39] flex flex-col bg-white">
        <div className="shrink-0 h-[100px]" />
        <div className="shrink-0 px-5 pt-7 pb-5 text-center">
          <p className="font-wanted-sans text-xl font-bold tracking-[-0.4px] text-[#1a1a1a]">
            원하는 사진을 선택해주세요
          </p>
        </div>

        <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden px-5">
          <div className="relative inline-block">
            {slots.map((slot, i) => {
              const photoUrl =
                selectedIndices[i] !== undefined ? capturedPhotos[selectedIndices[i]] : undefined;
              return (
                <div key={i} className="absolute overflow-hidden" style={slot}>
                  {photoUrl && (
                    <img
                      src={photoUrl}
                      alt={`선택된 사진 ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              );
            })}
            <img
              src={FRAME_URLS[selectedFilter]}
              alt="프레임"
              className="relative z-10 block w-auto pointer-events-none"
              style={{ maxHeight: '45vh' }}
            />
          </div>
        </div>

        <div className="shrink-0 flex gap-2 px-5 pt-3">
          {capturedPhotos.map((photo, index) => {
            const isSelected = selectedIndices.includes(index);
            const selectionOrder = selectedIndices.indexOf(index);
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleToggleSelection(index)}
                className="relative flex-1 overflow-hidden rounded-lg"
                style={{ aspectRatio: '3 / 4' }}
              >
                <img src={photo} alt={`사진 ${index + 1}`} className="h-full w-full object-cover" />
                {!isSelected && <div className="absolute inset-0 bg-black/40" />}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-sub-red">
                    <span className="font-wanted-sans text-xs font-bold text-white">
                      {selectionOrder + 1}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="shrink-0 px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setStep('select-frame')}
            disabled={selectedIndices.length !== 2}
            className="flex h-[50px] w-full items-center justify-center rounded-lg bg-sub-red disabled:opacity-40"
          >
            <span className="font-wanted-sans text-base font-medium text-white">다음</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'select-frame') {
    const slots = PHOTO_SLOTS[selectedFilter];

    return (
      <div className="fixed inset-0 z-[39] flex flex-col bg-white">
        <div className="shrink-0 h-[100px]" />
        <div className="shrink-0 px-5 pt-7 pb-5 text-center">
          <p className="font-wanted-sans text-xl font-bold tracking-[-0.4px] text-[#1a1a1a]">
            원하는 프레임을 선택해주세요
          </p>
        </div>

        <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden px-5">
          <div className="relative inline-block">
            {slots.map((slot, i) => {
              const photoUrl =
                selectedIndices[i] !== undefined ? capturedPhotos[selectedIndices[i]] : undefined;
              return (
                <div key={i} className="absolute overflow-hidden" style={slot}>
                  {photoUrl && (
                    <img
                      src={photoUrl}
                      alt={`선택된 사진 ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              );
            })}
            <img
              src={FRAME_URLS[selectedFilter]}
              alt="프레임"
              className="relative z-10 block w-auto pointer-events-none"
              style={{ maxHeight: '50vh' }}
            />
          </div>
        </div>

        <div className="shrink-0 flex justify-center gap-3 px-5 pt-3">
          {([1, 2] as const).map((filterId) => (
            <button
              key={filterId}
              type="button"
              onClick={() => setSelectedFilter(filterId)}
              className={`size-13 overflow-hidden rounded-2xl bg-white transition-colors ${
                selectedFilter === filterId ? 'border-2 border-sub-red' : 'border border-gray-300'
              }`}
            >
              <img
                src={PREVIEW_URLS[filterId]}
                alt={`프레임 ${filterId}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>

        <div className="shrink-0 px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => void handleComplete()}
            className="flex h-[50px] w-full items-center justify-center rounded-lg bg-sub-red"
          >
            <span className="font-wanted-sans text-base font-medium text-white">완성하기</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'compositing') {
    return (
      <div className="fixed inset-0 z-[39] flex flex-col bg-white">
        <div className="shrink-0 h-[100px]" />
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <img src={isMakingUrl} alt="제작 중" className="w-40 h-40 object-contain" />
          <p className="font-wanted-sans text-lg font-bold tracking-[-0.36px] text-[#1a1a1a]">
            열심히 제작중이에요!
          </p>
        </div>
      </div>
    );
  }

  return null;
};
