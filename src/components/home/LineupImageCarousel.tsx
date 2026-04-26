import { useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import type { Artist } from '@/types/home';
import LineupImage from './LineupImage';

const ITEM_WIDTH = 312;
const GAP = 16;

type LineupImageCarouselProps = {
  artists: Artist[];
};

export default function LineupImageCarousel({ artists }: LineupImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const targetX = -currentIndex * (ITEM_WIDTH + GAP);

  const onDragEnd = (_event: unknown, info: PanInfo) => {
    if (info.offset.x < -50 || info.velocity.x < -500) {
      setCurrentIndex((prev) => Math.min(prev + 1, artists.length - 1));
    } else if (info.offset.x > 50 || info.velocity.x > 500) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <div className="overflow-hidden">
      <motion.div
        drag="x"
        dragConstraints={{ left: -(artists.length - 1) * (ITEM_WIDTH + GAP), right: 0 }}
        dragElastic={0.1}
        animate={{ x: targetX }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onDragEnd={onDragEnd}
        className="flex cursor-grab select-none gap-4 active:cursor-grabbing"
      >
        {artists.map((artist) => (
          <LineupImage key={artist.alt} src={artist.src} alt={artist.alt} />
        ))}
      </motion.div>
    </div>
  );
}
