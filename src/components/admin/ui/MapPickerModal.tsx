import { Minus, Plus, RotateCcw, X } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiMapPin } from 'react-icons/fi';

import tavernMapImage from '@/assets/images/map.svg';
import { festivalMap } from '@/constants/taverns';

import { usePortalTheme } from './usePortalTheme';

interface MapPickerModalProps {
  open: boolean;
  initialX: number | null;
  initialY: number | null;
  onConfirm: (x: number, y: number) => void;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const ASPECT = festivalMap.width / festivalMap.height;

export default function MapPickerModal(props: MapPickerModalProps) {
  if (!props.open) return null;
  return <MapPickerModalInner {...props} />;
}

function MapPickerModalInner({ initialX, initialY, onConfirm, onClose }: MapPickerModalProps) {
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

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

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
      const maxTx = 0;
      const maxTy = 0;
      return {
        tx: Math.max(minTx, Math.min(maxTx, nextTx)),
        ty: Math.max(minTy, Math.min(maxTy, nextTy)),
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

  const pinLeft = pin ? tx + pin.x * size.w * scale : 0;
  const pinTop = pin ? ty + pin.y * size.h * scale : 0;

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

          <div className="flex flex-1 items-center justify-center px-3">
            <div
              ref={containerRef}
              className="relative w-full max-w-[1200px] cursor-grab overflow-hidden rounded-xl bg-white select-none active:cursor-grabbing"
              style={{ aspectRatio: ASPECT, touchAction: 'none' }}
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
              {pin && size.w > 0 && (
                <div
                  className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
                  style={{ left: pinLeft, top: pinTop }}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#ff3d3d] shadow-lg">
                    <FiMapPin className="text-white" size={18} />
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 px-4 pt-3 pb-3 text-white">
            <div className="tabular text-xs text-white/70">
              {pin
                ? `X ${pin.x.toFixed(3)} · Y ${pin.y.toFixed(3)}`
                : '지도를 탭해 위치를 지정하세요'}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => zoomTo(scale * 0.85, size.w / 2, size.h / 2)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
                aria-label="축소"
              >
                <Minus size={16} />
              </button>
              <span className="tabular w-12 text-center text-xs">{Math.round(scale * 100)}%</span>
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
        </div>,
        document.body,
      )}
    </>
  );
}
