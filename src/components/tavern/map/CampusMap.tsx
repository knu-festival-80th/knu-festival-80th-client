import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { FiCircle, FiMinus, FiPlus } from 'react-icons/fi';

import tavernMapImage from '@/assets/images/map.svg';
import { festivalMap, type Tavern } from '@/constants/taverns';

const MAP_BASE_VIEWPORT_SIZE = 335;
const MAP_RENDER_WIDTH = 3942.121;
const MAP_RENDER_HEIGHT = MAP_RENDER_WIDTH * (festivalMap.height / festivalMap.width);
const MAP_RENDER_OFFSET_X = -2965;
const MAP_RENDER_OFFSET_Y = -2927;
const MAP_RENDER_SCALE = MAP_RENDER_WIDTH / festivalMap.width;
const MAP_MIN_SCALE = 0.1;
const MAP_DEFAULT_SCALE = 0.6;
const MAP_MAX_SCALE = 1;
const MAP_FOCUS_SCALE = 1;
const MAP_ZOOM_STEP = 0.15;
const INITIAL_MAP_PAN = { x: 420, y: 350 };

const clampRatio = (ratio: number) => Math.min(Math.max(ratio, 0), 1);

const getMapPoint = (tavern: Tavern) => {
  const x = clampRatio(tavern.xRatio) * festivalMap.width * MAP_RENDER_SCALE + MAP_RENDER_OFFSET_X;
  const y = clampRatio(tavern.yRatio) * festivalMap.height * MAP_RENDER_SCALE + MAP_RENDER_OFFSET_Y;

  return { x, y };
};

const getMapMarkerStyle = (tavern: Tavern): CSSProperties => {
  const { x, y } = getMapPoint(tavern);

  return {
    left: `${(x / MAP_BASE_VIEWPORT_SIZE) * 100}%`,
    top: `${(y / MAP_BASE_VIEWPORT_SIZE) * 100}%`,
  };
};

const mapImageStyle: CSSProperties = {
  width: `${(MAP_RENDER_WIDTH / MAP_BASE_VIEWPORT_SIZE) * 100}%`,
  left: `${(MAP_RENDER_OFFSET_X / MAP_BASE_VIEWPORT_SIZE) * 100}%`,
  top: `${(MAP_RENDER_OFFSET_Y / MAP_BASE_VIEWPORT_SIZE) * 100}%`,
};

type MapPoint = {
  x: number;
  y: number;
};

