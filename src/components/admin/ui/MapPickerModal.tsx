import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Minus, Plus, RotateCcw, X } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';

import { boothApi } from '@/apis';
import type { BoothMapItem, BoothType } from '@/apis/modules/booth';
import tavernMapImage from '@/assets/images/map.svg';
import { festivalMap } from '@/constants/taverns';

import { usePortalTheme } from './usePortalTheme';

interface MapPickerModalProps {
  open: boolean;
  initialX: number | null;
  initialY: number | null;
  boothId?: number;
  boothType?: BoothType;
  onConfirm: (x: number, y: number) => void;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const ASPECT = festivalMap.width / festivalMap.height;
const PIN_ZOOM_SCALE = 3.5;
const PRECISION = 10000;

const round = (v: number) => Math.round(v * PRECISION) / PRECISION;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export default function MapPickerModal(props: MapPickerModalProps) {
  if (!props.open) return null;
  return <MapPickerModalInner {...props} />;
}

function MapPickerModalInner({
  initialX,
  initialY,
  boothId,
  boothType = 'TAVERN',
  onConfirm,
  onClose,
}: MapPickerModalProps) {
  const { markerRef, wrapperRef } = usePortalTheme<HTMLDivElement>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [pin, setPin] = useState<{ x: number; y: number } | null>(
    initialX !== null && initialY !== null ? { x: initialX, y: initialY } : null,
  );
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startTx: number;
    startTy: number;
    moved: boolean;
  } | null>(null);
  const scaleRef = useRef(scale);
  const txRef = useRef(tx);
  const tyRef = useRef(ty);
  useEffect(() => {
    scaleRef.current = scale;
    txRef.current = tx;
    tyRef.current = ty;
  }, [scale, tx, ty]);

  const markersQuery = useQuery({
    queryKey: ['booths', 'map'],
    queryFn: boothApi.listMapBooths,
    staleTime: 60_000,
  });

