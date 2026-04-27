import { Link } from 'react-router-dom';

// TODO: 페이지 확정 후 각 경로 연결
const NAV_LINKS = [
  { label: '지도 정보', to: '/' },
  { label: '롤링페이퍼', to: '/' },
  { label: '인스타팅', to: '/' },
  { label: '포토부스', to: '/' },
  { label: '공지사항', to: '/' },
] as const;

// TODO: 페이지 확정 후 각 경로 연결
const FOOTER_LINKS = [
  { label: '개인정보 보호', to: '/' },
  { label: '서비스 이용 약관', to: '/' },
  { label: '쿠키 설정', to: '/' },
] as const;

export const Footer = () => {
  return (
    <footer className="flex w-full max-w-[80rem] flex-col items-start gap-12 bg-[#1A1A1A] px-5 pt-16 pb-31">
      <img
        src="/figma-assets/knu80th_logo_white.png"
        alt="KNU 80주년 대동제"
        className="h-4.5 w-47.5 object-contain"
      />
      <nav className="flex w-full flex-col gap-5">
        {NAV_LINKS.map(({ label, to }) => (
          <Link
            key={label}
            to={to}
            className="font-wanted-sans text-body1 font-bold leading-[150%] text-white"
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          {FOOTER_LINKS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="font-wanted-sans text-body2 font-normal leading-none text-white underline"
            >
              {label}
            </Link>
          ))}
        </div>
        <p className="font-wanted-sans text-body2 font-normal leading-none text-white">
          © 2026 경북대학교 대동제. copyright
        </p>
        <div className="flex items-center gap-2">
          <span className="font-wanted-sans text-body2 font-normal leading-none text-white">
            멋쟁이 사자처럼 X 경북대학교 디자인학과
          </span>
          <img
            src="/figma-assets/designdepartment_logo.svg"
            alt="경북대학교 디자인학과 로고"
            className="h-5 w-5"
          />
        </div>
      </div>
    </footer>
  );
};
