import { X } from 'lucide-react';

import { TWO_SHOT_FRAME_URLS } from '@/constants/twoShot';

export interface TwoShotPreviewStepProps {
  onClose: () => void;
  onStart: () => void;
}

export const TwoShotPreviewStep = ({ onClose, onStart }: TwoShotPreviewStepProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex justify-center bg-[#eceef3]">
      <div className="relative flex h-full w-full max-w-[600px] flex-col bg-white">
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
                  src={TWO_SHOT_FRAME_URLS[filterId]}
                  alt={`프레임 ${filterId}`}
                  className="block w-full h-auto"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 px-5 pt-3 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <p className="mb-3 font-wanted-sans text-sm text-gray text-center">
            모바일 세로 촬영 기준으로 제작되었어요.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="flex h-[50px] w-full items-center justify-center rounded-lg bg-sub-red"
          >
            <span className="font-wanted-sans text-base font-medium text-white">촬영 시작</span>
          </button>
        </div>
      </div>
    </div>
  );
};
