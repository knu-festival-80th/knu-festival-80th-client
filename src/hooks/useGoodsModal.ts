import { useState } from 'react';

import type { GoodsItem } from '@/types/goods';

export const useGoodsModal = () => {
  const [selectedGoods, setSelectedGoods] = useState<GoodsItem | null>(null);

  return {
    selectedGoods,
    openModal: (goods: GoodsItem) => setSelectedGoods(goods),
    closeModal: () => setSelectedGoods(null),
  };
};
