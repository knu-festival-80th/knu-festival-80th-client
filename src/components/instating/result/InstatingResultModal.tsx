import { AnimatePresence, motion, useAnimate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import ScratchCard from './ScratchCard';
import MatchSuccessCard from './MatchSuccessCard';
import MatchFailureCard from './MatchFailureCard';
import { useInstatingScratchCanvas } from '@/hooks/instating/useInstatingScratchCanvas';
import { useHeartParticles } from '@/hooks/instating/useHeartParticles';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export type MatchResult = { matched: true; instagramId: string } | { matched: false };

type Phase = 'idle' | 'scratching' | 'success' | 'failure';

const PHASE_CONFIG: Record<Phase, { subtitle: string; bgColor: string }> = {
  idle: { subtitle: '나의 매칭 상대는?', bgColor: '#f6f7ff' },
  scratching: { subtitle: '상대 정보 찾는 중...', bgColor: '#f6f7ff' },
  success: { subtitle: '매칭 성공!', bgColor: '#fff6f7' },
  failure: { subtitle: '이번엔 아쉽게도...', bgColor: '#fff6f7' },
};

interface InstatingResultModalProps {
  onClose: () => void;
  result: MatchResult;
}

const InstatingResultModal = ({ onClose, result }: InstatingResultModalProps) => {
  useBodyScrollLock();
  const { canvasRef, revealed, handlers } = useInstatingScratchCanvas();
  const { canvasRef: particleCanvasRef, emit: emitParticles } = useHeartParticles();
  const [hasStartedScratching, setHasStartedScratching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cardScope, animateCard] = useAnimate();
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const phase: Phase = !result.matched
    ? 'failure'
    : revealed
      ? 'success'
      : hasStartedScratching
        ? 'scratching'
        : 'idle';

  const { subtitle, bgColor } = PHASE_CONFIG[phase];

  const wrappedHandlers = {
    ...handlers,
    onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!hasStartedScratching) setHasStartedScratching(true);
      animateCard(
        cardScope.current,
        { rotate: [-0.8, 0.8] },
        { repeat: Infinity, repeatType: 'mirror', duration: 0.12, ease: 'easeInOut' },
      );
      handlers.onPointerDown(e);
    },
    onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.buttons > 0) {
        const rect = e.currentTarget.getBoundingClientRect();
        emitParticles(e.clientX - rect.left, e.clientY - rect.top);
      }
      handlers.onPointerMove(e);
    },
    onPointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => {
      animateCard(cardScope.current, { rotate: 0 }, { duration: 0.15 });
      handlers.onPointerUp(e);
    },
  };

  const handleCopy = async () => {
    if (!result.matched) return;
    try {
      await navigator.clipboard.writeText(`@${result.instagramId}`);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return createPortal(
    <div className="fixed inset-y-0 left-1/2 z-50 w-full max-w-[600px] -translate-x-1/2 overflow-hidden">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-modal-title"
        className="flex h-full flex-col"
        initial={{ x: '100%' }}
        animate={{ x: 0, backgroundColor: bgColor }}
        transition={{
          x: { type: 'tween', ease: 'easeOut', duration: 0.35 },
          backgroundColor: { duration: 0.3 },
        }}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-white px-5 py-5">
          <div className="size-6" />
          <h1
            id="result-modal-title"
            className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.36px] text-black"
          >
            결과 조회
          </h1>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex size-6 items-center justify-center"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </header>

        <main className="flex flex-col items-center gap-8 overflow-y-auto px-5 pb-8 pt-10">
          {/* Title */}
          <div className="flex flex-col items-center gap-[10px] leading-none">
            <p className="font-wanted-sans text-[16px] tracking-[-0.32px] text-[#808080]">
              두근두근 인스타팅
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={subtitle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="font-wanted-sans text-[24px] font-bold tracking-[-0.48px] text-black"
              >
                {subtitle}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Card */}
          {!result.matched ? (
            <MatchFailureCard />
          ) : (
            <AnimatePresence mode="wait">
              {!revealed ? (
                <motion.div
                  key="scratch"
                  ref={cardScope}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ScratchCard
                    canvasRef={canvasRef}
                    particleCanvasRef={particleCanvasRef}
                    handlers={wrappedHandlers}
                    hideLabel={hasStartedScratching}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="revealed"
                  initial={{ opacity: 0, scale: 0.88, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  <MatchSuccessCard
                    instagramId={result.instagramId}
                    copied={copied}
                    onCopy={handleCopy}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </motion.div>
    </div>,
    document.body,
  );
};

export default InstatingResultModal;
