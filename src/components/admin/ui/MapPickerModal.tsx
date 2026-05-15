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
const MAX_SCALE = 6;
const ASPECT = festivalMap.width / festivalMap.height;
const NUDGE_STEP = 0.001;

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (!pin) return;
      const nudge = { x: 0, y: 0 };
      if (e.key === 'ArrowLeft') nudge.x = -NUDGE_STEP;
      else if (e.key === 'ArrowRight') nudge.x = NUDGE_STEP;
      else if (e.key === 'ArrowUp') nudge.y = -NUDGE_STEP;
      else if (e.key === 'ArrowDown') nudge.y = NUDGE_STEP;
      else return;
      e.preventDefault();
      setPin((p) =>
        p
          ? {
              x: Math.round(Math.max(0, Math.min(1, p.x + nudge.x)) * 1000) / 1000,
              y: Math.round(Math.max(0, Math.min(1, p.y + nudge.y)) * 1000) / 1000,
            }
          : p,
      );
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, pin]);

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

  const clampPan = useCallback(
    (nextTx: number, nextTy: number, s: number) => {
      const imgW = size.w * s;
      const imgH = size.h * s;
      const minTx = Math.min(0, size.w - imgW);
      const minTy = Math.min(0, size.h - imgH);
      return {
        tx: Math.max(minTx, Math.min(0, nextTx)),
        ty: Math.max(minTy, Math.min(0, nextTy)),
      };
    },
    [size.w, size.h],
  );

  const zoomTo = useCallback(
    (newScale: number, anchorX: number, anchorY: number) => {
      const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      if (clamped === scale) return;
      const factor = clamped / scale;
      const nextTx = anchorX - (anchorX - tx) * factor;
      const nextTy = anchorY - (anchorY - ty) * factor;
      const { tx: ftx, ty: fty } = clampPan(nextTx, nextTy, clamped);
      setScale(clamped);
      setTx(ftx);
      setTy(fty);
    },
    [scale, tx, ty, clampPan],
  );

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ax = e.clientX - rect.left;
    const ay = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    zoomTo(scale * factor, ax, ay);
  };

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
    setPin({ x: Math.round(ix * 1000) / 1000, y: Math.round(iy * 1000) / 1000 });
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ax = e.clientX - rect.left;
    const ay = e.clientY - rect.top;
    zoomTo(scale * 1.8, ax, ay);
  };

  const handleResetView = () => {
    setScale(1);
    setTx(0);
    setTy(0);
  };

  const handleNudge = (dx: number, dy: number) => {
    setPin((p) =>
      p
        ? {
            x: Math.round(Math.max(0, Math.min(1, p.x + dx)) * 1000) / 1000,
            y: Math.round(Math.max(0, Math.min(1, p.y + dy)) * 1000) / 1000,
          }
        : p,
    );
  };

  const handleCoordInput = (axis: 'x' | 'y', value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const clamped = Math.round(Math.max(0, Math.min(1, num)) * 1000) / 1000;
    setPin((p) =>
      p
        ? { ...p, [axis]: clamped }
        : { x: axis === 'x' ? clamped : 0.5, y: axis === 'y' ? clamped : 0.5 },
    );
  };

  const pinLeft = pin ? tx + pin.x * size.w * scale : 0;
  const pinTop = pin ? ty + pin.y * size.h * scale : 0;
  const pinColor = boothType === 'BOOTH' ? '#15ccb1' : '#ff3d3d';

  const getMarkerColor = (marker: BoothMapItem) => {
    if (marker.type === 'BOOTH') return '#15ccb1';
    return '#ff3d3d';
  };

  return (
    <>
      <span ref={markerRef} aria-hidden style={{ display: 'none' }} />
      {createPortal(
        <div
          ref={wrapperRef}
          className="fixed inset-0 z-50 flex flex-col bg-black/85 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
        >
          <header className="flex shrink-0 items-center justify-between px-4 py-3 text-white">
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
              aria-label="닫기"
            >
              <X size={20} />
            </button>
            <h2 className="text-base font-semibold">위치 선택</h2>
            <button
              type="button"
              onClick={() => {
                if (pin) onConfirm(pin.x, pin.y);
                else onClose();
              }}
              disabled={!pin}
              className="flex h-9 items-center rounded-lg bg-white px-4 text-sm font-semibold text-black disabled:opacity-50"
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
                maxHeight: 'calc(100dvh - 220px)',
                touchAction: 'none',
              }}
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => {
                dragRef.current = null;
              }}
              onDoubleClick={handleDoubleClick}
            >
              <img
                src={tavernMapImage}
                alt="축제 지도"
                draggable={false}
                className="pointer-events-none origin-top-left select-none"
                style={{
                  width: '100%',
                  height: '100%',
                  transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
                }}
              />
              {size.w > 0 &&
                otherMarkers.map((m) => {
                  const left = tx + (m.xRatio ?? 0) * size.w * scale;
                  const top = ty + (m.yRatio ?? 0) * size.h * scale;
                  return (
                    <div
                      key={m.boothId}
                      className="pointer-events-none absolute z-[5] -translate-x-1/2 -translate-y-1/2 opacity-40"
                      style={{ left, top }}
                    >
                      <span
                        className="flex size-5 items-center justify-center rounded-full border border-white text-[9px] font-bold leading-none text-white"
                        style={{ backgroundColor: getMarkerColor(m) }}
                      >
                        {m.boothId}
                      </span>
                    </div>
                  );
                })}
              {pin && size.w > 0 && (
                <div
                  className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: pinLeft, top: pinTop }}
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

          <div className="flex shrink-0 flex-col gap-2 px-4 pt-3 pb-3 text-white">
            {pin && (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNudge(-NUDGE_STEP, 0)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
                  aria-label="좌로 이동"
                >
                  <ArrowLeft size={14} />
                </button>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleNudge(0, -NUDGE_STEP)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
                    aria-label="위로 이동"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudge(0, NUDGE_STEP)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
                    aria-label="아래로 이동"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleNudge(NUDGE_STEP, 0)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
                  aria-label="우로 이동"
                >
                  <ArrowRight size={14} />
                </button>
                <div className="ml-3 flex items-center gap-2">
                  <label className="text-[10px] text-white/50">X</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={pin.x.toFixed(3)}
                    onChange={(e) => handleCoordInput('x', e.target.value)}
                    className="h-7 w-20 rounded bg-white/10 px-2 text-center text-xs tabular-nums text-white outline-none focus:bg-white/20"
                  />
                  <label className="text-[10px] text-white/50">Y</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={pin.y.toFixed(3)}
                    onChange={(e) => handleCoordInput('y', e.target.value)}
                    className="h-7 w-20 rounded bg-white/10 px-2 text-center text-xs tabular-nums text-white outline-none focus:bg-white/20"
                  />
                </div>
              </div>
            )}
            {!pin && (
              <div className="text-center text-xs text-white/70">
                지도를 탭해 위치를 지정하세요 (화살표 키로 미세 조절)
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (pin) onConfirm(pin.x, pin.y);
                  else onClose();
                }}
                disabled={!pin}
                className="flex h-9 items-center rounded-lg bg-white px-5 text-sm font-semibold text-black disabled:opacity-50"
              >
                완료
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => zoomTo(scale * 0.85, size.w / 2, size.h / 2)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
                  aria-label="축소"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-xs tabular-nums">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => zoomTo(scale * 1.18, size.w / 2, size.h / 2)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
                  aria-label="확대"
                >
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleResetView}
                  className="ml-1 flex h-9 items-center gap-1 rounded-lg bg-white/10 px-2.5 text-xs font-medium hover:bg-white/20"
                >
                  <RotateCcw size={13} />
                  원본
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
