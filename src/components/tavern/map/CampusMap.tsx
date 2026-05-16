import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from 'react';
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
const INITIAL_MAP_PAN = { x: 500, y: 350 };

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
  height: `${(MAP_RENDER_HEIGHT / MAP_BASE_VIEWPORT_SIZE) * 100}%`,
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

const getMapTransform = (scale: number, pan: MapPoint) =>
  `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`;

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

const getMarkerLabel = (tavern: Tavern) => String(tavern.boothId);

const getSelectedLabel = (tavern: Tavern) => tavern.name;

const getTypeColor = (tavern: Tavern) => tavern.color;

const getMarkerStyle = (selected: boolean, tavern: Tavern): CSSProperties => {
  const color = getTypeColor(tavern);
  return selected
    ? { borderColor: color, backgroundColor: '#fff', color }
    : { borderColor: '#fff', backgroundColor: color, color: '#fff' };
};

const getLabelStyle = (tavern: Tavern): CSSProperties => {
  const color = getTypeColor(tavern);
  return { borderColor: color, color };
};

type CampusMapProps = {
  interactive?: boolean;
  focusSelected?: boolean;
  taverns: Tavern[];
  selectedTavern: Tavern | null;
  onSelectTavern: (tavern: Tavern) => void;
};

export default function CampusMap({
  interactive = true,
  focusSelected = false,
  taverns,
  selectedTavern,
  onSelectTavern,
}: CampusMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const mapLayerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState(MAP_BASE_VIEWPORT_SIZE);
  const [mapScale, setMapScale] = useState(MAP_DEFAULT_SCALE);
  const [mapPan, setMapPan] = useState(getScaledInitialMapPan(MAP_BASE_VIEWPORT_SIZE));
  const [isGestureActive, setIsGestureActive] = useState(false);
  const pointerMapRef = useRef(new Map<number, MapPoint>());
  const lastDragPointRef = useRef<MapPoint | null>(null);
  const pinchStateRef = useRef<PinchState | null>(null);
  const skipMarkerClickRef = useRef(false);
  const scaleRef = useRef(MAP_DEFAULT_SCALE);
  const panRef = useRef(getScaledInitialMapPan(MAP_BASE_VIEWPORT_SIZE));
  const selectedTavernRef = useRef<Tavern | null>(selectedTavern);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateViewportSize = () => {
      const nextSize = viewport.getBoundingClientRect().width;
      if (nextSize <= 0) return;

      if (focusSelected && selectedTavernRef.current) {
        const focusScale = clampScale(MAP_FOCUS_SCALE);
        const focusPan = clampMapPan(
          getFocusedMapPan(selectedTavernRef.current, focusScale, nextSize),
          focusScale,
          nextSize,
        );
        setViewportSize(nextSize);
        scaleRef.current = focusScale;
        panRef.current = focusPan;
        setMapScale(focusScale);
        setMapPan(focusPan);
        return;
      }

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
  }, [focusSelected]);

  useEffect(() => {
    selectedTavernRef.current = selectedTavern;

    if (!focusSelected || !selectedTavern || viewportSize <= 0) return;

    const animationFrame = window.requestAnimationFrame(() => {
      const focusScale = clampScale(MAP_FOCUS_SCALE);
      const focusPan = clampMapPan(
        getFocusedMapPan(selectedTavern, focusScale, viewportSize),
        focusScale,
        viewportSize,
      );

      scaleRef.current = focusScale;
      panRef.current = focusPan;
      setMapScale(focusScale);
      setMapPan(focusPan);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [focusSelected, selectedTavern, viewportSize]);

  const commitMapViewport = () => {
    setMapScale(scaleRef.current);
    setMapPan(panRef.current);
  };

  const applyMapViewport = (
    nextScale: number,
    nextPan: MapPoint,
    options: { commit?: boolean } = {},
  ) => {
    const clampedScale = clampScale(nextScale);
    const clampedPan = clampMapPan(nextPan, clampedScale, viewportSize);

    scaleRef.current = clampedScale;
    panRef.current = clampedPan;
    if (mapLayerRef.current) {
      mapLayerRef.current.style.transform = getMapTransform(clampedScale, clampedPan);
    }

    if (options.commit !== false) {
      commitMapViewport();
    }
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

      applyMapViewport(nextScale, nextPan, { commit: false });
      return;
    }

    if (points.length === 1 && lastDragPointRef.current) {
      event.preventDefault();
      const point = points[0];
      const deltaX = point.x - lastDragPointRef.current.x;
      const deltaY = point.y - lastDragPointRef.current.y;
      lastDragPointRef.current = point;

      applyMapViewport(
        scaleRef.current,
        {
          x: panRef.current.x + deltaX,
          y: panRef.current.y + deltaY,
        },
        { commit: false },
      );
    }
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;

    pointerMapRef.current.delete(event.pointerId);

    const points = Array.from(pointerMapRef.current.values());
    if (points.length === 0) {
      lastDragPointRef.current = null;
      pinchStateRef.current = null;
      commitMapViewport();
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

  const resetPointerGesture = () => {
    pointerMapRef.current.clear();
    lastDragPointRef.current = null;
    pinchStateRef.current = null;
    setIsGestureActive(false);
  };

  const handleMarkerPointerDown = (event: PointerEvent<HTMLButtonElement>, tavern: Tavern) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    event.stopPropagation();
    skipMarkerClickRef.current = true;
    resetPointerGesture();
    handleSelectTavern(tavern);
  };

  const handleMarkerClick = (event: MouseEvent<HTMLButtonElement>, tavern: Tavern) => {
    event.stopPropagation();

    if (skipMarkerClickRef.current) {
      skipMarkerClickRef.current = false;
      return;
    }

    handleSelectTavern(tavern);
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
          ref={mapLayerRef}
          className="absolute left-0 top-0 size-full origin-top-left"
          style={{
            transform: getMapTransform(mapScale, mapPan),
            transition: isGestureActive
              ? 'none'
              : 'transform 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        >
          <img
            src={tavernMapImage}
            alt="대동제 주막 지도"
            className="pointer-events-none absolute h-auto max-w-none select-none"
            style={mapImageStyle}
            decoding="async"
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
                className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center p-3 ${
                  selected ? 'z-30' : 'z-10'
                } ${interactive ? '' : 'pointer-events-none'}`}
                style={getMapMarkerStyle(tavern)}
                onPointerDown={(event) => handleMarkerPointerDown(event, tavern)}
                onPointerUp={(event) => event.stopPropagation()}
                onPointerCancel={(event) => event.stopPropagation()}
                onClick={(event) => handleMarkerClick(event, tavern)}
              >
                {selected && (
                  <span
                    className="absolute bottom-[55px] left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-[4px] border bg-white px-2.5 py-1.5 text-[14px] font-semibold leading-none tracking-[-0.28px] shadow-sm"
                    style={getLabelStyle(tavern)}
                  >
                    {getSelectedLabel(tavern)}
                  </span>
                )}
                <span
                  className="flex size-9.5 items-center justify-center rounded-[20px] border-2 text-[14px] font-bold leading-none tracking-[-0.28px]"
                  style={getMarkerStyle(selected, tavern)}
                >
                  {getMarkerLabel(tavern)}
                </span>
              </button>
            );
          })}
        </div>
        <div className="absolute right-[13px] top-[13px] z-30 flex w-[50px] flex-col gap-0.5">
          <span className="flex h-[18px] items-center justify-center bg-[#FFD4D6] px-1 text-[7.5px] font-semibold leading-none tracking-[-0.1px] text-[#66666]">
            주막
          </span>
          <span className="flex h-[18px] items-center justify-center bg-[#BFDAF4] px-1 text-[7.5px] font-semibold leading-none tracking-[-0.1px] text-[#66666]">
            일청담 광장
          </span>
          <span className="flex h-[18px] items-center justify-center bg-[#C6F2EB] px-1 text-[7.5px] font-semibold leading-none tracking-[-0.1px] text-[#66666]">
            부스
          </span>
          <span className="flex h-[18px] items-center justify-center bg-[#FFDBF5] px-1 text-[7.5px] font-semibold leading-none tracking-[-0.1px] text-[#66666]">
            스탬프 투어
          </span>
          <span className="flex h-[18px] items-center justify-center bg-[#FFFBD3] px-1 text-[7.5px] font-semibold leading-none tracking-[-0.1px] text-[#66666]">
            이벤트존
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
