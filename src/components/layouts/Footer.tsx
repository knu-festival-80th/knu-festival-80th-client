import { Link } from 'react-router-dom';
import { FOOTER_LINKS, NAV_LINKS } from '@/constants/footer';
import knu80thLogo from '@/assets/logo/knu80th_logo_white.png';
import designLogo from '@/assets/logo/designdepartment_logo.svg';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#1A1A1A]">
      <div className="mx-auto flex max-w-[600px] flex-col items-start gap-12 px-5 pt-16 pb-31">
        <img src={knu80thLogo} alt="KNU 80주년 대동제" className="h-4.5 w-47.5 object-contain" />
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
            <img src={designLogo} alt="경북대학교 디자인학과 로고" className="h-5 w-5" />
          </div>
        </div>
      </div>
    </footer>
  );
};
