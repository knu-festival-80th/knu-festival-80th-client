import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { GoodsItem } from '@/types/goods';

export interface GoodsModalProps {
  goods: GoodsItem;
  onClose: () => void;
}
export const GoodsModal = ({ goods, onClose }: GoodsModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: index * scrollRef.current.clientWidth, behavior: 'smooth' });
    setCurrentIndex(index);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute left-1/2 top-29.25 w-83.75 -translate-x-1/2 overflow-hidden rounded-xl bg-white pb-6">
        <div className="flex flex-col gap-8">
          <div className="relative">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {goods.images.map((img, i) => (
                <div
                  key={i}
                  className="flex h-83.75 w-83.75 shrink-0 snap-start items-center justify-center"
                >
                  <img
                    src={img}
                    alt={`${goods.name} ${i + 1}`}
                    className="h-full w-full object-contain p-4"
                  />
                </div>
              ))}
            </div>
            {goods.images.length > 1 && (
              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5">
                {goods.images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollToIndex(i)}
                    className={`size-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-ink' : 'bg-[#d9d9d9]'}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5 px-5">
            <p className="font-wanted-sans text-xl font-bold leading-none tracking-[-0.02em] text-ink">
              {goods.name}
            </p>
            <p className="font-wanted-sans text-sm font-medium leading-none tracking-[-0.02em] text-gray">
              {goods.description}
            </p>
          </div>

          <div className="px-5">
            <button
              type="button"
              className="flex h-12.5 w-full items-center justify-center rounded-lg bg-[#ff3d3d]"
            >
              <span className="font-wanted-sans text-base font-medium leading-none tracking-[-0.02em] text-white">
                굿즈 상세정보 보기
              </span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-4"
          aria-label="닫기"
        >
          <X className="size-8 text-ink" />
        </button>
      </div>
    </div>
  );
};
