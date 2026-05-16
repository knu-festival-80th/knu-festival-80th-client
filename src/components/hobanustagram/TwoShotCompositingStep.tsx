import isMakingUrl from '@/assets/hobanustagram/hobanu_ismaking.svg?url';

export const TwoShotCompositingStep = () => {
  return (
    <div className="fixed inset-0 z-[39] flex justify-center bg-[#eceef3]">
      <div className="relative flex h-full w-full max-w-[600px] flex-col bg-white">
        <div className="shrink-0 h-[100px]" />
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <img src={isMakingUrl} alt="제작 중" className="w-40 h-40 object-contain" />
          <p className="font-wanted-sans text-lg font-bold tracking-[-0.36px] text-[#1a1a1a]">
            열심히 제작중이에요!
          </p>
        </div>
      </div>
    </div>
  );
};
