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
import {
  getRollingPaperStickerTextBoxStyle,
  getRollingPaperStickerTextStyle,
} from './rollingPaperStickerText';

type RollingPaperStickerProps = {
  colorId: RollingPaperStickerColorId;
  message: string;
  children?: ReactNode;
  className?: string;
  hideText?: boolean;
  placeholder?: string;
  style?: CSSProperties;
};

const rollingPaperAssets: Record<RollingPaperStickerColorId, { src: string }> = {
  red: {
    src: paper1,
  },
  yellow: {
    src: paper2,
  },
  green: {
    src: paper3,
  },
  blue: {
    src: paper4,
  },
  purple: {
    src: paper5,
  },
  pink: {
    src: paper6,
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
  placeholder,
  style,
}: RollingPaperStickerProps) {
  const color = getRollingPaperStickerColor(colorId);
  const paper = rollingPaperAssets[color.id];
  const textBoxStyle = getRollingPaperStickerTextBoxStyle(color.id);
  const textStyle = getRollingPaperStickerTextStyle(message, color.id);
  const text = message || placeholder || '';
  const isPlaceholder = !message && Boolean(placeholder);

  return (
    <div className={`relative [container-type:inline-size] ${className}`} style={style}>
      <img src={paper.src} alt="" aria-hidden="true" className="block h-auto w-full select-none" />

      {!hideText && (
        <div
          className="absolute z-10 flex items-center justify-center overflow-hidden text-center font-wanted-sans font-medium text-black"
          style={textBoxStyle}
        >
          {children ?? (
            <p
              className={`whitespace-pre-wrap break-keep [overflow-wrap:anywhere] ${isPlaceholder ? 'text-black/35' : ''}`}
              style={textStyle}
            >
              {text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
