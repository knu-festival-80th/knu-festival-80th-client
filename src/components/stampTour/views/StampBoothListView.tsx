import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeUpVariant } from '@/constants/animation';
import { BOOTHS } from '@/constants/stampTour';
import BoothCard from '@/components/stampTour/BoothCard';

const StampBoothListView = () => {
  const [openBoothId, setOpenBoothId] = useState<number | null>(BOOTHS[0]?.id ?? null);

  const handleDetailClick = (id: number) => {
    setOpenBoothId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          'linear-gradient(to bottom, rgba(255,218,61,0.3) 0%, rgba(255,141,101,0.3) 49%, rgba(255,61,144,0.3) 100%)',
      }}
    >
      <div className="mx-auto flex w-full max-w-[450px] flex-col gap-5 px-5 pb-32 pt-7">
        <motion.h1
          className="font-wanted-sans text-subheading font-bold tracking-tight text-ink"
          {...fadeUpVariant}
        >
          부스 목록
        </motion.h1>

        <ul className="flex flex-col gap-[30px]">
          {BOOTHS.map((booth, index) => (
            <motion.li
              key={booth.id}
              {...fadeUpVariant}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ ...fadeUpVariant.transition, delay: index * 0.08 }}
            >
              <BoothCard
                {...booth}
                isExpanded={openBoothId === booth.id}
                onDetailClick={() => handleDetailClick(booth.id)}
              />
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StampBoothListView;
