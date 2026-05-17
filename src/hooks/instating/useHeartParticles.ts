import { useCallback, useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

const COLORS = ['#ff5c7d', '#ffb3c6', '#ff8fab', '#ff2d55'];
const EMIT_INTERVAL = 40;

function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  ctx.beginPath();
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = cx + scale * 16 * Math.pow(Math.sin(t), 3);
    const y =
      cy - scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function useHeartParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const prevCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const wRef = useRef(269);
  const hRef = useRef(346);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const lastEmitRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;

      // lazy init / re-init when canvas element changes
      if (canvas && canvas !== prevCanvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.offsetWidth || 269;
        const h = canvas.offsetHeight || 346;
        wRef.current = w;
        hRef.current = h;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctxRef.current = canvas.getContext('2d');
        ctxRef.current?.scale(dpr, dpr);
        prevCanvasRef.current = canvas;
      }

      const ctx = ctxRef.current;
      if (!ctx) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, wRef.current, hRef.current);
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= 0.028;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        drawHeart(ctx, p.x, p.y, p.size);
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const emit = useCallback((x: number, y: number) => {
    const now = performance.now();
    if (now - lastEmitRef.current < EMIT_INTERVAL) return;
    lastEmitRef.current = now;

    for (let i = 0; i < 3; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: -(Math.random() * 3 + 1.5),
        life: 1,
        size: Math.random() * 0.25 + 0.25,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
  }, []);

  const burst = useCallback((x: number, y: number, count = 28) => {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = Math.random() * 3 + 1.5;
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        size: Math.random() * 0.35 + 0.25,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
  }, []);

  return { canvasRef, emit, burst };
}
