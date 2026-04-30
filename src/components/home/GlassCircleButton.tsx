import type { ReactNode } from 'react';

type GlassCircleButtonProps = {
  icon: ReactNode;
  onClick?: () => void;
};

export default function GlassCircleButton({ icon, onClick }: GlassCircleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-12 items-center justify-center rounded-full border border-white/50 bg-white/30"
    >
      {icon}
    </button>
  );
}
