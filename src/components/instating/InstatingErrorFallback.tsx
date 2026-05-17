import hobanwooFallback from '@/assets/instating/Hobanwoo/hobanwoo_fallback.webp';

const InstatingErrorFallback = () => (
  <div className="flex min-h-[calc(100dvh-6.75rem)] flex-col items-center justify-center gap-[30px] px-5 pb-[30px]">
    <div className="flex flex-col items-center gap-5">
      <img src={hobanwooFallback} alt="" className="w-[282px]" />
      <p className="text-center font-wanted-sans text-[18px] font-semibold leading-[1.4] tracking-[-0.36px] text-black">
        네트워크 연결 상태를 확인 후
        <br />
        다시 시도해 주세요
      </p>
    </div>
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="h-[50px] w-full max-w-[163px] rounded-[8px] bg-[#FF3D3D] font-wanted-sans text-[16px] font-medium leading-none tracking-[-0.32px] text-white"
    >
      페이지 새로 고침
    </button>
  </div>
);

export default InstatingErrorFallback;
