import { Link } from 'react-router-dom';
import { LuChevronDown } from 'react-icons/lu';
import type { NavSection } from '@/types/navigationDrawer';

export interface NavSectionItemProps {
  item: NavSection;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const NavSectionItem = ({
  item,
  isExpanded,
  isActive,
  onToggle,
  onClose,
}: NavSectionItemProps) => {
  return (
    <div className="border-t border-gray-200">
      <button
        type="button"
        className={`flex w-full items-center justify-between px-5 text-left font-wanted-sans text-[1.25rem] font-bold leading-none tracking-[-0.025rem] ${
          isExpanded ? 'border-b border-gray-200' : ''
        } ${
          isActive
            ? 'bg-[linear-gradient(90deg,#FF0026_0%,#FF9500_100%)] py-3.25 text-white'
            : 'bg-transparent py-3.5 text-black'
        }`}
        onClick={onToggle}
      >
        <span>{item.label}</span>
        <LuChevronDown
          size={20}
          className={`shrink-0 transition-transform duration-200 ${
            isExpanded ? '' : 'rotate-180'
          } ${isActive ? 'text-white' : 'text-black/70'}`}
        />
      </button>

      <div
        className={`overflow-hidden bg-transparent transition-all duration-200 ${
          isExpanded ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="flex flex-col gap-5 px-5 py-3.5">
          {item.children.map((child) => (
            <Link
              key={child.label}
              to={child.to}
              onClick={onClose}
              className="font-wanted-sans text-[1rem] font-normal leading-none tracking-[-0.02rem] text-black/70"
            >
              {'- ' + child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
