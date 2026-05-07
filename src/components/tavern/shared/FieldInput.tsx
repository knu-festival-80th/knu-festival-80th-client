type FieldInputProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  autoComplete?: string;
  inputMode?: 'numeric';
  onChange: (value: string) => void;
};

export default function FieldInput({
  id,
  label,
  placeholder,
  value,
  autoComplete,
  inputMode,
  onChange,
}: FieldInputProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="text-[16px] font-semibold leading-[1.5] tracking-[-0.16px]">{label}</span>
      <input
        id={id}
        type="text"
        className="h-[51px] rounded-[8px] border border-[#e5e5e5] px-4 text-[16px] leading-none tracking-[-0.32px] outline-none placeholder:text-[#808080] focus:border-[#ff3d3d]"
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
