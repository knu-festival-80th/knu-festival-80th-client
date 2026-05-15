import { Map as MapIcon } from 'lucide-react';
import { useState } from 'react';
import { FiMapPin } from 'react-icons/fi';

import tavernMapImage from '@/assets/images/map.svg';
import { festivalMap } from '@/constants/taverns';

import MapPickerModal from './MapPickerModal';

type MapLocationPickerProps = {
  xRatio: number | null;
  yRatio: number | null;
  onChange: (x: number, y: number) => void;
};

export default function MapLocationPicker({ xRatio, yRatio, onChange }: MapLocationPickerProps) {
  const [open, setOpen] = useState(false);
  const hasPin = xRatio !== null && yRatio !== null;

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative shrink-0 overflow-hidden rounded-lg border border-[var(--admin-border)] bg-white transition-colors hover:border-[var(--admin-primary)]"
        style={{
          width: 140,
          aspectRatio: `${festivalMap.width} / ${festivalMap.height}`,
        }}
        aria-label="지도에서 위치 선택"
      >
        <img
          src={tavernMapImage}
          alt=""
          className="absolute inset-0 size-full object-cover"
          draggable={false}
        />
        {hasPin && (
          <span
            className="absolute z-10 flex h-5 w-5 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full border-2 border-white bg-[#ff3d3d] shadow-md"
            style={{ left: `${(xRatio as number) * 100}%`, top: `${(yRatio as number) * 100}%` }}
          >
            <FiMapPin className="text-white" size={10} />
          </span>
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 w-fit items-center gap-1.5 rounded-lg bg-[var(--admin-primary)] px-3 text-[13px] font-semibold text-white hover:opacity-90"
        >
          <MapIcon size={14} />
          {hasPin ? '위치 변경' : '지도에서 위치 선택'}
        </button>
        {hasPin ? (
          <p className="tabular text-xs text-[var(--admin-text-muted)]">
            X {(xRatio as number).toFixed(3)} · Y {(yRatio as number).toFixed(3)}
          </p>
        ) : (
          <p className="text-xs text-[var(--admin-text-faint)]">
            지도에서 정확한 부스 위치를 지정해 주세요.
          </p>
        )}
      </div>

      <MapPickerModal
        open={open}
        initialX={xRatio}
        initialY={yRatio}
        onConfirm={(x, y) => {
          onChange(x, y);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
