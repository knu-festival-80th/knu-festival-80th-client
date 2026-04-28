import { AnimatePresence, motion } from 'framer-motion';

import { useScratchCanvas } from '@/hooks/instating/useScratchCanvas';

interface ScratchCardProps {
  instagramId?: string;
  onRevealed?: () => void;
}

const ScratchCard = ({ instagramId = 'instagram_id', onRevealed }: ScratchCardProps) => {
  const { canvasRef, revealed, handlers } = useScratchCanvas({ onRevealed });

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-md" style={{ height: 176 }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <p className="text-xs font-medium tracking-widest text-gray-400">MATCHED</p>
        <p className="text-2xl font-bold tracking-tight text-gray-900">@{instagramId}</p>
        <AnimatePresence>
          {revealed && (
            <motion.p
              key="celebrate"
              initial={{ opacity: 0, scale: 0.5, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-lg"
            >
              ✨ 🎉 ✨
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {!revealed && (
          <motion.canvas
            key="scratch"
            ref={canvasRef}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
            className="absolute inset-0 h-full w-full touch-none select-none"
            {...handlers}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScratchCard;
