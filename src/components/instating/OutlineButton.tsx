interface OutlineButtonProps {
  label: string;
  icon?: string;
  dark?: boolean;
}

const wantedSans = { fontFamily: '"Wanted Sans", sans-serif' };

const OutlineButton = ({ label, icon, dark = false }: OutlineButtonProps) => {
  return (
    <button
      type="button"
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-5 py-2.5 ${
        dark ? 'border-white bg-[#1a1a1a] text-white' : 'border-black bg-transparent text-[#111]'
      }`}
    >
      <span className="text-sm leading-relaxed whitespace-nowrap" style={wantedSans}>
        {label}
      </span>
      {icon && <img alt="" className="size-6" src={icon} />}
    </button>
  );
};

export default OutlineButton;
