import error404Img from '@/assets/error/error-404.webp';
import errorNetworkImg from '@/assets/error/error-network.webp';
import errorServiceImg from '@/assets/error/error-service.webp';

type ErrorFallbackProps = {
  type: 'service' | 'network' | 'notFound';
  onRetry?: () => void;
};

const CONFIG = {
  service: {
    imageSrc: errorServiceImg,
    message: '서비스 점검 중이에요',
  },
  network: {
    imageSrc: errorNetworkImg,
    message: '네트워크 연결 상태를 확인 후\n다시 시도해 주세요',
  },
  notFound: {
    imageSrc: error404Img,
    message: '페이지를 찾을 수 없어요',
  },
};

export default function ErrorFallback({ type, onRetry }: ErrorFallbackProps) {
  const { imageSrc, message } = CONFIG[type];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-[30px] px-5 pb-[30px]">
      <img src={imageSrc} alt="" className="w-[282px]" />
      <p className="font-wanted-sans text-body1 font-semibold text-text text-center whitespace-pre-line">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="h-[50px] rounded-md bg-primary px-[30px] text-body1 font-medium text-white"
        >
          페이지 새로 고침
        </button>
      )}
    </div>
  );
}
