interface ScratchCardProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  handlers: {
    onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerLeave: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onContextMenu: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  };
  hideLabel?: boolean;
}

const ScratchCard = ({ canvasRef, handlers, hideLabel = false }: ScratchCardProps) => (
  <div className="relative shrink-0" style={{ width: 269, height: 346 }}>
    <article
      className="absolute inset-0 overflow-hidden rounded-[24px]"
      style={{
        boxShadow: '0px 8px 20px 0px rgba(0,0,0,0.04), 0px 4px 24px 0px rgba(155,176,255,0.35)',
      }}
    >
      {/* 알록달록 메탈릭 배경 */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 22%),
            linear-gradient(135deg, rgba(255,110,170,0.60) 0%, transparent 40%),
            linear-gradient(45deg, rgba(40,210,255,0.55) 0%, transparent 42%),
            linear-gradient(270deg, rgba(180,100,255,0.52) 0%, transparent 42%),
            linear-gradient(315deg, rgba(80,255,190,0.42) 0%, transparent 40%),
            linear-gradient(0deg, rgba(50,70,220,0.48) 0%, transparent 50%),
            #9CB0FF
          `,
        }}
      />
      {/* 볼록 효과 오버레이 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow:
            'inset 14px 10px 22px 0px rgba(255,255,255,0.40), inset -5px -5px 16px 0px rgba(60,80,200,0.38)',
        }}
      />
      {/* 캔버스가 긁힌 자리에서 보이는 대비 텍스트 — 실제 긁기 시작 시 숨김 */}
      {!hideLabel && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center font-wanted-sans text-[22px] font-bold leading-none text-white">
          카드를 긁어보세요
        </p>
      )}
      {/* 스크래치 오버레이 캔버스 (다크핑크 텍스트 포함) */}
      <canvas
        ref={canvasRef}
        aria-label="스크래치 카드 - 긁어서 매칭 결과를 확인하세요"
        role="img"
        className="absolute inset-0 h-full w-full touch-none select-none"
        {...handlers}
      />
    </article>
  </div>
);

export default ScratchCard;
