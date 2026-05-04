type Variant = 'default' | 'red' | 'glass' | 'dark';

interface OutlineButtonProps {
  label: string;
  showArrow?: boolean;
  variant?: Variant;
}

const variantStyles: Record<Variant, { container: string; text: string; arrow: string }> = {
  default: {
    container: 'border-black bg-transparent',
    text: 'text-[#111]',
    arrow: '#111111',
  },
  red: {
    container: 'border-[#FF3D3D] bg-transparent',
    text: 'text-[#FF3D3D]',
    arrow: '#FF3D3D',
  },
  glass: {
    container: 'border-white/50 bg-white/30',
    text: 'text-[#1A1A1A]',
    arrow: '#1A1A1A',
  },
  dark: {
    container: 'border-white bg-[#1a1a1a]',
    text: 'text-white',
    arrow: '#ffffff',
  },
};

const OutlineButton = ({ label, showArrow = false, variant = 'default' }: OutlineButtonProps) => {
  const styles = variantStyles[variant];
  return (
    <button
      type="button"
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-5 py-2.5 ${styles.container}`}
    >
      <span className={`font-wanted-sans text-sm leading-relaxed whitespace-nowrap ${styles.text}`}>
        {label}
      </span>
      {showArrow && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"
            fill={styles.arrow}
          />
        </svg>
      )}
    </button>
  );
};

export default OutlineButton;
