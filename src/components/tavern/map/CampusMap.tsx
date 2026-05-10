import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { FiMapPin, FiMinus, FiPlus } from 'react-icons/fi';

import tavernMapImage from '@/assets/images/tavern-map.svg';
import { festivalMap, taverns, type Tavern } from '@/constants/taverns';

const MAP_CANVAS_WIDTH = 640;
const MAP_MIN_SCALE = 1;
const MAP_MAX_SCALE = 2;
const MAP_SCALE_STEP = 0.25;

const clampRatio = (ratio: number) => Math.min(Math.max(ratio, 0), 1);
const clampMapScale = (scale: number) => Math.min(Math.max(scale, MAP_MIN_SCALE), MAP_MAX_SCALE);

const getMapMarkerStyle = (tavern: Tavern): CSSProperties => ({
  left: `${clampRatio(tavern.mapPosition.xRatio) * 100}%`,
  top: `${clampRatio(tavern.mapPosition.yRatio) * 100}%`,
});

type CampusMapProps = {
  selectedTavern: Tavern | null;
  onSelectTavern: (tavern: Tavern) => void;
};

export default function CampusMap({ selectedTavern, onSelectTavern }: CampusMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [mapScale, setMapScale] = useState(MAP_MIN_SCALE);

  const canvasWidth = MAP_CANVAS_WIDTH * mapScale;
  const canvasHeight = canvasWidth * (festivalMap.height / festivalMap.width);
  const canZoomOut = mapScale > MAP_MIN_SCALE;
  const canZoomIn = mapScale < MAP_MAX_SCALE;

  useEffect(() => {
    if (!selectedTavern) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const targetX = clampRatio(selectedTavern.mapPosition.xRatio) * canvasWidth;
    const targetY = clampRatio(selectedTavern.mapPosition.yRatio) * canvasHeight;

    viewport.scrollTo({
      left: Math.max(targetX - viewport.clientWidth / 2, 0),
      top: Math.max(targetY - viewport.clientHeight / 2, 0),
      behavior: 'smooth',
    });
  }, [canvasHeight, canvasWidth, selectedTavern]);

  const handleZoom = (direction: 'in' | 'out') => {
    setMapScale((currentScale) =>
      clampMapScale(currentScale + (direction === 'in' ? MAP_SCALE_STEP : -MAP_SCALE_STEP)),
    );
  };

  return (
    <div className="relative">
      <div
        className="absolute right-3 top-3 z-20 flex items-center overflow-hidden rounded-full border border-[#e5e5e5] bg-white/95 shadow-md"
        aria-label="지도 확대 축소"
      >
        <button
          type="button"
          className="flex size-9 items-center justify-center text-[#4d4d4d] disabled:text-[#cccccc]"
          aria-label="지도 축소"
          disabled={!canZoomOut}
          onClick={() => handleZoom('out')}
        >
          <FiMinus size={18} />
        </button>
        <span className="min-w-12 border-x border-[#e5e5e5] px-2 text-center text-[12px] font-semibold leading-9 text-[#4d4d4d]">
          {Math.round(mapScale * 100)}%
        </span>
        <button
          type="button"
          className="flex size-9 items-center justify-center text-[#4d4d4d] disabled:text-[#cccccc]"
          aria-label="지도 확대"
          disabled={!canZoomIn}
          onClick={() => handleZoom('in')}
        >
          <FiPlus size={18} />
        </button>
      </div>
      <div
        ref={viewportRef}
        className="relative h-[420px] max-h-[70dvh] overflow-auto rounded-[12px] border border-[#e5e5e5] bg-[#f9f9f9]"
      >
        <div
          className="relative overflow-hidden"
          style={{
            width: canvasWidth,
            aspectRatio: `${festivalMap.width} / ${festivalMap.height}`,
          }}
        >
          <img
            src={tavernMapImage}
            alt="대동제 주막 지도"
            className="absolute inset-0 size-full object-cover"
            draggable={false}
          />
          {taverns.map((tavern) => {
            const selected = selectedTavern?.id === tavern.id;

            return (
              <button
                key={tavern.id}
                type="button"
                aria-label={`${tavern.name} 지도 위치: ${tavern.mapPosition.label}`}
                aria-pressed={selected}
                className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                style={getMapMarkerStyle(tavern)}
                onClick={() => onSelectTavern(tavern)}
              >
                <span
                  className={`flex items-center justify-center rounded-full border shadow-md ${
                    selected
                      ? 'size-[34px] border-[#ff3d3d] bg-white ring-4 ring-[#ff3d3d]/15'
                      : 'size-7 border-white bg-[#ff3d3d]'
                  }`}
                >
                  <FiMapPin className={selected ? 'text-[#ff3d3d]' : 'text-white'} size={17} />
                </span>
                <span
                  className={`max-w-[82px] overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[12px] font-semibold leading-[1.4] tracking-[-0.24px] shadow-sm ${
                    selected ? 'text-[#ff3d3d]' : 'text-[#4d4d4d]'
                  }`}
                >
                  {tavern.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
