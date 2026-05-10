import { useCallback, useEffect, useRef, useState } from 'react';

const BRUSH_RADIUS = 28;
const REVEAL_THRESHOLD = 0.55;

const getCanvasPos = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
  const rect = canvas.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
};

interface UseInstaTingScratchCanvasOptions {
  onRevealed?: () => void;
}

export function useInstaTingScratchCanvas({ onRevealed }: UseInstaTingScratchCanvasOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDown = useRef(false);
  const rafRef = useRef<number>(0);
  const [revealed, setRevealed] = useState(false);

  const drawOverlay = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);

    // Pink gradient base
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#ffe8ee');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.92)');
    grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.92)');
    grad.addColorStop(1, '#f9b8c6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Blurred heart
    ctx.save();
    ctx.filter = `blur(${Math.round(w * 0.03)}px)`;
    ctx.fillStyle = '#f9b8c6';
    ctx.font = `${Math.round(w * 0.52)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♥', w / 2, h / 2);
    ctx.restore();

    // White sheen overlay (top-left)
    const sheen = ctx.createLinearGradient(0, 0, w * 0.55, h * 0.55);
    sheen.addColorStop(0, 'rgba(255,255,255,0.35)');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);

    // "카드를 긁어보세요" text
    ctx.fillStyle = '#da6e7b';
    ctx.font = `700 ${Math.round(w * 0.083)}px "Wanted Sans", Pretendard, "Apple SD Gothic Neo", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('카드를 긁어보세요', w / 2, h / 2);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      const ctx = canvas.getContext('2d')!;
      ctx.scale(dpr, dpr);
      drawOverlay(canvas);
    };

    const ro = new ResizeObserver(init);
    ro.observe(canvas);

    const blockScroll = (e: TouchEvent) => e.preventDefault();
    canvas.addEventListener('touchstart', blockScroll, { passive: false });
    canvas.addEventListener('touchmove', blockScroll, { passive: false });

    return () => {
      ro.disconnect();
      canvas.removeEventListener('touchstart', blockScroll);
      canvas.removeEventListener('touchmove', blockScroll);
      cancelAnimationFrame(rafRef.current);
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

  const handlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave: onPointerUp,
    onContextMenu: (e: React.MouseEvent<HTMLCanvasElement>) => e.preventDefault(),
  };

  return { canvasRef, revealed, handlers };
}
