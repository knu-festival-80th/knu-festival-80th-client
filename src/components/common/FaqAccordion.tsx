import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  label?: string;
  title?: string;
  items: FaqItem[];
}

export const FaqAccordion = ({
  label = 'FAQ',
  title = '자주 묻는 질문',
  items,
}: FaqAccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="flex w-full flex-col gap-12">
      <div className="flex flex-col gap-2.5 px-5">
        <p className="font-wanted-sans text-base font-bold leading-none tracking-[-0.02rem] text-black">
          {label}
        </p>
        <p className="font-wanted-sans text-[18px] font-semibold leading-none tracking-[-0.02rem] text-black">
          {title}
        </p>
      </div>
      <div className="flex flex-col gap-2.5 px-5">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="bg-[#efefef] p-5">
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3"
                onClick={() => toggle(index)}
              >
                <span className="text-left font-wanted-sans text-base font-bold leading-none tracking-[-0.02rem] text-black">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown className="size-8 text-black" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="pt-3 font-wanted-sans text-base font-medium leading-normal tracking-[-0.02rem] text-[#4d4d4d]">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
