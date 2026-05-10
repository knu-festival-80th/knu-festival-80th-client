import {
  ROLLING_PAPER_MAX_MESSAGE_LENGTH,
  ROLLING_PAPER_STICKER_COLORS,
  type RollingPaperStickerColorId,
} from '@/constants/rollingPaper';
import RollingPaperSticker from './RollingPaperSticker';
import {
  getRollingPaperStickerMessageLength,
  getRollingPaperStickerTextInputStyle,
  limitRollingPaperMessageForSticker,
} from './rollingPaperStickerText';

type RollingPaperWriteComposeStepProps = {
  message: string;
  colorId: RollingPaperStickerColorId;
  onMessageChange: (message: string) => void;
  onColorChange: (colorId: RollingPaperStickerColorId) => void;
  onNext: () => void;
};

const stickerPreviewClassNames: Record<RollingPaperStickerColorId, string> = {
  red: 'w-8',
  yellow: 'w-8',
  green: 'w-6',
  blue: 'w-10',
  purple: 'w-8',
  pink: 'w-8',
};

function StickerColorPicker({
  selectedColorId,
  onSelect,
}: {
  selectedColorId: RollingPaperStickerColorId;
  onSelect: (colorId: RollingPaperStickerColorId) => void;
}) {
  return (
    <div className="flex flex-col gap-3 px-6">
      <p className="font-wanted-sans text-[16px] font-semibold leading-none tracking-[-0.02em] text-black">
        포스트잇
      </p>
      <div className="flex items-center justify-between gap-2">
        {ROLLING_PAPER_STICKER_COLORS.map((color) => {
          const isSelected = selectedColorId === color.id;

          return (
            <button
              key={color.id}
              type="button"
              aria-label={`${color.label} 포스트잇 선택`}
              aria-pressed={isSelected}
              className={`flex size-10 items-center justify-center rounded-xl border bg-white transition ${
                isSelected
                  ? 'border-sub-red shadow-[0_0_0_2px_rgba(255,61,61,0.14)]'
                  : 'border-black/10'
              }`}
              onClick={() => onSelect(color.id)}
            >
              <RollingPaperSticker
                colorId={color.id}
                message=""
                hideText
                className={stickerPreviewClassNames[color.id]}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function RollingPaperWriteComposeStep({
  message,
  colorId,
  onMessageChange,
  onColorChange,
  onNext,
}: RollingPaperWriteComposeStepProps) {
  const textInputStyle = getRollingPaperStickerTextInputStyle(message, colorId);
  const messageLength = getRollingPaperStickerMessageLength(message, colorId);

  const updateMessage = (nextMessage: string, nextColorId = colorId) => {
    onMessageChange(
      limitRollingPaperMessageForSticker(
        nextMessage,
        nextColorId,
        ROLLING_PAPER_MAX_MESSAGE_LENGTH,
      ),
    );
  };

  const updateColor = (nextColorId: RollingPaperStickerColorId) => {
    updateMessage(message, nextColorId);
    onColorChange(nextColorId);
  };

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="relative mt-4 h-[360px] w-[266px] overflow-hidden">
        <RollingPaperSticker
          colorId={colorId}
          message=""
          className="absolute left-1/2 top-1/2 w-[230px] -translate-x-1/2 -translate-y-1/2"
        >
          <textarea
            aria-label="롤링페이퍼 메시지"
            value={message}
            placeholder="축하 메시지를 남겨주세요"
            maxLength={ROLLING_PAPER_MAX_MESSAGE_LENGTH}
            autoCapitalize="off"
            autoCorrect="off"
            data-enable-grammarly="false"
            data-gramm="false"
            data-gramm_editor="false"
            spellCheck={false}
            className="absolute inset-0 z-10 box-border h-full w-full resize-none overflow-hidden bg-transparent px-0 text-center font-wanted-sans font-medium tracking-[-0.03em] text-black caret-secondary-blue outline-none placeholder:text-black/35 selection:bg-secondary-blue/20 selection:text-black"
            style={textInputStyle}
            onChange={(event) => updateMessage(event.target.value)}
          />
        </RollingPaperSticker>
        <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 font-wanted-sans text-[12px] font-medium leading-none text-white">
          {messageLength} / {ROLLING_PAPER_MAX_MESSAGE_LENGTH}
        </div>
      </div>

      <div className="mt-3 w-full">
        <StickerColorPicker selectedColorId={colorId} onSelect={updateColor} />
      </div>

      <button
        type="button"
        className="mt-auto h-[50px] w-[287px] rounded-lg bg-[#ff3d3d] font-wanted-sans text-[16px] font-medium leading-none text-white disabled:bg-gray/40"
        disabled={!message.trim()}
        onClick={onNext}
      >
        다음으로
      </button>
    </div>
  );
}
