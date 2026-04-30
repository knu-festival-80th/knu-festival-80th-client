import { Link } from 'react-router-dom';
import type { NavLeaf } from '@/types/navigationDrawer';

export interface NavLeafItemProps {
  item: NavLeaf;
  onClose: () => void;
}

export const NavLeafItem = ({ item, onClose }: NavLeafItemProps) => {
  return (
    <Link
      to={item.to}
      onClick={onClose}
      className="flex w-full items-center border-t border-gray-200 bg-transparent px-5 py-3.5 font-wanted-sans text-[1.25rem] font-bold leading-none tracking-[-0.025rem] text-black"
    >
      {item.label}
    </Link>
  );
};