type PinchState = {
  distance: number;
  center: MapPoint;
  scale: number;
  pan: MapPoint;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const clampScale = (scale: number) => clamp(scale, MAP_MIN_SCALE, MAP_MAX_SCALE);

const getViewportRatio = (viewportSize: number) => viewportSize / MAP_BASE_VIEWPORT_SIZE;

const getScaledInitialMapPan = (viewportSize: number) => {
  const ratio = getViewportRatio(viewportSize);

  return {
    x: INITIAL_MAP_PAN.x * ratio,
    y: INITIAL_MAP_PAN.y * ratio,
  };
};

const getScaledMapPoint = (tavern: Tavern, viewportSize: number) => {
  const ratio = getViewportRatio(viewportSize);
  const point = getMapPoint(tavern);

  return {
    x: point.x * ratio,
    y: point.y * ratio,
  };
};

const getFocusedMapPan = (tavern: Tavern, scale: number, viewportSize: number) => {
  const point = getScaledMapPoint(tavern, viewportSize);
  const center = viewportSize / 2;

  return {
    x: center - point.x * scale,
    y: center - point.y * scale,
  };
};

const clampMapPan = (pan: MapPoint, scale: number, viewportSize: number) => {
  const ratio = getViewportRatio(viewportSize);
  const renderOffsetX = MAP_RENDER_OFFSET_X * ratio;
  const renderOffsetY = MAP_RENDER_OFFSET_Y * ratio;
  const renderWidth = MAP_RENDER_WIDTH * ratio;
  const renderHeight = MAP_RENDER_HEIGHT * ratio;
  const minX = viewportSize - (renderOffsetX + renderWidth) * scale;
  const maxX = -renderOffsetX * scale;
  const minY = viewportSize - (renderOffsetY + renderHeight) * scale;
  const maxY = -renderOffsetY * scale;

  return {
    x: clamp(pan.x, minX, maxX),
    y: clamp(pan.y, minY, maxY),
  };
};

const getDistance = ([first, second]: MapPoint[]) =>
  Math.hypot(first.x - second.x, first.y - second.y);

const getCenter = ([first, second]: MapPoint[]) => ({
  x: (first.x + second.x) / 2,
  y: (first.y + second.y) / 2,
});

const getAnchoredPan = (
  pan: MapPoint,
  currentScale: number,
  nextScale: number,
  anchor: MapPoint,
) => {
  const mapX = (anchor.x - pan.x) / currentScale;
  const mapY = (anchor.y - pan.y) / currentScale;

  return {
    x: anchor.x - mapX * nextScale,
    y: anchor.y - mapY * nextScale,
  };
};

const getSelectedLabelClassName = (tavern: Tavern) => {
  const { x } = getMapPoint(tavern);
  if (x < 74) return 'left-0 translate-x-0';
  if (x > MAP_BASE_VIEWPORT_SIZE - 74) return 'right-0 translate-x-0';
  return 'left-1/2 -translate-x-1/2';
};

const getMarkerLabel = (tavern: Tavern) => String(tavern.boothId);

const getSelectedLabel = (tavern: Tavern) => tavern.name;

const getMarkerClassName = (selected: boolean) =>
  `flex size-7 items-center justify-center rounded-[14.5px] border-2 text-[14px] font-bold leading-none tracking-[-0.28px] ${
    selected ? 'border-[#ff3d3d] bg-white text-[#ff3d3d]' : 'border-white bg-[#ff3d3d] text-white'
  }`;

const getLabelClassName = (tavern: Tavern) =>
  `absolute bottom-[34px] z-20 whitespace-nowrap rounded-[4px] border border-[#ff3d3d] bg-white px-2.5 py-1.5 text-[14px] font-semibold leading-none tracking-[-0.28px] text-[#ff3d3d] shadow-sm ${getSelectedLabelClassName(
    tavern,
  )}`;

type CampusMapProps = {
  interactive?: boolean;
  taverns: Tavern[];
  selectedTavern: Tavern | null;
  onSelectTavern: (tavern: Tavern) => void;
};

export default function CampusMap({
  interactive = true,
  taverns,
  selectedTavern,
  onSelectTavern,
}: CampusMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState(MAP_BASE_VIEWPORT_SIZE);
  const [mapScale, setMapScale] = useState(MAP_DEFAULT_SCALE);
  const [mapPan, setMapPan] = useState(getScaledInitialMapPan(MAP_BASE_VIEWPORT_SIZE));
  const [isGestureActive, setIsGestureActive] = useState(false);
  const pointerMapRef = useRef(new Map<number, MapPoint>());
  const lastDragPointRef = useRef<MapPoint | null>(null);
  const pinchStateRef = useRef<PinchState | null>(null);
  const scaleRef = useRef(MAP_DEFAULT_SCALE);
  const panRef = useRef(getScaledInitialMapPan(MAP_BASE_VIEWPORT_SIZE));

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateViewportSize = () => {
      const nextSize = viewport.getBoundingClientRect().width;
      if (nextSize <= 0) return;

      const nextPan = getScaledInitialMapPan(nextSize);
      setViewportSize(nextSize);
      scaleRef.current = MAP_DEFAULT_SCALE;
      panRef.current = nextPan;
      setMapScale(MAP_DEFAULT_SCALE);
      setMapPan(nextPan);
    };

    updateViewportSize();

    const resizeObserver = new ResizeObserver(updateViewportSize);
    resizeObserver.observe(viewport);

    return () => resizeObserver.disconnect();
  }, []);

  const applyMapViewport = (nextScale: number, nextPan: MapPoint) => {
    const clampedScale = clampScale(nextScale);
    const clampedPan = clampMapPan(nextPan, clampedScale, viewportSize);

    scaleRef.current = clampedScale;
    panRef.current = clampedPan;
    setMapScale(clampedScale);
    setMapPan(clampedPan);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    pointerMapRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    setIsGestureActive(true);

    const points = Array.from(pointerMapRef.current.values());
    if (points.length === 1) {
      lastDragPointRef.current = points[0];
      pinchStateRef.current = null;
      return;
    }

    if (points.length === 2) {
      const distance = getDistance(points);
      if (distance === 0) return;

      lastDragPointRef.current = null;
      pinchStateRef.current = {
        distance,
        center: getCenter(points),
        scale: scaleRef.current,
        pan: panRef.current,
      };
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;

    if (!pointerMapRef.current.has(event.pointerId)) return;

    pointerMapRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = Array.from(pointerMapRef.current.values());

    if (points.length >= 2 && pinchStateRef.current) {
      event.preventDefault();
      const pinchState = pinchStateRef.current;
      if (pinchState.distance === 0) return;

      const nextScale = clampScale(pinchState.scale * (getDistance(points) / pinchState.distance));
      const nextPan = getAnchoredPan(
        pinchState.pan,
        pinchState.scale,
        nextScale,
        pinchState.center,
      );

      applyMapViewport(nextScale, nextPan);
      return;
    }

    if (points.length === 1 && lastDragPointRef.current) {
      event.preventDefault();
      const point = points[0];
      const deltaX = point.x - lastDragPointRef.current.x;
      const deltaY = point.y - lastDragPointRef.current.y;
      lastDragPointRef.current = point;

      applyMapViewport(scaleRef.current, {
        x: panRef.current.x + deltaX,
        y: panRef.current.y + deltaY,
      });
    }
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;

    pointerMapRef.current.delete(event.pointerId);

    const points = Array.from(pointerMapRef.current.values());
    if (points.length === 0) {
      lastDragPointRef.current = null;
      pinchStateRef.current = null;
      setIsGestureActive(false);
      return;
    }

    lastDragPointRef.current = points[0];
    pinchStateRef.current = null;
  };

  const handleZoom = (delta: number) => {
    const nextScale = clampScale(scaleRef.current + delta);
    const center = { x: viewportSize / 2, y: viewportSize / 2 };
    const nextPan = getAnchoredPan(panRef.current, scaleRef.current, nextScale, center);

    applyMapViewport(nextScale, nextPan);
  };

  const handleReset = () => {
    applyMapViewport(MAP_DEFAULT_SCALE, getScaledInitialMapPan(viewportSize));
  };

  const handleSelectTavern = (tavern: Tavern) => {
    onSelectTavern(tavern);

    if (!interactive) return;

    const nextScale = clampScale(MAP_FOCUS_SCALE);
    const nextPan = getFocusedMapPan(tavern, nextScale, viewportSize);
    setIsGestureActive(false);
    applyMapViewport(nextScale, nextPan);
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <div
        ref={viewportRef}
        className={`relative aspect-square w-full overflow-hidden border border-[#e5e5e5] bg-white ${
          interactive ? 'touch-none' : ''
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div
          className="absolute left-0 top-0 size-full origin-top-left"
          style={{
            transform: `translate3d(${mapPan.x}px, ${mapPan.y}px, 0) scale(${mapScale})`,
            transition: isGestureActive ? 'none' : 'transform 180ms ease-out',
          }}
        >
          <img
            src={tavernMapImage}
            alt="대동제 주막 지도"
            className="pointer-events-none absolute h-auto max-w-none select-none"
            style={mapImageStyle}
            draggable={false}
          />
          {taverns.map((tavern) => {
            const selected = selectedTavern?.id === tavern.id;

            return (
              <button
                key={tavern.id}
                type="button"
                aria-label={`${tavern.name} 지도 위치: ${tavern.location}`}
                aria-pressed={selected}
                className={`absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center ${
                  interactive ? '' : 'pointer-events-none'
                }`}
                style={getMapMarkerStyle(tavern)}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => handleSelectTavern(tavern)}
              >
                {selected && (
                  <span className={getLabelClassName(tavern)}>{getSelectedLabel(tavern)}</span>
                )}
                <span className={getMarkerClassName(selected)}>{getMarkerLabel(tavern)}</span>
              </button>
            );
          })}
        </div>
        <div className="absolute right-[13px] top-[13px] z-30 flex w-[50px] flex-col gap-0.5">
          <span className="flex h-[18px] items-center justify-center bg-[#ff3d3d] px-1 text-[7.5px] font-semibold leading-none tracking-[-0.1px] text-white">
            주막
          </span>
          <span className="flex h-[18px] items-center justify-center bg-[#0e9bf3] px-1 text-[7.5px] font-semibold leading-none tracking-[-0.1px] text-white">
            일청담 광장
          </span>
          <span className="flex h-[18px] items-center justify-center bg-[#15ccb1] px-1 text-[7.5px] font-semibold leading-none tracking-[-0.1px] text-white">
            부스
          </span>
        </div>
      </div>
      {interactive && (
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1 rounded-full border border-black/10 bg-black/[0.03] py-2.5 text-[14px] font-medium leading-[1.5] text-[#1a1a1a] backdrop-blur-[2px] transition disabled:opacity-40"
            onClick={() => handleZoom(-MAP_ZOOM_STEP)}
            disabled={mapScale <= MAP_MIN_SCALE}
          >
            <FiMinus aria-hidden className="size-5" />
            축소
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1 rounded-full border border-black/10 bg-black/[0.03] py-2.5 text-[14px] font-medium leading-[1.5] text-[#1a1a1a] backdrop-blur-[2px] transition"
            onClick={handleReset}
          >
            <FiCircle aria-hidden className="size-5" />
            원점
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1 rounded-full border border-black/10 bg-black/[0.03] py-2.5 text-[14px] font-medium leading-[1.5] text-[#1a1a1a] backdrop-blur-[2px] transition disabled:opacity-40"
            onClick={() => handleZoom(MAP_ZOOM_STEP)}
            disabled={mapScale >= MAP_MAX_SCALE}
          >
            <FiPlus aria-hidden className="size-5" />
            확대
          </button>
        </div>
      )}
    </div>
  );
}
