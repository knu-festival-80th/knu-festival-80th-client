import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, RotateCcw, Save, ZoomIn, ZoomOut } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { boothApi } from '@/apis';
import type { BoothMapItem } from '@/apis/modules/booth';
import tavernMapImage from '@/assets/images/map.svg';
import { festivalMap } from '@/constants/taverns';

const ASPECT = festivalMap.width / festivalMap.height;
const PRECISION = 10000;
const MIN_SCALE = 1;
const MAX_SCALE = 8;

const round = (v: number) => Math.round(v * PRECISION) / PRECISION;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type PendingChange = { xRatio: number; yRatio: number };

export default function BulkMapEditorPage() {
  const queryClient = useQueryClient();
  const outerRef = useRef<HTMLDivElement>(null);
  const mapAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [changes, setChanges] = useState<Map<number, PendingChange>>(new Map());

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
  const sizeRef = useRef(size);

  useEffect(() => {
    scaleRef.current = scale;
    txRef.current = tx;
    tyRef.current = ty;
  }, [scale, tx, ty]);
  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  const markersQuery = useQuery({
    queryKey: ['admin', 'booths', 'map-editor'],
    queryFn: boothApi.listMapBooths,
  });

  const booths = markersQuery.data ?? [];
  const sorted = [...booths].sort((a, b) => a.boothId - b.boothId);

  const selectedBooth = sorted.find((b) => b.boothId === selectedId) ?? null;
  const selectedIdx = selectedBooth ? sorted.indexOf(selectedBooth) : -1;

  const getPosition = (b: BoothMapItem): { x: number; y: number } => {
    const change = changes.get(b.boothId);
    return change
      ? { x: change.xRatio, y: change.yRatio }
      : { x: b.xRatio ?? 0.5, y: b.yRatio ?? 0.5 };
  };

  useLayoutEffect(() => {
    const area = mapAreaRef.current;
    if (!area) return;
    const PAD = 8;
    const recalc = () => {
      const rect = area.getBoundingClientRect();
      const aw = rect.width - PAD * 2;
      const ah = rect.height - PAD * 2;
      if (aw <= 0 || ah <= 0) return;
      let w = aw;
      let h = w / ASPECT;
      if (h > ah) {
        h = ah;
        w = h * ASPECT;
      }
      const fw = Math.floor(w);
      const fh = Math.floor(h);
      setSize((prev) => (prev.w === fw && prev.h === fh ? prev : { w: fw, h: fh }));
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(area);
    return () => ro.disconnect();
  }, []);

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
    (px: number, py: number) => {
      if (size.w === 0) return;
      const clamped = MAX_SCALE;
      const ntx = size.w / 2 - px * size.w * clamped;
      const nty = size.h / 2 - py * size.h * clamped;
      const { tx: ftx, ty: fty } = clampPan(ntx, nty, clamped);
      setAnimating(true);
      setScale(clamped);
      setTx(ftx);
      setTy(fty);
      setTimeout(() => setAnimating(false), 350);
    },
    [size.w, size.h, clampPan],
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = node.getBoundingClientRect();
      const ax = e.clientX - rect.left;
      const ay = e.clientY - rect.top;
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scaleRef.current * factor));
      if (next === scaleRef.current) return;
      const f = next / scaleRef.current;
      const { tx: ntx, ty: nty } = clampPan(
        ax - (ax - txRef.current) * f,
        ay - (ay - tyRef.current) * f,
        next,
      );
      setScale(next);
      setTx(ntx);
      setTy(nty);
    };
    node.addEventListener('wheel', handler, { passive: false });
    return () => node.removeEventListener('wheel', handler);
  }, [size.w, size.h, clampPan]);

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
    if (!drag || drag.moved || selectedId === null) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const ix = (cx - tx) / scale / size.w;
    const iy = (cy - ty) / scale / size.h;
    if (ix < 0 || ix > 1 || iy < 0 || iy > 1) return;
    setChanges((prev) => {
      const next = new Map(prev);
      next.set(selectedId, { xRatio: round(ix), yRatio: round(iy) });
      return next;
    });
  };

  const handleSelectBooth = (boothId: number) => {
    setSelectedId(boothId);
    const booth = sorted.find((b) => b.boothId === boothId);
    if (!booth || size.w === 0) return;
    const pos = changes.get(boothId) ?? {
      xRatio: booth.xRatio ?? 0.5,
      yRatio: booth.yRatio ?? 0.5,
    };
    focusOnPin(pos.xRatio, pos.yRatio);
  };

  const handlePrevNext = (dir: -1 | 1) => {
    if (sorted.length === 0) return;
    const nextIdx = selectedIdx < 0 ? 0 : (selectedIdx + dir + sorted.length) % sorted.length;
    handleSelectBooth(sorted[nextIdx].boothId);
  };

  const handleResetView = () => {
    setAnimating(true);
    setScale(1);
    setTx(0);
    setTy(0);
    setTimeout(() => setAnimating(false), 350);
  };

  const saveMutation = useMutation({
    mutationFn: async (entries: [number, PendingChange][]) => {
      await Promise.all(
        entries.map(([boothId, { xRatio, yRatio }]) =>
          boothApi.updateBooth(boothId, { xRatio, yRatio }),
        ),
      );
    },
    onSuccess: () => {
      setChanges(new Map());
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['booths'] });
    },
  });

  const handleSave = () => {
    if (changes.size === 0) return;
    saveMutation.mutate([...changes.entries()]);
  };

  const handleUndoBooth = (boothId: number) => {
    setChanges((prev) => {
      const next = new Map(prev);
      next.delete(boothId);
      return next;
    });
  };

  const getNudgeStep = useCallback(() => {
    const w = sizeRef.current.w;
    const s = scaleRef.current;
    if (w <= 0) return 1 / PRECISION;
    return Math.max(1 / PRECISION, Math.ceil((2 * PRECISION) / (w * s)) / PRECISION);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrevNext(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handlePrevNext(1);
        }
        return;
      }
      if (selectedId === null) return;
      const step = getNudgeStep();
      let dx = 0;
      let dy = 0;
      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else return;
      e.preventDefault();
      setChanges((prev) => {
        const next = new Map(prev);
        const booth = sorted.find((b) => b.boothId === selectedId);
        if (!booth) return prev;
        const cur = prev.get(selectedId) ?? {
          xRatio: booth.xRatio ?? 0.5,
          yRatio: booth.yRatio ?? 0.5,
        };
        next.set(selectedId, {
          xRatio: round(clamp01(cur.xRatio + dx)),
          yRatio: round(clamp01(cur.yRatio + dy)),
        });
        return next;
      });
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });

  const transitionStyle = animating ? 'transform 300ms cubic-bezier(0.25,0.46,0.45,0.94)' : 'none';
  const changedCount = changes.size;

  const markerColor = (b: BoothMapItem) => b.color ?? (b.type === 'BOOTH' ? '#15ccb1' : '#ff3d3d');

  return (
    <div
      ref={outerRef}
      className="-mx-6 -mt-6 -mb-6 flex flex-col sm:-mt-8 sm:-mb-8"
      style={{ height: 'calc(100dvh - var(--console-header-h, 88px))' }}
    >
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-2">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-[var(--admin-text)]">위치 일괄 편집</h1>
          {changedCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              {changedCount}개 변경됨
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={changedCount === 0 || saveMutation.isPending}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--admin-primary)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
        >
          <Save size={12} />
          {saveMutation.isPending ? '저장 중...' : '전체 저장'}
        </button>
      </div>

      {saveMutation.isSuccess && (
        <div className="shrink-0 bg-green-50 px-4 py-1.5 text-center text-xs font-medium text-green-700">
          저장 완료
        </div>
      )}

      {/* Map area — fills all remaining space */}
      <div ref={mapAreaRef} className="relative min-h-0 flex-1 bg-neutral-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            ref={containerRef}
            className="relative cursor-crosshair overflow-hidden rounded-xl bg-white shadow-sm"
            style={{
              width: size.w || '100%',
              height: size.h || 'auto',
              touchAction: 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              dragRef.current = null;
            }}
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
                alt=""
                draggable={false}
                className="pointer-events-none size-full select-none"
              />
              {size.w > 0 &&
                sorted.map((b) => {
                  const pos = getPosition(b);
                  const isSelected = b.boothId === selectedId;
                  const isChanged = changes.has(b.boothId);
                  const color = markerColor(b);
                  return (
                    <div
                      key={b.boothId}
                      className={`absolute ${isSelected ? 'z-20' : 'z-10'}`}
                      style={{
                        left: `${pos.x * 100}%`,
                        top: `${pos.y * 100}%`,
                        transform: `translate(-50%, -50%) scale(${1 / Math.sqrt(scale * MAX_SCALE)})`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectBooth(b.boothId);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className={
                          isSelected
                            ? 'flex size-7 items-center justify-center rounded-[14.5px] border-2 border-white text-[14px] font-bold leading-none text-white shadow-lg'
                            : `flex size-5 items-center justify-center rounded-full border border-white text-[9px] font-bold leading-none text-white ${isChanged ? '' : 'opacity-60'}`
                        }
                        style={{
                          backgroundColor: color,
                          boxShadow: isChanged && !isSelected ? '0 0 0 2px #f59e0b' : undefined,
                        }}
                      >
                        {b.boothId}
                      </button>
                    </div>
                  );
                })}
            </div>

            {!selectedId && sorted.length > 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-lg bg-black/60 px-4 py-2 text-sm text-white">
                  마커를 클릭하거나 아래에서 부스를 선택하세요
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handlePrevNext(-1)}
            disabled={sorted.length === 0}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--admin-border)] hover:bg-neutral-50 disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <select
            value={selectedId ?? ''}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v) handleSelectBooth(v);
            }}
            className="h-7 max-w-[180px] rounded-md border border-[var(--admin-border)] bg-white px-2 text-xs"
          >
            <option value="">부스 선택</option>
            {sorted.map((b) => (
              <option key={b.boothId} value={b.boothId}>
                #{b.boothId} {b.name} {changes.has(b.boothId) ? '●' : ''}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handlePrevNext(1)}
            disabled={sorted.length === 0}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--admin-border)] hover:bg-neutral-50 disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {selectedBooth && (
          <div className="flex items-center gap-2 text-[11px] text-[var(--admin-text-muted)]">
            <span className="font-medium text-[var(--admin-text)]">
              #{selectedBooth.boothId} {selectedBooth.name}
            </span>
            <span className="tabular-nums">
              ({getPosition(selectedBooth).x.toFixed(4)}, {getPosition(selectedBooth).y.toFixed(4)})
            </span>
            {changes.has(selectedBooth.boothId) && (
              <button
                type="button"
                onClick={() => handleUndoBooth(selectedBooth.boothId)}
                className="flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-amber-600 hover:bg-amber-100"
              >
                <RotateCcw size={10} />
                되돌리기
              </button>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => smoothZoomTo(scale * 0.7, size.w / 2, size.h / 2)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--admin-border)] hover:bg-neutral-50"
          >
            <ZoomOut size={12} />
          </button>
          <span className="w-9 text-center text-[11px] tabular-nums text-[var(--admin-text-muted)]">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => smoothZoomTo(scale * 1.4, size.w / 2, size.h / 2)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--admin-border)] hover:bg-neutral-50"
          >
            <ZoomIn size={12} />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="flex h-7 items-center gap-1 rounded-md border border-[var(--admin-border)] px-2 text-[11px] hover:bg-neutral-50"
          >
            <RotateCcw size={10} />
            원본
          </button>
        </div>
      </div>
    </div>
  );
}
