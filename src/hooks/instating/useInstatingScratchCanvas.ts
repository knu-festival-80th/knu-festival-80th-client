import { useCallback, useEffect, useRef, useState } from 'react';

const BRUSH_RADIUS = 28;
const REVEAL_THRESHOLD = 0.55;
const HINT_STEPS = 120;
const HINT_BRUSH = 13;
const HINT_PAUSE = 30; // ~0.5s
const FILL_SPEED = 2;

const getCanvasPos = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
  const rect = canvas.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
};

interface UseInstatingScratchCanvasOptions {
  onRevealed?: () => void;
}

export function useInstatingScratchCanvas({ onRevealed }: UseInstatingScratchCanvasOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDown = useRef(false);
  const rafRef = useRef<number>(0);
  const hintRafRef = useRef<number>(0);
  const [revealed, setRevealed] = useState(false);

  const drawOverlay = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = ctxRef.current;
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

    // Blurred heart (parametric path + shadowBlur — cross-browser consistent)
    const blurPx = Math.round(w * 0.07);
    const scale = w * 0.017;
    const cx = w / 2;
    const cy = h / 2 - scale * 2.5;

    const drawHeartPath = () => {
      const GAP = Math.PI * 0.2;
      const scaleY = scale * 1.2;
      const hpx = (t: number) => cx + scale * 16 * Math.pow(Math.sin(t), 3);
      const hpy = (t: number) =>
        cy -
        scaleY * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      ctx.beginPath();

      // 원래 공식으로 상단~하단 직전까지 (하트 형태 유지)
      const steps = 100;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * (Math.PI - GAP);
        if (i === 0) ctx.moveTo(hpx(t), hpy(t));
        else ctx.lineTo(hpx(t), hpy(t));
      }

      // 바닥 첨점만 quadratic bezier로 둥글게
      ctx.quadraticCurveTo(cx, hpy(Math.PI) - scaleY * 3, hpx(Math.PI + GAP), hpy(Math.PI + GAP));

      // 하단 이후 ~ 상단 복귀 (원래 공식)
      for (let i = 1; i <= steps; i++) {
        const t = Math.PI + GAP + (i / steps) * (Math.PI - GAP);
        ctx.lineTo(hpx(t), hpy(t));
      }

      ctx.closePath();
    };

    ctx.save();
    ctx.shadowColor = '#f9b8c6';
    ctx.shadowBlur = blurPx * 4;
    ctx.fillStyle = 'rgba(249, 184, 198, 0.4)';
    drawHeartPath();
    ctx.fill();
    ctx.fill();
    ctx.fill();
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
      ctxRef.current = canvas.getContext('2d');
      ctxRef.current?.scale(dpr, dpr);
      drawOverlay(canvas);
    };

    const ro = new ResizeObserver(init);
    ro.observe(canvas);

    // 하트 경로 힌트 애니메이션
    const heartPoint = (t: number, w: number, h: number) => {
      // 하트 공식 x: ±16, y: -17~12 → scale은 카드 너비 기준으로 작게 설정
      const scale = w * 0.017; // scale=4.5 수준 (하트 너비 ~144px)
      const cx = w / 2;
      const cy = h / 2 - scale * 2.5; // y 공식의 상하 비대칭(-17~12) 보정으로 시각적 중앙 정렬
      return {
        x: cx + scale * 16 * Math.pow(Math.sin(t), 3),
        y:
          cy -
          scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
      };
    };

    let step = 0;
    let pauseFrames = 0;
    let fillStep = 0;
    let phase: 'trace' | 'pause' | 'fill' = 'trace';

    const animateHint = () => {
      if (isDown.current) return;

      const ctx = ctxRef.current;
      if (!ctx) {
        hintRafRef.current = requestAnimationFrame(animateHint);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      if (phase === 'trace') {
        const t = (step / HINT_STEPS) * Math.PI * 2;
        const { x, y } = heartPoint(t, w, h);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, HINT_BRUSH, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        step++;
        if (step > HINT_STEPS) {
          phase = 'pause';
          pauseFrames = 0;
        }
      } else if (phase === 'pause') {
        pauseFrames++;
        if (pauseFrames >= HINT_PAUSE) {
          fillStep = 0;
          phase = 'fill';
        }
      } else {
        // fill phase: redraw overlay then re-erase only fillStep..HINT_STEPS
        // this progressively covers the heart from start toward end
        drawOverlay(canvas);
        ctx.globalCompositeOperation = 'destination-out';
        for (let s = fillStep; s <= HINT_STEPS; s++) {
          const t = (s / HINT_STEPS) * Math.PI * 2;
          const { x, y } = heartPoint(t, w, h);
          ctx.beginPath();
          ctx.arc(x, y, HINT_BRUSH, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        fillStep += FILL_SPEED;
        if (fillStep > HINT_STEPS) {
          drawOverlay(canvas);
          step = 0;
          phase = 'trace';
        }
      }

      hintRafRef.current = requestAnimationFrame(animateHint);
    };

    hintRafRef.current = requestAnimationFrame(animateHint);

    const blockScroll = (e: TouchEvent) => e.preventDefault();
    canvas.addEventListener('touchstart', blockScroll, { passive: false });
    canvas.addEventListener('touchmove', blockScroll, { passive: false });

    return () => {
      ro.disconnect();
      cancelAnimationFrame(hintRafRef.current);
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('touchstart', blockScroll);
      canvas.removeEventListener('touchmove', blockScroll);
    };
  }, [drawOverlay]);

  const scratch = useCallback((x: number, y: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  const checkReveal = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || revealed) return;

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
    onContextMenu: (e: React.MouseEvent<HTMLCanvasElement>) => e.preventDefault(),
  };

  return { canvasRef, revealed, handlers };
}
