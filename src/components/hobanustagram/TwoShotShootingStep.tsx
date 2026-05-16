import type { RefObject } from 'react';
import { SwitchCamera, Timer, TimerOff, X } from 'lucide-react';

export interface TwoShotShootingStepProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  isReady: boolean;
  error: string | null;
  facingMode: 'user' | 'environment';
  flipCamera: () => void;
  slotAspect: number | null;
  viewportW: number;
  viewportH: number;
  showFlash: boolean;
  countdown: number | null;
  timerEnabled: boolean;
  shotNumber: number;
  onToggleTimer: () => void;
  onShutter: () => void;
  onClose: () => void;
}

export const TwoShotShootingStep = ({
  videoRef,
  isReady,
  error,
  facingMode,
  flipCamera,
  slotAspect,
  viewportW,
  viewportH,
  showFlash,
  countdown,
  timerEnabled,
  shotNumber,
  onToggleTimer,
  onShutter,
  onClose,
}: TwoShotShootingStepProps) => {
  const bottomBarH = 96;
  const containerW = Math.min(viewportW, 600);
  const videoAreaH = viewportH - bottomBarH;
  const zoneW = slotAspect ? Math.min(containerW, videoAreaH * slotAspect) : 0;
  const zoneH = slotAspect ? Math.min(videoAreaH, containerW / slotAspect) : 0;
  const zoneLeft = (containerW - zoneW) / 2;
  const topH = (videoAreaH - zoneH) / 2;

  return (
    <div className="fixed inset-0 z-[100] flex justify-center bg-black">
      <div className="relative h-full w-full max-w-[600px] bg-black">
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
              className="absolute flex"
              style={{ top: topH, height: zoneH, left: 0, width: containerW }}
            >
              <div className="bg-black/50" style={{ width: zoneLeft }} />
              <div className="flex-1 border-2 border-white/70" />
              <div className="bg-black/50" style={{ width: zoneLeft }} />
            </div>
            <div
              className="absolute inset-x-0 bg-black/50"
              style={{ top: topH + zoneH, bottom: 0 }}
            />
          </div>
        )}

        <div
          className={`pointer-events-none absolute inset-0 bg-white transition-opacity ${showFlash ? 'opacity-80 duration-0' : 'opacity-0 duration-300'}`}
        />

        {countdown !== null && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <style>{`@keyframes timer-drain { from { stroke-dashoffset: 0 } to { stroke-dashoffset: -157.08 } }`}</style>
            <div
              className="relative flex items-center justify-center"
              style={{ width: 160, height: 160 }}
            >
              <svg width="160" height="160" viewBox="0 0 100 100" className="absolute inset-0">
                <circle
                  cx="50"
                  cy="50"
                  r="25"
                  fill="none"
                  stroke="rgba(107,114,128,0.85)"
                  strokeWidth="50"
                  strokeDasharray="157.08"
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                  style={{ animation: 'timer-drain 5s linear forwards' }}
                />
              </svg>
              <span className="relative z-10 font-wanted-sans text-7xl font-bold text-white">
                {countdown}
              </span>
            </div>
          </div>
        )}

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

        <div className="absolute bottom-0 flex h-24 w-full items-center justify-between bg-white px-4 pb-[env(safe-area-inset-bottom)]">
          <div className="flex w-36 items-center gap-4">
            <div className="flex flex-col items-center justify-center">
              <span className="font-wanted-sans text-2xl font-bold leading-none">
                <span className="text-sub-red">{shotNumber}</span>
                <span className="text-black">/4</span>
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleTimer}
              disabled={countdown !== null}
              className="flex flex-col items-center gap-1 disabled:opacity-40"
            >
              {timerEnabled ? (
                <Timer className="size-9 text-sub-red" />
              ) : (
                <TimerOff className="size-9 text-gray" />
              )}
              <span
                className={`font-wanted-sans text-sm tracking-[-0.28px] ${timerEnabled ? 'text-sub-red' : 'text-gray'}`}
              >
                5초 타이머
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onShutter}
            disabled={!isReady || countdown !== null}
            className="size-16 rounded-full border-4 border-sub-red bg-white disabled:opacity-40"
          />

          <button
            type="button"
            onClick={flipCamera}
            disabled={countdown !== null}
            className="flex w-36 flex-col items-center gap-1 disabled:opacity-40"
          >
            <SwitchCamera className="size-9 text-gray" />
            <span className="font-wanted-sans text-sm tracking-[-0.28px] text-gray">
              카메라 전환
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
