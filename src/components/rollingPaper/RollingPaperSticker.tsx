import type { CSSProperties, ReactNode } from 'react';
import paper1 from '@/assets/rollingPaper/paper1.svg';
import paper2 from '@/assets/rollingPaper/paper2.svg';
import paper3 from '@/assets/rollingPaper/paper3.svg';
import paper4 from '@/assets/rollingPaper/paper4.svg';
import paper5 from '@/assets/rollingPaper/paper5.svg';
import paper6 from '@/assets/rollingPaper/paper6.svg';
import {
  ROLLING_PAPER_STICKER_COLORS,
  type RollingPaperStickerColorId,
} from '@/constants/rollingPaper';

type RollingPaperStickerProps = {
  colorId: RollingPaperStickerColorId;
  message: string;
  children?: ReactNode;
  className?: string;
  hideText?: boolean;
  style?: CSSProperties;
};

const rollingPaperAssets: Record<
  RollingPaperStickerColorId,
  { src: string; textBoxClassName: string }
> = {
  red: {
    src: paper1,
    textBoxClassName: 'left-1/2 top-[53%] h-[34%] w-[52%] -translate-x-1/2 -translate-y-1/2',
  },
  yellow: {
    src: paper2,
    textBoxClassName: 'left-1/2 top-1/2 h-[43%] w-[52%] -translate-x-1/2 -translate-y-1/2',
  },
  green: {
    src: paper3,
    textBoxClassName: 'left-1/2 top-[34%] h-[24%] w-[58%] -translate-x-1/2 -translate-y-1/2',
  },
  blue: {
    src: paper4,
    textBoxClassName: 'left-1/2 top-[53%] h-[38%] w-[70%] -translate-x-1/2 -translate-y-1/2',
  },
  purple: {
    src: paper5,
    textBoxClassName: 'left-1/2 top-1/2 h-[42%] w-[54%] -translate-x-1/2 -translate-y-1/2',
  },
  pink: {
    src: paper6,
    textBoxClassName: 'left-1/2 top-1/2 h-[34%] w-[43%] -translate-x-1/2 -translate-y-1/2',
  },
};

function getRollingPaperStickerColor(colorId: RollingPaperStickerColorId) {
  return (
    ROLLING_PAPER_STICKER_COLORS.find((color) => color.id === colorId) ??
    ROLLING_PAPER_STICKER_COLORS[0]
  );
}

export default function RollingPaperSticker({
  colorId,
  message,
  children,
  className = '',
  hideText = false,
  style,
}: RollingPaperStickerProps) {
  const color = getRollingPaperStickerColor(colorId);
  const paper = rollingPaperAssets[color.id];

  return (
    <div className={`relative [container-type:inline-size] ${className}`} style={style}>
      <img src={paper.src} alt="" aria-hidden="true" className="block h-auto w-full select-none" />

      {!hideText && (
        <div
          className={`absolute z-10 flex items-center justify-center text-center font-wanted-sans text-[clamp(6px,5cqw,12px)] font-medium leading-[1.6] tracking-[-0.03em] text-black ${paper.textBoxClassName}`}
        >
          {children ?? <p className="whitespace-pre-wrap">{message}</p>}
        </div>
      )}
    </div>
  );
}
