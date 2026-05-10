type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  variant?: 'large' | 'small';
};

export default function SectionHeading({ eyebrow, title, variant = 'large' }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[16px] font-bold leading-none tracking-[-0.32px]">{eyebrow}</p>
      <h2
        className={`whitespace-pre-line ${
          variant === 'large'
            ? 'text-[20px] font-bold leading-[1.4] tracking-[-0.4px]'
            : 'text-[18px] font-semibold leading-none tracking-[-0.36px]'
        }`}
      >
        {title}
      </h2>
    </div>
  );
}
