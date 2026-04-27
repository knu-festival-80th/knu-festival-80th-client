import { LuMenu } from 'react-icons/lu';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between bg-background px-5 shadow-sm">
      <img
        src="/figma-assets/knu80th_logo_dark.png"
        alt="KNU 80주년 대동제"
        className="h-4.5 w-47.5 object-contain"
      />
      <button type="button" className="text-text">
        <LuMenu size={24} />
      </button>
    </header>
  );
};
