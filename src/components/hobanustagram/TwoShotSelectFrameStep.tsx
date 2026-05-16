import {
  TWO_SHOT_FRAME_URLS,
  TWO_SHOT_PHOTO_SLOTS,
  TWO_SHOT_PREVIEW_URLS,
} from '@/constants/twoShot';

export interface TwoShotSelectFrameStepProps {
  capturedPhotos: string[];
  selectedIndices: number[];
  selectedFilter: 1 | 2;
  onSelectFilter: (filter: 1 | 2) => void;
  onComplete: () => void;
}

export const TwoShotSelectFrameStep = ({
  capturedPhotos,
  selectedIndices,
  selectedFilter,
  onSelectFilter,
  onComplete,
}: TwoShotSelectFrameStepProps) => {
  const slots = TWO_SHOT_PHOTO_SLOTS[selectedFilter];

  return (
    <div className="fixed inset-0 z-[39] flex justify-center bg-[#eceef3]">
      <div className="relative flex h-full w-full max-w-[600px] flex-col bg-white">
        <div className="shrink-0" style={{ height: 'min(100px, 12vh)' }} />
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
              src={TWO_SHOT_FRAME_URLS[selectedFilter]}
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
              onClick={() => onSelectFilter(filterId)}
              className={`size-13 overflow-hidden rounded-2xl bg-white transition-colors ${
                selectedFilter === filterId ? 'border-2 border-sub-red' : 'border border-gray-300'
              }`}
            >
              <img
                src={TWO_SHOT_PREVIEW_URLS[filterId]}
                alt={`프레임 ${filterId}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>

        <div className="shrink-0 px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onComplete}
            className="flex h-[50px] w-full items-center justify-center rounded-lg bg-sub-red"
          >
            <span className="font-wanted-sans text-base font-medium text-white">완성하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
