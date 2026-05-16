import { TWO_SHOT_FRAME_URLS, TWO_SHOT_PHOTO_SLOTS } from '@/constants/twoShot';

export interface TwoShotSelectPhotosStepProps {
  capturedPhotos: string[];
  selectedIndices: number[];
  selectedFilter: 1 | 2;
  onToggleSelection: (index: number) => void;
  onNext: () => void;
}

export const TwoShotSelectPhotosStep = ({
  capturedPhotos,
  selectedIndices,
  selectedFilter,
  onToggleSelection,
  onNext,
}: TwoShotSelectPhotosStepProps) => {
  const slots = TWO_SHOT_PHOTO_SLOTS[selectedFilter];

  return (
    <div className="fixed inset-0 z-[39] flex justify-center bg-[#eceef3]">
      <div className="relative flex h-full w-full max-w-[600px] flex-col bg-white">
        <div className="shrink-0" style={{ height: 'min(100px, 12vh)' }} />
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
              src={TWO_SHOT_FRAME_URLS[selectedFilter]}
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
                onClick={() => onToggleSelection(index)}
                className="relative flex-1 overflow-hidden rounded-lg"
                style={{ aspectRatio: '3 / 4', maxHeight: 'min(140px, 20vh)' }}
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
            onClick={onNext}
            disabled={selectedIndices.length !== 2}
            className="flex h-[50px] w-full items-center justify-center rounded-lg bg-sub-red disabled:opacity-40"
          >
            <span className="font-wanted-sans text-base font-medium text-white">다음</span>
          </button>
        </div>
      </div>
    </div>
  );
};
