import { ArrowRight } from 'lucide-react';

// TODO: 간편 문의하기 버튼 클릭 시 이동
export const ContactSection = () => {
  return (
    <div className="flex w-full flex-col gap-12 px-5">
      <div className="flex flex-col gap-2.5">
        <p className="font-wanted-sans text-base font-bold leading-none tracking-[-0.02em] text-black">
          Contact
        </p>
        <p className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.02em] text-black">
          문의하기
        </p>
        <p className="font-wanted-sans text-base font-medium leading-[1.4] tracking-[-0.02em] text-gray">
          축제 운영팀에 언제든 연락하세요
        </p>
      </div>

      <div className="flex flex-col gap-5 bg-[#efefef] p-5">
        <div className="flex flex-col gap-3">
          <p className="font-wanted-sans text-base font-bold leading-none tracking-[-0.02em] text-black">
            이메일
          </p>
          <p className="font-wanted-sans text-base font-normal leading-none tracking-[-0.02em] text-[#4d4d4d]">
            likelion_knu@knu.ac.kr
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="font-wanted-sans text-base font-bold leading-none tracking-[-0.02em] text-black">
            전화
          </p>
          <p className="font-wanted-sans text-base font-medium leading-none tracking-[-0.02em] text-[#4d4d4d]">
            02-1234-5678
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="font-wanted-sans text-base font-bold leading-none tracking-[-0.02em] text-black">
            위치
          </p>
          <p className="font-wanted-sans text-base font-medium leading-none tracking-[-0.02em] text-[#4d4d4d]">
            경북대학교 본관
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.02em] text-black">
          궁금한 점 간편하게 문의하기
        </p>
        <button
          type="button"
          className="flex w-fit items-center gap-1.5 rounded-full border border-ink py-2.5 pl-5 pr-3.5"
        >
          <span className="font-wanted-sans text-sm font-medium leading-none tracking-[-0.02em] text-ink">
            간편 문의하기
          </span>
          <ArrowRight className="size-6 text-ink" />
        </button>
      </div>
    </div>
  );
};
