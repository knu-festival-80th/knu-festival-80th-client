import { useRef } from 'react';
import { FiMapPin } from 'react-icons/fi';

import tavernMapImage from '@/assets/images/tavern-map.svg';
import { festivalMap } from '@/constants/taverns';

type MapLocationPickerProps = {
  xRatio: number | null;
  yRatio: number | null;
  onChange: (x: number, y: number) => void;
};

export default function MapLocationPicker({ xRatio, yRatio, onChange }: MapLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    onChange(Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-[var(--admin-text-muted)]">
        지도를 클릭하여 부스 위치를 지정하세요.
      </p>
      <div
        ref={mapRef}
        className="relative cursor-crosshair overflow-hidden rounded-lg border border-[var(--admin-border)]"
        style={{ aspectRatio: `${festivalMap.width} / ${festivalMap.height}` }}
        onClick={handleClick}
      >
        <img
          src={tavernMapImage}
          alt="축제 지도"
          className="absolute inset-0 size-full object-cover"
          draggable={false}
        />
        {xRatio !== null && yRatio !== null && (
          <div
            className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${xRatio * 100}%`, top: `${yRatio * 100}%` }}
          >
            <span className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#ff3d3d] shadow-lg">
              <FiMapPin className="text-white" size={16} />
            </span>
          </div>
        )}
      </div>
      {xRatio !== null && yRatio !== null && (
        <p className="text-xs tabular-nums text-[var(--admin-text-muted)]">
          X: {xRatio.toFixed(3)} / Y: {yRatio.toFixed(3)}
        </p>
      )}
    </div>
  );
}
