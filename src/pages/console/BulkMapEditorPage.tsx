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

type PendingChange = { xRatio: number; yRatio: number };

export default function BulkMapEditorPage() {
  const queryClient = useQueryClient();
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

  useEffect(() => {
    scaleRef.current = scale;
    txRef.current = tx;
    tyRef.current = ty;
  }, [scale, tx, ty]);

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
    const targetScale = Math.max(scale, 4);
    const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, targetScale));
    const ntx = size.w / 2 - pos.xRatio * size.w * clamped;
    const nty = size.h / 2 - pos.yRatio * size.h * clamped;
    const { tx: ftx, ty: fty } = clampPan(ntx, nty, clamped);
    setAnimating(true);
    setScale(clamped);
    setTx(ftx);
    setTy(fty);
    setTimeout(() => setAnimating(false), 350);
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && e.altKey) {
        e.preventDefault();
        handlePrevNext(-1);
      } else if (e.key === 'ArrowRight' && e.altKey) {
        e.preventDefault();
        handlePrevNext(1);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });

  const transitionStyle = animating ? 'transform 300ms cubic-bezier(0.25,0.46,0.45,0.94)' : 'none';
  const changedCount = changes.size;

  const markerColor = (b: BoothMapItem) => b.color ?? (b.type === 'BOOTH' ? '#15ccb1' : '#ff3d3d');

  return (
    <div className="flex h-[calc(100dvh-64px)] flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--admin-border)] px-4 py-2">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-[var(--admin-text)]">위치 일괄 편집</h1>
          {changedCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              {changedCount}개 변경됨
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={changedCount === 0 || saveMutation.isPending}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--admin-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          <Save size={14} />
          {saveMutation.isPending ? '저장 중...' : '전체 저장'}
        </button>
      </div>

      {saveMutation.isSuccess && (
        <div className="shrink-0 bg-green-50 px-4 py-2 text-center text-sm font-medium text-green-700">
          저장 완료
        </div>
      )}

      <div className="flex min-h-0 flex-1 items-center justify-center bg-neutral-100 p-3">
        <div
          ref={containerRef}
          className="relative w-full cursor-crosshair overflow-hidden rounded-xl bg-white shadow-sm"
          style={{
            aspectRatio: ASPECT,
            maxWidth: `min(1200px, calc((100dvh - 200px) * ${ASPECT}))`,
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
                    className="absolute z-10"
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
                      className={`flex items-center justify-center rounded-full border-2 text-xs font-bold leading-none transition-shadow ${
                        isSelected ? 'z-30 size-9 ring-4 ring-blue-400/50' : 'size-6'
                      }`}
                      style={{
                        borderColor: isSelected ? '#3b82f6' : '#fff',
                        backgroundColor: isSelected ? '#fff' : color,
                        color: isSelected ? color : '#fff',
                        boxShadow: isChanged ? '0 0 0 2px #f59e0b' : undefined,
                      }}
                    >
                      {b.boothId}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-[var(--admin-border)] px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handlePrevNext(-1)}
            disabled={sorted.length === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--admin-border)] hover:bg-neutral-50 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <select
            value={selectedId ?? ''}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v) handleSelectBooth(v);
            }}
            className="h-8 rounded-lg border border-[var(--admin-border)] bg-white px-2 text-sm"
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
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--admin-border)] hover:bg-neutral-50 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {selectedBooth && (
          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
            <span className="font-medium text-[var(--admin-text)]">
              #{selectedBooth.boothId} {selectedBooth.name}
            </span>
            {(() => {
              const pos = getPosition(selectedBooth);
              return (
                <span className="tabular-nums">
                  ({pos.x.toFixed(4)}, {pos.y.toFixed(4)})
                </span>
              );
            })()}
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
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--admin-border)] hover:bg-neutral-50"
          >
            <ZoomOut size={14} />
          </button>
          <span className="w-10 text-center text-xs tabular-nums text-[var(--admin-text-muted)]">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => smoothZoomTo(scale * 1.4, size.w / 2, size.h / 2)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--admin-border)] hover:bg-neutral-50"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="flex h-8 items-center gap-1 rounded-lg border border-[var(--admin-border)] px-2 text-xs hover:bg-neutral-50"
          >
            <RotateCcw size={12} />
            원본
          </button>
        </div>
      </div>

      {!selectedId && sorted.length > 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-lg bg-black/60 px-4 py-2 text-sm text-white">
            마커를 클릭하거나 아래에서 부스를 선택하세요
          </div>
        </div>
      )}
    </div>
  );
}
