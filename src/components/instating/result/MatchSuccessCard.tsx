import { Check, Copy } from 'lucide-react';
import happyHobanwoo from '@/assets/instating/Hobanwoo/happyHobanwoo.webp';

interface MatchSuccessCardProps {
  instagramId: string;
  copied: boolean;
  onCopy: () => void;
}

const MatchSuccessCard = ({ instagramId, copied, onCopy }: MatchSuccessCardProps) => (
  <div
    className="relative w-[325px] shrink-0 overflow-hidden rounded-[12px] bg-white"
    style={{
      height: 430,
      border: '1px solid #ffe0e5',
      boxShadow: '0px 4px 30px 0px rgba(255,103,126,0.12)',
    }}
  >
    <div className="absolute text-center" style={{ left: 106, top: 19 }}>
      <p className="mb-[6px] font-wanted-sans text-[16px] font-bold leading-[1.4] text-[#ff5c7d]">
        💌
      </p>
      <p className="font-wanted-sans text-[16px] font-bold leading-[1.4] tracking-[-0.32px] text-[#ff5c7d]">
        나의 매칭 상대는...
      </p>
    </div>

    <div
      className="absolute overflow-hidden"
      style={{ left: 63, top: 78, width: 201, height: 190 }}
    >
      <img src={happyHobanwoo} alt="" className="h-full w-full object-contain" />
    </div>

    <div
      className="absolute flex items-center justify-between rounded-[8px] bg-white px-[16px] py-[12px]"
      style={{
        left: 33,
        top: 285,
        width: 259,
        border: '1px solid #ffe0e5',
        boxShadow: '0px 4px 5px rgba(255,103,126,0.12)',
      }}
    >
      <p className="font-wanted-sans text-[16px] font-medium tracking-[-0.32px] text-black">
        @{instagramId}
      </p>
      <button type="button" onClick={onCopy} aria-label="아이디 복사" className="shrink-0">
        {copied ? <Check className="size-6" /> : <Copy className="size-6 text-[#FF5C7D]" />}
      </button>
    </div>

    <a
      href={`https://www.instagram.com/${instagramId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute flex items-center justify-center rounded-[8px] bg-[#ff5c7d]"
      style={{ left: 19, top: 360, width: 287, height: 50 }}
    >
      <span className="font-wanted-sans text-[16px] font-medium leading-none tracking-[-0.32px] text-white">
        인스타 프로필 바로가기
      </span>
    </a>
  </div>
);

export default MatchSuccessCard;
