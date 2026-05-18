import type { RollingPaperStickerColorId } from '@/constants/rollingPaper';
import type { PlacedRollingPaperNote } from '@/lib/rollingPaperLayout';

export type RollingPaperWriteStep = 'compose' | 'place';

export type RollingPaperWriteModalProps = {
  isOpen: boolean;
  boardVariant: number;
  frameVariant: number;
  placedNotes: PlacedRollingPaperNote[];
  isSubmitting?: boolean;
  isPlacementSyncing?: boolean;
  placementErrorMessage?: string | null;
  onClose: () => void;
  onPlacementErrorClear?: () => void;
  onPlacementSyncRequest?: (options?: { immediate?: boolean }) => void;
  onPlace: (note: PlacedRollingPaperNote) => void | Promise<void>;
};

export type RollingPaperWriteStepBaseProps = {
  colorId: RollingPaperStickerColorId;
  message: string;
};
