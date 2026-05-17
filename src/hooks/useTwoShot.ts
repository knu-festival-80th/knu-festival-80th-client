import { useEffect, useRef, useState } from 'react';

import { useCamera } from '@/hooks/useCamera';
import { captureVideoFrame } from '@/lib/captureVideoFrame';
import { compositeTwoShot } from '@/lib/compositeTwoShot';
import type { TwoShotStep } from '@/types/hobanustagram';
import { TWO_SHOT_FRAME_URLS } from '@/constants/twoShot';

const COMPOSITE_ERROR_MESSAGE = '인생두컷을 제작하지 못했어요. 다시 시도해 주세요.';

function waitForImageReady(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (!img.decode) {
        resolve();
        return;
      }

      img
        .decode()
        .catch(() => {})
        .finally(resolve);
    };
    img.onerror = () => resolve();
    img.src = src;
  });
}

export const useTwoShot = (onComplete: (compositedUrl: string) => void) => {
  const [step, setStep] = useState<TwoShotStep>('preview');
  const [selectedFilter, setSelectedFilter] = useState<1 | 2>(1);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [slotAspect, setSlotAspect] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [compositeError, setCompositeError] = useState<string | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { videoRef, isReady, error, facingMode, startCamera, stopCamera, flipCamera } = useCamera();

  const [viewportW, setViewportW] = useState(window.innerWidth);
  const [viewportH, setViewportH] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setViewportW(window.innerWidth);
      setViewportH(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (step === 'shooting') {
      void startCamera();
      const img = new Image();
      img.onload = () => {
        setSlotAspect((0.816 * img.naturalWidth) / (0.356 * img.naturalHeight));
      };
      img.src = TWO_SHOT_FRAME_URLS[1];
      return () => stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const executeCapture = () => {
    if (!videoRef.current || !isReady || slotAspect === null) return;

    const containerW = Math.min(viewportW, 600);
    const containerH = viewportH;
    const videoAreaH = containerH - 96;

    const zoneW = Math.min(containerW, videoAreaH * slotAspect);
    const zoneH = Math.min(videoAreaH, containerW / slotAspect);
    const zoneLeft = (containerW - zoneW) / 2;
    const zoneTop = (videoAreaH - zoneH) / 2;

    const vw = videoRef.current.videoWidth;
    const vh = videoRef.current.videoHeight;

    const s = Math.max(containerW / vw, containerH / vh);
    const offsetX = (containerW - vw * s) / 2;
    const offsetY = (containerH - vh * s) / 2;

    const sx = Math.max(0, (zoneLeft - offsetX) / s);
    const sy = Math.max(0, (zoneTop - offsetY) / s);
    const sw = Math.min(vw - sx, zoneW / s);
    const sh = Math.min(vh - sy, zoneH / s);

    const dataUrl = captureVideoFrame(videoRef.current, facingMode === 'user', { sx, sy, sw, sh });
    if (!dataUrl) return;
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);
    setCapturedPhotos((prev) => {
      const newPhotos = [...prev, dataUrl];
      if (newPhotos.length >= 4) {
        setSelectedIndices([0, 1]);
        setStep('select-photos');
      }
      return newPhotos;
    });
  };

  const handleShutter = () => {
    if (!videoRef.current || !isReady || slotAspect === null || countdown !== null) return;

    if (timerEnabled) {
      setCountdown(5);
      let remaining = 5;
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          setCountdown(null);
          executeCapture();
        } else {
          setCountdown(remaining);
        }
      }, 1000);
    } else {
      executeCapture();
    }
  };

  const handleToggleSelection = (index: number) => {
    setCompositeError(null);
    setSelectedIndices((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      if (prev.length >= 2) return [prev[1], index];
      return [...prev, index];
    });
  };

  const handleSelectFilter = (filter: 1 | 2) => {
    setCompositeError(null);
    setSelectedFilter(filter);
  };

  const handleComplete = async () => {
    if (selectedIndices.length !== 2) return;
    setCompositeError(null);
    setStep('compositing');

    try {
      const firstPhoto = capturedPhotos[selectedIndices[0]];
      const secondPhoto = capturedPhotos[selectedIndices[1]];

      if (!firstPhoto || !secondPhoto) {
        throw new Error('Selected photos are missing.');
      }

      const composited = await compositeTwoShot([firstPhoto, secondPhoto], selectedFilter);
      await waitForImageReady(composited);
      onComplete(composited);
    } catch {
      setCompositeError(COMPOSITE_ERROR_MESSAGE);
      setStep('select-frame');
    }
  };

  return {
    step,
    setStep,
    selectedFilter,
    capturedPhotos,
    selectedIndices,
    slotAspect,
    showFlash,
    timerEnabled,
    setTimerEnabled,
    countdown,
    compositeError,
    videoRef,
    isReady,
    error,
    facingMode,
    flipCamera,
    viewportW,
    viewportH,
    handleShutter,
    handleToggleSelection,
    handleSelectFilter,
    handleComplete,
  };
};
