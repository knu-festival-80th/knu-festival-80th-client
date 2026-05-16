import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

interface Props {
  title: string;
  description: React.ReactNode;
  buttonLabel?: string;
  onClose: () => void;
}

const AlertModal = ({ title, description, buttonLabel = '돌아가기', onClose }: Props) => {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-modal-title"
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-[335px] overflow-hidden rounded-[12px] bg-white py-6"
      >
        <div className="flex w-full flex-col items-center gap-[30px]">
          <div className="flex w-full flex-col items-start gap-5">
            <div className="flex w-full items-center justify-center px-5">
              <h2
                id="alert-modal-title"
                className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.36px] text-black"
              >
                {title}
              </h2>
            </div>
            <div className="flex w-full flex-col items-center px-6">
              <p className="whitespace-pre-line text-center font-wanted-sans text-[16px] font-medium leading-[1.6] tracking-[-0.32px] text-[#808080]">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-[50px] w-[287px] rounded-lg bg-[#ff3d3d] font-wanted-sans text-[16px] font-medium leading-none tracking-[-0.32px] text-white"
          >
            {buttonLabel}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
};

export default AlertModal;
