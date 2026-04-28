import { useCallback, useEffect, useRef, useState } from 'react';

const BRUSH_RADIUS = 28;
const REVEAL_THRESHOLD = 0.55;

const getCanvasPos = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
  const rect = canvas.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
};

interface UseScratchCanvasOptions {
  onRevealed?: () => void;
}

interface ScratchCanvasHandlers {
  onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerLeave: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onContextMenu: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export function useScratchCanvas({ onRevealed }: UseScratchCanvasOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDown = useRef(false);
  const rafRef = useRef<number>(0);
  const [revealed, setRevealed] = useState(false);

  const drawOverlay = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#c8c8c8');
    grad.addColorStop(0.2, '#f0f0f0');
    grad.addColorStop(0.5, '#b0b0b0');
    grad.addColorStop(0.8, '#e0e0e0');
    grad.addColorStop(1, '#c0c0c0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const sheen = ctx.createLinearGradient(0, 0, w * 0.7, h * 0.7);
    sheen.addColorStop(0, 'rgba(255,255,255,0)');
    sheen.addColorStop(0.45, 'rgba(255,255,255,0.3)');
    sheen.addColorStop(0.55, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 5000; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.18})`;
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(60, 60, 60, 0.75)';
    ctx.font = 'bold 15px "Wanted Sans", Pretendard, "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('여기를 긁어보세요', w / 2, h / 2);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
      drawOverlay(canvas);
    };

    const ro = new ResizeObserver(init);
    ro.observe(canvas);

    // React registers touch listeners as passive by default, making synthetic
    // e.preventDefault() a no-op for scroll prevention. Native listeners with
    // passive:false are the only reliable way to block scroll while scratching.
    const blockScroll = (e: TouchEvent) => e.preventDefault();
    canvas.addEventListener('touchstart', blockScroll, { passive: false });
    canvas.addEventListener('touchmove', blockScroll, { passive: false });

    return () => {
      ro.disconnect();
      canvas.removeEventListener('touchstart', blockScroll);
      canvas.removeEventListener('touchmove', blockScroll);
    };
  }, [drawOverlay]);

  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  const checkReveal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;

    let transparent = 0;
    const step = 64;
    const total = Math.floor(data.length / step);
    for (let i = 3; i < data.length; i += step) {
      if (data[i] < 64) transparent++;
    }

    if (transparent / total >= REVEAL_THRESHOLD) {
      setRevealed(true);
      onRevealed?.();
    }
  }, [revealed, onRevealed]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      isDown.current = true;
      const canvas = canvasRef.current!;
      canvas.setPointerCapture(e.pointerId);
      const { x, y } = getCanvasPos(canvas, e.clientX, e.clientY);
      scratch(x, y);
    },
    [scratch],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (!isDown.current) return;
      const canvas = canvasRef.current!;
      const { x, y } = getCanvasPos(canvas, e.clientX, e.clientY);
      scratch(x, y);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(checkReveal);
    },
    [scratch, checkReveal],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      isDown.current = false;
      checkReveal();
    },
    [checkReveal],
  );

  const handlers: ScratchCanvasHandlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave: onPointerUp,
    onContextMenu: (e) => e.preventDefault(),
  };

  return { canvasRef, revealed, handlers };
}
