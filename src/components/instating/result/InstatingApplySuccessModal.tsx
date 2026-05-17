import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CountDownTimer from '../intro/CountDownTimer';
import { useMatchingStatus } from '@/hooks/instating/useMatchingStatus';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export type SubmittedData = {
  gender: 'male' | 'female';
  instagramId: string;
  phone: string;
};

interface Props {
  data: SubmittedData;
  onClose: () => void;
}

const InstatingApplySuccessModal = ({ data, onClose }: Props) => {
  useBodyScrollLock();
  const navigate = useNavigate();
  const { data: status } = useMatchingStatus();
  const revealDeadline = status?.resultOpenAt ? new Date(status.resultOpenAt) : new Date(0);

  const handleClose = () => {
    onClose();
    navigate('/instating');
  };

  const infoRows = [
    { label: '성별', value: data.gender === 'male' ? '남성' : '여성' },
    { label: '인스타 ID', value: data.instagramId },
    { label: '연락처', value: data.phone },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-[335px] overflow-hidden rounded-xl bg-surface pb-6 pt-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5">
          <div className="size-8" />
          <h2
            id="success-modal-title"
            className="font-wanted-sans text-heading3 font-semibold tracking-tight text-ink"
          >
            신청 완료!
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="닫기"
            className="flex size-8 items-center justify-center"
          >
            <X className="size-5 text-ink" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-5 flex flex-col gap-[18px] px-6">
          <div className="flex flex-col items-center gap-6 px-5">
            {/* Countdown */}
            <div className="flex flex-col items-center gap-1">
              <p className="font-wanted-sans text-body1 font-medium tracking-tight text-gray">
                인스타팅 매칭 완료까지
              </p>
              <CountDownTimer deadline={revealDeadline} />
            </div>

            <div className="h-px w-full bg-border" />

            {/* Info rows */}
            <div className="flex w-full flex-col gap-2.5">
              {infoRows.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between font-wanted-sans text-body1 font-medium tracking-tight"
                >
                  <span className="text-gray">{label}</span>
                  <span className="text-ink">{value}</span>
                </div>
              ))}
            </div>

            <div className="h-px w-full bg-border" />
          </div>

          {/* Notice */}
          <div className="rounded-md bg-[#f9f9f9] p-4">
            <p className="font-wanted-sans text-body2 font-medium leading-[1.5] tracking-tight text-gray">
              신청자 성비에 따라 매칭이 이루어지기 때문에,
              <br />
              일부 인원은 매칭이 성사되지 않을 수 있습니다.
            </p>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
};

export default InstatingApplySuccessModal;