  const otherMarkers = (markersQuery.data ?? []).filter(
    (m: BoothMapItem) => m.boothId !== boothId && m.xRatio != null && m.yRatio != null,
  );

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const nudgeStep = 1 / PRECISION / Math.max(1, scale / 2);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (!pin) return;
      const step = nudgeStep;
      let dx = 0;
      let dy = 0;
      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else return;
      e.preventDefault();
      setPin((p) => (p ? { x: round(clamp01(p.x + dx)), y: round(clamp01(p.y + dy)) } : p));
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, pin, nudgeStep]);

  useLayoutEffect(() => {
    const update = () => {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = node.getBoundingClientRect();
      const ax = e.clientX - rect.left;
      const ay = e.clientY - rect.top;
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scaleRef.current * factor));
      if (next === scaleRef.current) return;
      const f = next / scaleRef.current;
      let ntx = ax - (ax - txRef.current) * f;
      let nty = ay - (ay - tyRef.current) * f;
      const imgW = size.w * next;
      const imgH = size.h * next;
      ntx = Math.max(Math.min(0, size.w - imgW), Math.min(0, ntx));
      nty = Math.max(Math.min(0, size.h - imgH), Math.min(0, nty));
      setScale(next);
      setTx(ntx);
      setTy(nty);
    };
    node.addEventListener('wheel', handler, { passive: false });
    return () => node.removeEventListener('wheel', handler);
  }, [size.w, size.h]);

  const clampPan = useCallback(
    (nextTx: number, nextTy: number, s: number) => {
      const imgW = size.w * s;
      const imgH = size.h * s;
      return {
        tx: Math.max(Math.min(0, size.w - imgW), Math.min(0, nextTx)),
        ty: Math.max(Math.min(0, size.h - imgH), Math.min(0, nextTy)),
      };
    },
    [size.w, size.h],
  );

  const smoothZoomTo = useCallback(
    (newScale: number, anchorX: number, anchorY: number) => {
      const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      const f = clamped / scaleRef.current;
      const ntx = anchorX - (anchorX - txRef.current) * f;
      const nty = anchorY - (anchorY - tyRef.current) * f;
      const { tx: ftx, ty: fty } = clampPan(ntx, nty, clamped);
      setAnimating(true);
      setScale(clamped);
      setTx(ftx);
      setTy(fty);
      setTimeout(() => setAnimating(false), 350);
    },
    [clampPan],
  );

  const focusOnPin = useCallback(
    (px: number, py: number, targetScale?: number) => {
      if (size.w === 0) return;
      const s = targetScale ?? Math.max(scaleRef.current, PIN_ZOOM_SCALE);
      const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));
      const centerX = size.w / 2;
      const centerY = size.h / 2;
      const ntx = centerX - px * size.w * clamped;
      const nty = centerY - py * size.h * clamped;
      const { tx: ftx, ty: fty } = clampPan(ntx, nty, clamped);
      setAnimating(true);
      setScale(clamped);
      setTx(ftx);
      setTy(fty);
      setTimeout(() => setAnimating(false), 350);
    },
    [size.w, size.h, clampPan],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTx: tx,
      startTy: ty,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > 4) drag.moved = true;
    if (!drag.moved) return;
    const { tx: ftx, ty: fty } = clampPan(drag.startTx + dx, drag.startTy + dy, scale);
    setTx(ftx);
    setTy(fty);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (drag.moved) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const ix = (cx - tx) / scale / size.w;
    const iy = (cy - ty) / scale / size.h;
    if (ix < 0 || ix > 1 || iy < 0 || iy > 1) return;
    const newPin = { x: round(ix), y: round(iy) };
    setPin(newPin);
    focusOnPin(newPin.x, newPin.y);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ax = e.clientX - rect.left;
    const ay = e.clientY - rect.top;
    smoothZoomTo(scale * 2, ax, ay);
  };

  const handleResetView = () => {
    setAnimating(true);
    setScale(1);
    setTx(0);
    setTy(0);
    setTimeout(() => setAnimating(false), 350);
  };

  const handleNudge = (dx: number, dy: number) => {
    setPin((p) => (p ? { x: round(clamp01(p.x + dx)), y: round(clamp01(p.y + dy)) } : p));
  };

  const handleCoordInput = (axis: 'x' | 'y', value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const clamped = round(clamp01(num));
    setPin((p) =>
      p
        ? { ...p, [axis]: clamped }
        : { x: axis === 'x' ? clamped : 0.5, y: axis === 'y' ? clamped : 0.5 },
    );
  };

  const pinColor = boothType === 'BOOTH' ? '#15ccb1' : '#ff3d3d';

  const getMarkerColor = (marker: BoothMapItem) =>
    marker.type === 'BOOTH' ? '#15ccb1' : '#ff3d3d';

  const zoomOnPin = (factor: number) => {
    if (pin) {
      const ax = tx + pin.x * size.w * scale;
      const ay = ty + pin.y * size.h * scale;
      smoothZoomTo(scale * factor, ax, ay);
    } else {
      smoothZoomTo(scale * factor, size.w / 2, size.h / 2);
    }
  };

  const transitionStyle = animating ? 'transform 300ms cubic-bezier(0.25,0.46,0.45,0.94)' : 'none';

  return (
    <>
      <span ref={markerRef} aria-hidden style={{ display: 'none' }} />
      {createPortal(
        <div
          ref={wrapperRef}
          className="fixed inset-0 z-50 flex flex-col bg-black/85 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
        >
          <header className="flex shrink-0 items-center justify-between px-4 py-2 text-white">
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
              aria-label="닫기"
            >
              <X size={18} />
            </button>
            <h2 className="text-sm font-semibold">위치 선택</h2>
            <button
              type="button"
              onClick={() => {
                if (pin) onConfirm(pin.x, pin.y);
                else onClose();
              }}
              disabled={!pin}
              className="flex h-8 items-center rounded-lg bg-white px-4 text-sm font-semibold text-black disabled:opacity-50"
            >
              완료
            </button>
          </header>

          <div className="flex min-h-0 flex-1 items-center justify-center px-3">
            <div
              ref={containerRef}
              className="relative w-full max-w-[1200px] cursor-grab overflow-hidden rounded-xl bg-white select-none active:cursor-grabbing"
              style={{
                aspectRatio: ASPECT,
                maxHeight: 'calc(100dvh - 180px)',
                touchAction: 'none',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => {
                dragRef.current = null;
              }}
              onDoubleClick={handleDoubleClick}
            >
              <div
                className="absolute left-0 top-0 origin-top-left"
                style={{
                  width: '100%',
                  height: '100%',
                  transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
                  transition: transitionStyle,
                }}
              >
                <img
                  src={tavernMapImage}
                  alt="축제 지도"
                  draggable={false}
                  className="pointer-events-none size-full select-none"
                />
                {size.w > 0 &&
                  otherMarkers.map((m) => (
                    <div
                      key={m.boothId}
                      className="pointer-events-none absolute z-[5] -translate-x-1/2 -translate-y-1/2 opacity-40"
                      style={{
                        left: `${(m.xRatio ?? 0) * 100}%`,
                        top: `${(m.yRatio ?? 0) * 100}%`,
                      }}
                    >
                      <span
                        className="flex size-5 items-center justify-center rounded-full border border-white text-[9px] font-bold leading-none text-white"
                        style={{ backgroundColor: getMarkerColor(m) }}
                      >
                        {m.boothId}
                      </span>
                    </div>
                  ))}
                {pin && size.w > 0 && (
                  <div
                    className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${pin.x * 100}%`,
                      top: `${pin.y * 100}%`,
                    }}
                  >
                    <span
                      className="flex size-7 items-center justify-center rounded-[14.5px] border-2 border-white text-[14px] font-bold leading-none text-white shadow-lg"
                      style={{ backgroundColor: pinColor }}
                    >
                      {boothId ?? '?'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-2 px-4 pt-2 pb-2 text-white">
            {pin ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleNudge(-nudgeStep, 0)}
                    className="flex h-7 w-7 items-center justify-center rounded bg-white/10 hover:bg-white/20"
                    aria-label="좌"
                  >
                    <ArrowLeft size={12} />
                  </button>
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleNudge(0, -nudgeStep)}
                      className="flex h-7 w-7 items-center justify-center rounded bg-white/10 hover:bg-white/20"
                      aria-label="상"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudge(0, nudgeStep)}
                      className="flex h-7 w-7 items-center justify-center rounded bg-white/10 hover:bg-white/20"
                      aria-label="하"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNudge(nudgeStep, 0)}
                    className="flex h-7 w-7 items-center justify-center rounded bg-white/10 hover:bg-white/20"
                    aria-label="우"
                  >
                    <ArrowRight size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <label className="text-[10px] text-white/40">X</label>
                  <input
                    type="number"
                    step={1 / PRECISION}
                    min="0"
                    max="1"
                    value={pin.x.toFixed(4)}
                    onChange={(e) => handleCoordInput('x', e.target.value)}
                    className="h-7 w-[4.5rem] rounded bg-white/10 px-1.5 text-center text-[11px] tabular-nums text-white outline-none focus:bg-white/20"
                  />
                  <label className="text-[10px] text-white/40">Y</label>
                  <input
                    type="number"
                    step={1 / PRECISION}
                    min="0"
                    max="1"
                    value={pin.y.toFixed(4)}
                    onChange={(e) => handleCoordInput('y', e.target.value)}
                    className="h-7 w-[4.5rem] rounded bg-white/10 px-1.5 text-center text-[11px] tabular-nums text-white outline-none focus:bg-white/20"
                  />
                </div>
              </div>
            ) : (
              <span className="text-[11px] text-white/50">지도를 탭해 위치 지정</span>
            )}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => zoomOnPin(0.7)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
                aria-label="축소"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-[11px] tabular-nums">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => zoomOnPin(1.4)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
                aria-label="확대"
              >
                <Plus size={14} />
              </button>
              <button
                type="button"
                onClick={handleResetView}
                className="ml-0.5 flex h-8 items-center gap-1 rounded-lg bg-white/10 px-2 text-[11px] font-medium hover:bg-white/20"
              >
                <RotateCcw size={12} />
                원본
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
