import type { CSSProperties, ReactNode } from 'react';
import paper1 from '@/assets/rollingPaper/paper1.svg?raw';
import paper2 from '@/assets/rollingPaper/paper2.svg?raw';
import paper3 from '@/assets/rollingPaper/paper3.svg?raw';
import paper4 from '@/assets/rollingPaper/paper4.svg?raw';
import paper5 from '@/assets/rollingPaper/paper5.svg?raw';
import paper6 from '@/assets/rollingPaper/paper6.svg?raw';
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

const rollingPaperAssets: Record<RollingPaperStickerColorId, { svg: string }> = {
  red: {
    svg: paper1,
  },
  yellow: {
    svg: paper2,
  },
  green: {
    svg: paper3,
  },
  blue: {
    svg: paper4,
  },
  purple: {
    svg: paper5,
  },
  pink: {
    svg: paper6,
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
      <span
        aria-hidden="true"
        className="block w-full select-none [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: paper.svg }}
      />

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
