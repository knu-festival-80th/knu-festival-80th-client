interface ScratchCardProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  handlers: {
    onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerLeave: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onContextMenu: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  };
}

const ScratchCard = ({ canvasRef, handlers }: ScratchCardProps) => (
  <div className="relative shrink-0" style={{ width: 269, height: 346 }}>
    <div
      className="pointer-events-none absolute inset-0 rounded-[24px] border-4 border-white"
      style={{
        boxShadow: '0px 8px 20px 0px rgba(0,0,0,0.02), 0px 4px 20px 0px rgba(255,182,193,0.25)',
      }}
    />
    <article className="absolute inset-1 overflow-hidden rounded-[20px]">
      <div className="absolute inset-0" style={{ background: '#f0eeff' }} />
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
