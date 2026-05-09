interface OutlineButtonProps {
  label: string;
  icon?: string;
  dark?: boolean;
  onClick?: () => void;
}

const OutlineButton = ({ label, icon, dark = false, onClick }: OutlineButtonProps) => {
  return (
    <button
      type="button"
      className={`flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-5 py-2.5 ${
        dark ? 'border-white bg-[#1a1a1a] text-white' : 'border-black bg-transparent text-[#111]'
      }`}
      onClick={onClick}
    >
      <span className="font-wanted-sans text-sm leading-relaxed whitespace-nowrap">{label}</span>
      {icon && <img alt="" className="size-6" src={icon} />}
    </button>
  );
};

export default OutlineButton;
