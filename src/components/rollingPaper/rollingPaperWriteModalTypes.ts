import type { RollingPaperStickerColorId } from '@/constants/rollingPaper';
import type { PlacedRollingPaperNote } from '@/lib/rollingPaperLayout';

export type RollingPaperWriteStep = 'compose' | 'place';

export type RollingPaperWriteModalProps = {
  isOpen: boolean;
  boardVariant: number;
  placedNotes: PlacedRollingPaperNote[];
  isSubmitting?: boolean;
  onClose: () => void;
  onPlace: (note: PlacedRollingPaperNote) => void | Promise<void>;
};

export type RollingPaperWriteStepBaseProps = {
  colorId: RollingPaperStickerColorId;
  message: string;
};
