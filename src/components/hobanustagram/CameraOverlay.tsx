import type React from 'react';
import { Aperture, ChevronDown, ImageDown, RotateCcw, SwitchCamera, X } from 'lucide-react';

import { CHARACTER_LIST } from '@/constants/hobanustagram';
import type { CharacterKey, OverlayStyle } from '@/types/hobanustagram';

export interface CameraOverlayProps {
  cameraState: 'shooting' | 'review';
  videoRef: React.RefObject<HTMLVideoElement | null>;
  overlayRef: React.RefObject<HTMLImageElement | null>;
  bottomBarRef: React.RefObject<HTMLDivElement | null>;
  facingMode: 'user' | 'environment';
  isReady: boolean;
  error: string | null;
  selectedCharacter: CharacterKey;
  selectedCharacterData: { src: string; overlayStyle: OverlayStyle };
  capturedDataUrl: string | null;
  showFrameSelector: boolean;
  onClose: () => void;
  onFlipCamera: () => void;
  onToggleFrameSelector: () => void;
  onShutter: () => void;
  onSelectCharacter: (key: CharacterKey) => void;
  onRetake: () => void;
  onUsePhoto: () => void;
}

export const CameraOverlay = ({
  cameraState,
  videoRef,
  overlayRef,
  bottomBarRef,
  facingMode,
  isReady,
  error,
  selectedCharacter,
  selectedCharacterData,
  capturedDataUrl,
  showFrameSelector,
  onClose,
  onFlipCamera,
  onToggleFrameSelector,
  onShutter,
  onSelectCharacter,
  onRetake,
  onUsePhoto,
}: CameraOverlayProps) => {
  return (
    <div className="fixed inset-0 z-100 bg-black">
      {cameraState === 'shooting' && (
        <>
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            style={facingMode === 'user' ? { transform: 'scaleX(-1)' } : undefined}
            playsInline
            muted
          />

          {error && (
            <div className="absolute inset-0 flex items-center justify-center px-8">
              <p className="text-center font-wanted-sans text-base text-white">{error}</p>
            </div>
          )}

          {isReady && (
            <img
              ref={overlayRef}
              src={selectedCharacterData.src}
              alt="캐릭터 오버레이"
              className="pointer-events-none absolute"
              style={{
                ...selectedCharacterData.overlayStyle,
                transform:
                  facingMode === 'user'
                    ? (selectedCharacterData.overlayStyle.mirrorTransform ??
                      `scaleX(-1)${selectedCharacterData.overlayStyle.transform ? ` ${selectedCharacterData.overlayStyle.transform}` : ''}`)
                    : selectedCharacterData.overlayStyle.transform,
              }}
              crossOrigin="anonymous"
            />
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full bg-black/30"
          >
            <X className="size-6 text-white" />
          </button>

          {showFrameSelector && (
            <div className="absolute bottom-24 w-full border-t border-border bg-white/80 px-19.75 py-5">
              <div className="flex justify-center gap-2">
                {CHARACTER_LIST.map((char) => (
                  <button
                    key={char.key}
                    type="button"
                    onClick={() => onSelectCharacter(char.key)}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className={`size-13 overflow-hidden rounded-2xl bg-white ${
                        selectedCharacter === char.key
                          ? 'border-2 border-sub-red'
                          : 'border border-gray-300'
                      }`}
                    >
                      <img
                        src={char.src}
                        alt={char.label}
                        className="size-full object-cover"
                        style={
                          char.overlayStyle.transform
                            ? {
                                transform: `${char.overlayStyle.transform} scale(1.0) translateY(10px)`,
                              }
                            : { transform: 'translateY(10px)' }
                        }
                      />
                    </div>
                    <span className="font-wanted-sans text-xs tracking-[-0.24px] text-gray">
                      {char.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            ref={bottomBarRef}
            className="absolute bottom-0 flex h-24 w-full items-center justify-between bg-white px-6"
          >
            <button
              type="button"
              onClick={onToggleFrameSelector}
              className="flex w-16 flex-col items-center gap-1"
            >
              {showFrameSelector ? (
                <ChevronDown className="size-9 text-gray" />
              ) : (
                <Aperture className="size-9 text-gray" />
              )}
              <span className="font-wanted-sans text-sm tracking-[-0.28px] text-gray">
                {showFrameSelector ? '닫기' : '필터'}
              </span>
            </button>

            <button
              type="button"
              onClick={onShutter}
              disabled={!isReady}
              className="size-16 rounded-full border-4 border-sub-red bg-white disabled:opacity-40"
            />

            <button
              type="button"
              onClick={onFlipCamera}
              className="flex w-16 flex-col items-center gap-1"
            >
              <SwitchCamera className="size-9 text-gray" />
              <span className="font-wanted-sans text-sm tracking-[-0.28px] text-gray">
                카메라 전환
              </span>
            </button>
          </div>
        </>
      )}

      {cameraState === 'review' && capturedDataUrl && (
        <>
          <div className="absolute inset-0 bottom-24">
            <img src={capturedDataUrl} alt="촬영된 사진" className="h-full w-full" />
          </div>

          <div className="absolute bottom-0 flex h-24 w-full items-center justify-between bg-white px-6">
            <button type="button" onClick={onRetake} className="flex flex-col items-center gap-1">
              <RotateCcw className="size-9 text-gray" />
              <span className="font-wanted-sans text-sm tracking-[-0.28px] text-gray">
                다시 찍기
              </span>
            </button>
            <button type="button" onClick={onUsePhoto} className="flex flex-col items-center gap-1">
              <ImageDown className="size-9 text-gray" />
              <span className="font-wanted-sans text-sm tracking-[-0.28px] text-gray">
                사진 사용
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
