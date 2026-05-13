import type { TabStep } from '@/types/hobanustagram';

export interface StepIndicatorProps {
  currentStep: TabStep;
}

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`flex size-7.5 items-center justify-center rounded-full font-wanted-sans text-base font-medium leading-none tracking-[-0.32px] ${
          currentStep === 1 ? 'bg-sub-red text-white' : 'bg-border text-text-disabled'
        }`}
      >
        1
      </div>
      <div className="w-10 border-t border-text-disabled" />
      <div
        className={`flex size-7.5 items-center justify-center rounded-full font-wanted-sans text-base font-medium leading-none tracking-[-0.32px] ${
          currentStep === 2 ? 'bg-sub-red text-white' : 'bg-border text-text-disabled'
        }`}
      >
        2
      </div>
    </div>
  );
};
