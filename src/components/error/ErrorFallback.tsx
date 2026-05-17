import error404Img from '@/assets/error/error-404.webp';
import errorNetworkImg from '@/assets/error/error-network.webp?inline';
import errorServiceImg from '@/assets/error/error-service.webp';

type ErrorFallbackProps = {
  type: 'service' | 'network' | 'notFound';
  onRetry?: () => void;
  className?: string;
};

const CONFIG = {
  service: {
    imageSrc: errorServiceImg,
    imageClassName: '',
    message: '서비스 점검 중이에요',
  },
  network: {
    imageSrc: errorNetworkImg,
    imageClassName: '-translate-x-8',
    message: '네트워크 연결 상태를 확인 후\n다시 시도해 주세요',
  },
  notFound: {
    imageSrc: error404Img,
    imageClassName: '',
    message: '페이지를 찾을 수 없어요',
  },
};

export default function ErrorFallback({ type, onRetry, className }: ErrorFallbackProps) {
  const { imageSrc, imageClassName, message } = CONFIG[type];

  return (
    <div
      className={`flex flex-col items-center justify-center gap-6.25 bg-background pb-7.5 ${className ?? 'min-h-[calc(100dvh-4rem)]'}`}
    >
      <img src={imageSrc} alt="" className={`h-52.75 w-70.5 object-contain ${imageClassName}`} />
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
