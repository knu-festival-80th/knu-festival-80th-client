import { LuMenu } from 'react-icons/lu';

export const Header = () => {
  return (
    <header className="flex h-16 w-full items-center justify-between px-5">
      <img
        src="/figma-assets/knu80th_logo.png"
        alt="KNU 80주년 대동제"
        className="h-4.5 w-47.5 object-contain"
      />
      <button type="button" className="text-text">
        <LuMenu size={24} />
      </button>
    </header>
  );
};
