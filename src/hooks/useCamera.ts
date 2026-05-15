import { useCallback, useEffect, useRef, useState } from 'react';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tokenRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsReady(false);
  }, []);

  const startCamera = useCallback(
    async (mode: 'user' | 'environment' = facingMode) => {
      const token = ++tokenRef.current;
      stopCamera();
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 3840 },
            height: { ideal: 2160 },
          },
        });
        if (token !== tokenRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.oncanplay = () => setIsReady(true);
          await videoRef.current.play();
        }
      } catch {
        if (token !== tokenRef.current) return;
        setError('카메라 접근 권한이 필요해요. 브라우저 설정에서 허용해주세요.');
      }
    },
    [facingMode, stopCamera],
  );

  const flipCamera = useCallback(() => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    startCamera(next);
  }, [facingMode, startCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return { videoRef, isReady, error, facingMode, startCamera, stopCamera, flipCamera };
};
